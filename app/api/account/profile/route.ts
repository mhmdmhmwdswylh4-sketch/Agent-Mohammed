import { NextRequest } from 'next/server'
import { withApiHandler, ok } from '@/lib/http/api-handler'
import { getCurrentUser } from '@/lib/auth/current-user'
import { AppError } from '@/lib/http/errors'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  photoUrl: z.string().url().optional(),
})

async function get(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    throw new AppError('UNAUTHORIZED', 'Unauthorized', 401)
  }

  const profile = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      photoUrl: users.photoUrl,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1)

  if (!profile[0]) {
    throw new AppError('NOT_FOUND', 'Profile not found', 404)
  }

  return ok(profile[0])
}

async function patch(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    throw new AppError('UNAUTHORIZED', 'Unauthorized', 401)
  }

  const body = await request.json()
  const data = updateProfileSchema.parse(body)

  const result = await db
    .update(users)
    .set({
      ...(data.displayName && { displayName: data.displayName }),
      ...(data.photoUrl && { photoUrl: data.photoUrl }),
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id))
    .returning({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      photoUrl: users.photoUrl,
      createdAt: users.createdAt,
    })

  if (!result[0]) {
    throw new AppError('NOT_FOUND', 'Profile not found', 404)
  }

  return ok(result[0])
}

export const GET = withApiHandler((req) => get(req))
export const PATCH = withApiHandler((req) => patch(req))
