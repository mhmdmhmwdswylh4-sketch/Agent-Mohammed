import { NextRequest } from 'next/server'
import { withApiHandler, ok } from '@/lib/http/api-handler'
import { getCurrentUser } from '@/lib/auth/current-user'
import { AppError } from '@/lib/http/errors'
import { getAdminAuth } from '@/lib/firebase/admin'
import { db } from '@/lib/db'
import { users, sessions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const deleteAccountSchema = z.object({
  confirmPassword: z.string().optional(), // May be used for extra verification
})

async function post(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    throw new AppError('UNAUTHORIZED', 'Unauthorized', 401)
  }

  const body = await request.json()
  deleteAccountSchema.parse(body)

  // Get user from DB to get Firebase UID
  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1)

  if (!dbUser[0]) {
    throw new AppError('NOT_FOUND', 'User not found', 404)
  }

  // Delete from Firebase
  const auth = getAdminAuth()
  try {
    await auth.deleteUser(dbUser[0].firebaseUid)
  } catch (err) {
    console.error('[v0] Failed to delete Firebase user:', err)
    // Continue with DB deletion even if Firebase fails
  }

  // Mark user as inactive (soft delete)
  await db
    .update(users)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id))

  // Invalidate all sessions
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(eq(sessions.userId, user.id))

  // Clear session via logout endpoint would happen client-side
  return ok({ success: true, message: 'Account deleted successfully' })
}

export const POST = withApiHandler((req) => post(req))
