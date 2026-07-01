import { NextRequest } from 'next/server'
import { withApiHandler, ok } from '@/lib/http/api-handler'
import { getCurrentUser } from '@/lib/auth/current-user'
import { AppError } from '@/lib/http/errors'
import { z } from 'zod'
import { db } from '@/lib/db'
import { settings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const THEME_VALUES = ['light', 'dark'] as const
const LANGUAGE_VALUES = ['ar', 'en'] as const
const FONT_SIZE_VALUES = ['small', 'medium', 'large'] as const

const updateSettingsSchema = z.object({
  theme: z.enum(THEME_VALUES).optional(),
  language: z.enum(LANGUAGE_VALUES).optional(),
  fontSize: z.enum(FONT_SIZE_VALUES).optional(),
  defaultModel: z.string().optional(),
  preferences: z.record(z.string(), z.any()).optional(),
})

async function get(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    throw new AppError('UNAUTHORIZED', 'Unauthorized', 401)
  }

  const userSettings = await db
    .select()
    .from(settings)
    .where(eq(settings.userId, user.id))
    .limit(1)

  if (!userSettings[0]) {
    // Auto-create default settings
    const created = await db
      .insert(settings)
      .values({
        userId: user.id,
        theme: 'dark',
        language: 'ar',
        fontSize: 'medium',
      })
      .returning()

    return ok(created[0])
  }

  return ok(userSettings[0])
}

async function patch(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    throw new AppError('UNAUTHORIZED', 'Unauthorized', 401)
  }

  const body = await request.json()
  const data = updateSettingsSchema.parse(body)

  // Ensure settings exist
  const existing = await db
    .select()
    .from(settings)
    .where(eq(settings.userId, user.id))
    .limit(1)

  if (!existing[0]) {
    const created = await db
      .insert(settings)
      .values({
        userId: user.id,
        theme: data.theme || 'dark',
        language: data.language || 'ar',
        fontSize: data.fontSize || 'medium',
        defaultModel: data.defaultModel,
        preferences: data.preferences || {},
      })
      .returning()

    return ok(created[0])
  }

  const result = await db
    .update(settings)
    .set({
      ...(data.theme && { theme: data.theme }),
      ...(data.language && { language: data.language }),
      ...(data.fontSize && { fontSize: data.fontSize }),
      ...(data.defaultModel !== undefined && { defaultModel: data.defaultModel }),
      ...(data.preferences && { preferences: data.preferences }),
      updatedAt: new Date(),
    })
    .where(eq(settings.userId, user.id))
    .returning()

  return ok(result[0])
}

export const GET = withApiHandler((req) => get(req))
export const PATCH = withApiHandler((req) => patch(req))
