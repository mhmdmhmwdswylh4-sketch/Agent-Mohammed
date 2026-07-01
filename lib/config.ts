/** Central application configuration & constants for Mx AI. */

export const APP = {
  name: "Mx AI",
  nameAr: "إم إكس للذكاء الاصطناعي",
  description: "منصّة ذكاء اصطناعي عربية فائقة الاحتراف",
  locale: "ar",
  dir: "rtl" as const,
} as const

export const SESSION = {
  /** httpOnly session cookie name. */
  cookieName: "mx_session",
  /** Session lifetime: 14 days. */
  maxAgeMs: 14 * 24 * 60 * 60 * 1000,
} as const

export const RATE_LIMITS = {
  login: { limit: 5, windowMs: 15 * 60 * 1000 },
  register: { limit: 3, windowMs: 60 * 60 * 1000 },
  refresh: { limit: 30, windowMs: 15 * 60 * 1000 },
} as const

export type RateLimitAction = keyof typeof RATE_LIMITS
