import "server-only"

import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app"
import { getAuth, type Auth } from "firebase-admin/auth"

/**
 * Firebase Admin SDK — server-only. Runs in the Node.js runtime, never on Edge.
 * Credentials come from a service account. We accept either a full JSON blob
 * (FIREBASE_SERVICE_ACCOUNT_KEY) or the discrete fields.
 */
function buildCredential() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (raw) {
    const parsed = JSON.parse(raw)
    return cert({
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: (parsed.private_key as string)?.replace(/\\n/g, "\n"),
    })
  }

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin غير مُهيّأ. أضف FIREBASE_SERVICE_ACCOUNT_KEY أو (FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY).",
    )
  }
  return cert({ projectId, clientEmail, privateKey })
}

let adminApp: App | undefined

function getAdminApp(): App {
  if (adminApp) return adminApp
  adminApp = getApps().length ? getApp() : initializeApp({ credential: buildCredential() })
  return adminApp
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp())
}

export interface VerifiedFirebaseUser {
  uid: string
  email: string | null
  emailVerified: boolean
  name: string | null
  picture: string | null
}

/** Verify a Firebase ID token and normalise the decoded claims. */
export async function verifyIdToken(idToken: string): Promise<VerifiedFirebaseUser> {
  const decoded = await getAdminAuth().verifyIdToken(idToken, true)
  return {
    uid: decoded.uid,
    email: decoded.email ?? null,
    emailVerified: decoded.email_verified ?? false,
    name: decoded.name ?? null,
    picture: decoded.picture ?? null,
  }
}

/** Mint a session cookie from an ID token (used for httpOnly server sessions). */
export async function createSessionCookie(
  idToken: string,
  expiresInMs: number,
): Promise<string> {
  return getAdminAuth().createSessionCookie(idToken, { expiresIn: expiresInMs })
}

/** Verify a session cookie (checks revocation too). */
export async function verifySessionCookie(
  cookie: string,
): Promise<VerifiedFirebaseUser> {
  const decoded = await getAdminAuth().verifySessionCookie(cookie, true)
  return {
    uid: decoded.uid,
    email: decoded.email ?? null,
    emailVerified: decoded.email_verified ?? false,
    name: decoded.name ?? null,
    picture: decoded.picture ?? null,
  }
}

export async function revokeUserTokens(uid: string): Promise<void> {
  await getAdminAuth().revokeRefreshTokens(uid)
}
