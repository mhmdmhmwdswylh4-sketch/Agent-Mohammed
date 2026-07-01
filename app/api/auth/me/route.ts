import { ok, withApiHandler } from "@/lib/http/api-handler"
import { getCurrentUser } from "@/lib/auth/current-user"
import { UnauthorizedError } from "@/lib/http/errors"

export const runtime = "nodejs"

/** GET /api/auth/me — returns the authenticated user's public profile. */
export const GET = withApiHandler(async () => {
  const user = await getCurrentUser()
  if (!user) throw new UnauthorizedError()

  return ok({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      photoUrl: user.photoUrl,
      role: user.role,
      mfaEnabled: user.mfaEnabled,
      createdAt: user.createdAt,
    },
  })
})
