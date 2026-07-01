import "server-only"

import { and, eq, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { rateLimits } from "@/lib/db/schema"
import { RATE_LIMITS, type RateLimitAction } from "@/lib/config"
import { RateLimitError } from "@/lib/http/errors"

export interface RateLimitResult {
  success: boolean
  remaining: number
  limit: number
  retryAfterSec: number
}

/**
 * Fixed-window rate limiter backed by Postgres.
 *
 * Architectural note: this is a real, working limiter that requires no extra
 * infrastructure. In Phase 7 it can be swapped for an Upstash/Redis-backed
 * implementation behind this same function signature without touching callers.
 */
export async function enforceRateLimit(
  identifier: string,
  action: RateLimitAction,
): Promise<RateLimitResult> {
  const { limit, windowMs } = RATE_LIMITS[action]
  const now = Date.now()
  const windowStart = new Date(Math.floor(now / windowMs) * windowMs)

  // Atomic upsert + increment for the current window.
  const [row] = await db
    .insert(rateLimits)
    .values({ identifier, action, count: 1, windowStart })
    .onConflictDoUpdate({
      target: [rateLimits.identifier, rateLimits.action, rateLimits.windowStart],
      set: { count: sql`${rateLimits.count} + 1` },
    })
    .returning({ count: rateLimits.count })

  const count = row?.count ?? 1
  const remaining = Math.max(0, limit - count)
  const retryAfterSec = Math.ceil((windowStart.getTime() + windowMs - now) / 1000)

  if (count > limit) {
    throw new RateLimitError(
      "عدد كبير من المحاولات، الرجاء المحاولة بعد قليل",
      retryAfterSec,
    )
  }

  return { success: true, remaining, limit, retryAfterSec }
}

/** Opportunistic cleanup of stale windows (call occasionally, best-effort). */
export async function pruneRateLimits(action: RateLimitAction): Promise<void> {
  const { windowMs } = RATE_LIMITS[action]
  const cutoff = new Date(Date.now() - windowMs * 2)
  await db
    .delete(rateLimits)
    .where(and(eq(rateLimits.action, action), sql`${rateLimits.windowStart} < ${cutoff}`))
}
