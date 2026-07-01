import { db } from '@/lib/db'
import { users, settings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export interface CreateSettingsInput {
  userId: string
  theme?: string
  language?: string
  fontSize?: string
  defaultModel?: string
  preferences?: Record<string, any>
}

export interface UpdateSettingsInput {
  theme?: string
  language?: string
  fontSize?: string
  defaultModel?: string
  preferences?: Record<string, any>
}

export class SettingsRepository {
  async getSettings(userId: string) {
    const result = await db
      .select()
      .from(settings)
      .where(eq(settings.userId, userId))
      .limit(1)

    return result[0] || null
  }

  async createSettings(input: CreateSettingsInput) {
    const result = await db
      .insert(settings)
      .values({
        userId: input.userId,
        theme: input.theme || 'dark',
        language: input.language || 'ar',
        fontSize: input.fontSize || 'medium',
        defaultModel: input.defaultModel,
        preferences: input.preferences || {},
      })
      .returning()

    return result[0]
  }

  async updateSettings(userId: string, input: UpdateSettingsInput) {
    const result = await db
      .update(settings)
      .set({
        ...(input.theme !== undefined && { theme: input.theme }),
        ...(input.language !== undefined && { language: input.language }),
        ...(input.fontSize !== undefined && { fontSize: input.fontSize }),
        ...(input.defaultModel !== undefined && { defaultModel: input.defaultModel }),
        ...(input.preferences !== undefined && { preferences: input.preferences }),
        updatedAt: new Date(),
      })
      .where(eq(settings.userId, userId))
      .returning()

    return result[0] || null
  }

  async deleteSettings(userId: string) {
    await db.delete(settings).where(eq(settings.userId, userId))
  }
}

export class ProfileService {
  async getProfile(userId: string) {
    const result = await db
      .select({
        id: users.id,
        firebaseUid: users.firebaseUid,
        email: users.email,
        displayName: users.displayName,
        photoUrl: users.photoUrl,
        role: users.role,
        mfaEnabled: users.mfaEnabled,
        isActive: users.isActive,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    return result[0] || null
  }

  async updateProfile(
    userId: string,
    data: { displayName?: string; photoUrl?: string }
  ) {
    const result = await db
      .update(users)
      .set({
        ...(data.displayName !== undefined && { displayName: data.displayName }),
        ...(data.photoUrl !== undefined && { photoUrl: data.photoUrl }),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        firebaseUid: users.firebaseUid,
        email: users.email,
        displayName: users.displayName,
        photoUrl: users.photoUrl,
        role: users.role,
        createdAt: users.createdAt,
      })

    return result[0] || null
  }
}
