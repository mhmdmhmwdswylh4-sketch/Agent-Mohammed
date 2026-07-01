import "server-only"

import { cookies } from "next/headers"
import { cache } from "react"
import { container } from "@/lib/container"
import { SESSION } from "@/lib/config"
import type { User } from "@/lib/db/schema"

/**
 * Reads the session cookie and resolves the current user.
 * Memoised per-request with React `cache` so multiple server components can
 * call it without re-verifying the cookie.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION.cookieName)?.value
  if (!sessionCookie) return null
  try {
    return await container.authService.resolveSession(sessionCookie)
  } catch {
    return null
  }
})

/** Throws (via caller) when no user — for use in protected server components. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) throw new Error("UNAUTHENTICATED")
  return user
}
