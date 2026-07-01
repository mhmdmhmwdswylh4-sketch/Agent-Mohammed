import "server-only"

import { createHash } from "node:crypto"
import {
  createSessionCookie,
  revokeUserTokens,
  verifyIdToken,
  verifySessionCookie,
  type VerifiedFirebaseUser,
} from "@/lib/firebase/admin"
import { SESSION } from "@/lib/config"
import { ForbiddenError, UnauthorizedError } from "@/lib/http/errors"
import type { User } from "@/lib/db/schema"
import type { UserRepository } from "@/modules/users/user.repository"
import type { SessionRepository } from "@/modules/auth/session.repository"
import type { AuditRepository } from "@/modules/audit/audit.repository"

export interface RequestMeta {
  ipAddress?: string
  userAgent?: string
}

export interface EstablishedSession {
  user: User
  sessionCookie: string
  maxAgeMs: number
}

/**
 * AuthService — orchestrates Firebase identity with the local user store.
 * Depends only on repository abstractions (injected via the DI container).
 */
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly sessions: SessionRepository,
    private readonly audit: AuditRepository,
  ) {}

  private hash(value: string): string {
    return createHash("sha256").update(value).digest("hex")
  }

  /** Find-or-create the local user record from verified Firebase claims. */
  private async syncUser(fb: VerifiedFirebaseUser): Promise<User> {
    if (!fb.email) {
      throw new UnauthorizedError("الحساب لا يحتوي على بريد إلكتروني صالح")
    }
    let user = await this.users.findByFirebaseUid(fb.uid)

    if (!user) {
      // A user may have registered the same email through another method.
      const byEmail = await this.users.findByEmail(fb.email)
      if (byEmail) {
        user = await this.users.update(byEmail.id, {
          firebaseUid: fb.uid,
          photoUrl: fb.picture ?? byEmail.photoUrl,
          displayName: fb.name ?? byEmail.displayName,
        })
      } else {
        user = await this.users.create({
          firebaseUid: fb.uid,
          email: fb.email,
          displayName: fb.name,
          photoUrl: fb.picture,
        })
      }
    }

    if (!user) throw new UnauthorizedError()
    if (!user.isActive) throw new ForbiddenError("تم تعطيل هذا الحساب")
    return user
  }

  /**
   * Exchange a Firebase ID token for a server session cookie, syncing the
   * user and persisting a session record. Used by both login and register.
   */
  async establishSession(
    idToken: string,
    meta: RequestMeta,
    event: "login" | "register",
  ): Promise<EstablishedSession> {
    const fb = await verifyIdToken(idToken)
    const user = await this.syncUser(fb)

    const sessionCookie = await createSessionCookie(idToken, SESSION.maxAgeMs)

    await this.sessions.create({
      userId: user.id,
      refreshTokenHash: this.hash(sessionCookie),
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
      expiresAt: new Date(Date.now() + SESSION.maxAgeMs),
    })

    await this.users.touchLastLogin(user.id)
    await this.audit.log({
      userId: user.id,
      action: event === "register" ? "auth.register" : "auth.login",
      resource: "session",
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    })

    return { user, sessionCookie, maxAgeMs: SESSION.maxAgeMs }
  }

  /** Validate a session cookie and return the matching local user. */
  async resolveSession(sessionCookie: string): Promise<User> {
    let fb: VerifiedFirebaseUser
    try {
      fb = await verifySessionCookie(sessionCookie)
    } catch {
      throw new UnauthorizedError("انتهت صلاحية الجلسة، الرجاء تسجيل الدخول مجدداً")
    }
    const user = await this.users.findByFirebaseUid(fb.uid)
    if (!user || !user.isActive) {
      throw new UnauthorizedError("الحساب غير متاح")
    }
    return user
  }

  /** Refresh: re-validate the cookie and bump session freshness. */
  async refreshSession(sessionCookie: string): Promise<User> {
    const user = await this.resolveSession(sessionCookie)
    const record = await this.sessions.findActiveByHash(this.hash(sessionCookie))
    if (record) await this.sessions.touch(record.id)
    return user
  }

  /** Revoke the current session (and, defensively, Firebase refresh tokens). */
  async logout(sessionCookie: string | undefined, meta: RequestMeta): Promise<void> {
    if (!sessionCookie) return
    const record = await this.sessions.findActiveByHash(this.hash(sessionCookie))
    if (record) {
      await this.sessions.revoke(record.id)
      await this.audit.log({
        userId: record.userId,
        action: "auth.logout",
        resource: "session",
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      })
    }
  }

  /** Global sign-out across all devices. */
  async logoutAll(user: User): Promise<void> {
    await this.sessions.revokeAllForUser(user.id)
    await revokeUserTokens(user.firebaseUid)
  }
}
