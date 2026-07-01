import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { container } from "@/lib/container"
import { SESSION } from "@/lib/config"
import { getClientMeta, ok, withApiHandler } from "@/lib/http/api-handler"
import { enforceRateLimit } from "@/lib/rate-limit"
import { sessionSchema } from "@/modules/auth/auth.schema"
import { z } from "zod"

export const runtime = "nodejs"

const bodySchema = sessionSchema.extend({
  event: z.enum(["login", "register"]).default("login"),
})

/**
 * POST /api/auth/session
 * Exchanges a verified Firebase ID token for an httpOnly session cookie.
 * The client obtains the ID token via Firebase (email/password, Google, Apple),
 * then hands it to the server which mints and stores the session.
 */
export const POST = withApiHandler(async (req: NextRequest) => {
  const meta = getClientMeta(req)
  const { idToken, event } = bodySchema.parse(await req.json())

  await enforceRateLimit(meta.ipAddress, event === "register" ? "register" : "login")

  const { user, sessionCookie, maxAgeMs } =
    await container.authService.establishSession(idToken, meta, event)

  const cookieStore = await cookies()
  cookieStore.set(SESSION.cookieName, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(maxAgeMs / 1000),
  })

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
