import { and, eq, isNull } from "drizzle-orm"
import { db } from "@/lib/db"
import { sessions, type NewSession, type Session } from "@/lib/db/schema"

export class SessionRepository {
  async create(data: NewSession): Promise<Session> {
    const [row] = await db.insert(sessions).values(data).returning()
    return row
  }

  async findActiveByHash(refreshTokenHash: string): Promise<Session | null> {
    const [row] = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.refreshTokenHash, refreshTokenHash),
          isNull(sessions.revokedAt),
        ),
      )
      .limit(1)
    return row ?? null
  }

  async touch(id: string): Promise<void> {
    await db
      .update(sessions)
      .set({ lastUsedAt: new Date() })
      .where(eq(sessions.id, id))
  }

  async revoke(id: string): Promise<void> {
    await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.id, id))
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)))
  }
}
