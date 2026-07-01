import { NextResponse, type NextRequest } from "next/server"
import { ZodError } from "zod"
import { AppError } from "./errors"

export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiFailure {
  success: false
  error: { code: string; message: string; details?: unknown }
}

export function ok<T>(data: T, init?: ResponseInit): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data }, init)
}

export function fail(
  code: string,
  message: string,
  status: number,
  details?: unknown,
): NextResponse<ApiFailure> {
  return NextResponse.json(
    { success: false, error: { code, message, details } },
    { status },
  )
}

type Handler = (req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>

/**
 * Wraps a route handler with uniform error handling. Any thrown AppError /
 * ZodError is converted into a consistent JSON envelope; unknown errors become
 * a 500 without leaking internals.
 */
export function withApiHandler(handler: Handler): Handler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx)
    } catch (err) {
      if (err instanceof AppError) {
        const res = fail(err.code, err.message, err.status, err.details)
        if (err.status === 429 && "retryAfterSec" in err && err.retryAfterSec) {
          res.headers.set("Retry-After", String(err.retryAfterSec))
        }
        return res
      }
      if (err instanceof ZodError) {
        return fail("VALIDATION_ERROR", "البيانات المُدخلة غير صحيحة", 422, err.issues)
      }
      console.log("[v0] unhandled API error:", (err as Error).message, (err as Error).stack)
      return fail("INTERNAL_ERROR", "حدث خطأ غير متوقّع في الخادم", 500)
    }
  }
}

/** Extract client IP + UA from the incoming request for audit / rate-limit. */
export function getClientMeta(req: NextRequest) {
  const ipAddress =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  const userAgent = req.headers.get("user-agent") ?? "unknown"
  return { ipAddress, userAgent }
}
