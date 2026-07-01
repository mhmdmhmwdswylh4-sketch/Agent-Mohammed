import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { container } from "@/lib/container"
import { SESSION } from "@/lib/config"
import {
  getClientMeta,
  ok,
  withApiHandler,
} from "@/lib/http/api-handler"
import { enforceRateLimit } from "@/lib/rate-limit"
import { UnauthorizedError } from "@/lib/http/errors"

export const runtime = "nodejs"

/** POST /api/auth/refresh — re-validate the session cookie. */
export const POST = withApiHandler(async (req: NextRequest) => {
  const meta = getClientMeta(req)
  await enforceRateLimit(meta.ipAddress, "refresh")

  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION.cookieName)?.value
  if (!sessionCookie) throw new UnauthorizedError()

  const user = await container.authService.refreshSession(sessionCookie)
  return ok({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      photoUrl: user.photoUrl,
      role: user.role,
    },
  })
})
