import { NextRequest } from 'next/server'
import { withApiHandler, ok } from '@/lib/http/api-handler'
import { getCurrentUser } from '@/lib/auth/current-user'
import { AppError } from '@/lib/http/errors'
import { db } from '@/lib/db'
import { sessions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

async function get(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    throw new AppError('UNAUTHORIZED', 'Unauthorized', 401)
  }

  const userSessions = await db
    .select({
      id: sessions.id,
      userAgent: sessions.userAgent,
      ipAddress: sessions.ipAddress,
      createdAt: sessions.createdAt,
      lastUsedAt: sessions.lastUsedAt,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .where(eq(sessions.userId, user.id))

  return ok({ sessions: userSessions })
}

async function post(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    throw new AppError('UNAUTHORIZED', 'Unauthorized', 401)
  }

  const body = await request.json()
  const { sessionId } = body

  if (!sessionId) {
    throw new AppError('INVALID_REQUEST', 'Session ID is required', 400)
  }

  // Verify the session belongs to the user
  const session = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1)

  if (!session[0] || session[0].userId !== user.id) {
    throw new AppError('NOT_FOUND', 'Session not found', 404)
  }

  // Mark session as revoked
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(eq(sessions.id, sessionId))

  return ok({ success: true })
}

export const GET = withApiHandler((req) => get(req))
export const POST = withApiHandler((req) => post(req))
