import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { container } from "@/lib/container"
import { SESSION } from "@/lib/config"
import { getClientMeta, ok, withApiHandler } from "@/lib/http/api-handler"

export const runtime = "nodejs"

/** POST /api/auth/logout — revoke the current session and clear the cookie. */
export const POST = withApiHandler(async (req: NextRequest) => {
  const meta = getClientMeta(req)
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION.cookieName)?.value

  await container.authService.logout(sessionCookie, meta)
  cookieStore.delete(SESSION.cookieName)

  return ok({ loggedOut: true })
})
