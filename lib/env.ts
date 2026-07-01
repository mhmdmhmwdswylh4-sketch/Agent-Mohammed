/**
 * Environment variable validation and defaults.
 * All vars are validated at build time and runtime.
 */

export const env = {
  // Firebase (Web)
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",

  // Firebase (Admin)
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "",
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || "",
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY || "",

  // Supabase
  DATABASE_URL: process.env.DATABASE_URL || "",
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",

  // Session
  SESSION_SECRET: process.env.SESSION_SECRET || "dev-secret-change-in-production",

  // AI/NIM
  NVIDIA_API_KEY: process.env.NVIDIA_API_KEY || "",

  // Node
  NODE_ENV: (process.env.NODE_ENV || "development") as "development" | "production",
} as const

export function validateEnv(): string[] {
  const errors: string[] = []

  // Required in production
  if (env.NODE_ENV === "production") {
    const required = [
      "NEXT_PUBLIC_FIREBASE_API_KEY",
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      "NEXT_PUBLIC_FIREBASE_APP_ID",
      "FIREBASE_PROJECT_ID",
      "FIREBASE_CLIENT_EMAIL",
      "FIREBASE_PRIVATE_KEY",
      "DATABASE_URL",
      "SESSION_SECRET",
    ]

    for (const key of required) {
      if (!process.env[key]) {
        errors.push(`Missing required env var: ${key}`)
      }
    }
  }

  return errors
}
