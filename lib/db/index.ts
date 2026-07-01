import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

// Use the non-pooling URL for a stable single connection in server runtimes,
// falling back to the pooled URL. Supabase provides both.
const connectionString =
  process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL

if (!connectionString) {
  throw new Error(
    "Missing database connection string. Expected POSTGRES_URL_NON_POOLING or POSTGRES_URL.",
  )
}

// Reuse the client across hot reloads / lambda invocations to avoid exhausting
// the connection pool.
const globalForDb = globalThis as unknown as {
  __mxPgClient?: ReturnType<typeof postgres>
}

const client =
  globalForDb.__mxPgClient ??
  postgres(connectionString, {
    prepare: false,
    max: 10,
    idle_timeout: 20,
  })

if (process.env.NODE_ENV !== "production") {
  globalForDb.__mxPgClient = client
}

export const db = drizzle(client, { schema })
export { schema }
export type Database = typeof db
