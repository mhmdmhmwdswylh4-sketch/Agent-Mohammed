import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { settings, users, type NewUser, type User } from "@/lib/db/schema"

/**
 * UserRepository — the only place that touches the `users` / `settings` tables.
 * Higher layers depend on this abstraction, never on Drizzle directly.
 */
export class UserRepository {
  async findById(id: string): Promise<User | null> {
    const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1)
    return row ?? null
  }

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, firebaseUid))
      .limit(1)
    return row ?? null
  }

  async findByEmail(email: string): Promise<User | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1)
    return row ?? null
  }

  async create(data: NewUser): Promise<User> {
    const [row] = await db
      .insert(users)
      .values({ ...data, email: data.email.toLowerCase() })
      .returning()

    // Every user gets a default settings row.
    await db.insert(settings).values({ userId: row.id }).onConflictDoNothing()
    return row
  }

  async update(id: string, data: Partial<NewUser>): Promise<User | null> {
    const [row] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()
    return row ?? null
  }

  async touchLastLogin(id: string): Promise<void> {
    await db
      .update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, id))
  }
}
