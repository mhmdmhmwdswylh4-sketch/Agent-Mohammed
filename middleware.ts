import { NextResponse, type NextRequest } from "next/server"
import { SESSION } from "@/lib/config"

/**
 * Edge middleware — coarse route protection based on the presence of the
 * session cookie. Cryptographic verification (firebase-admin) happens in the
 * Node runtime (server components / route handlers via AuthService), because
 * firebase-admin cannot run on the Edge.
 */
const PROTECTED_PREFIXES = ["/dashboard", "/chat", "/settings", "/admin"]
const AUTH_ROUTES = ["/login", "/register"]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const hasSession = Boolean(req.cookies.get(SESSION.cookieName)?.value)

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  )
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname === p)

  // Unauthenticated users hitting a protected route → login (with return path).
  if (isProtected && !hasSession) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  // Authenticated users hitting auth pages → dashboard.
  if (isAuthRoute && hasSession) {
    const url = req.nextUrl.clone()
    url.pathname = "/dashboard"
    url.search = ""
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/chat/:path*", "/settings/:path*", "/admin/:path*", "/login", "/register"],
}
