import { db } from "@/lib/db"
import { auditLogs } from "@/lib/db/schema"

export interface AuditEntry {
  userId?: string | null
  action: string
  resource?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  metadata?: Record<string, unknown>
}

export class AuditRepository {
  async log(entry: AuditEntry): Promise<void> {
    try {
      await db.insert(auditLogs).values({
        userId: entry.userId ?? null,
        action: entry.action,
        resource: entry.resource ?? null,
        ipAddress: entry.ipAddress ?? null,
        userAgent: entry.userAgent ?? null,
        metadata: entry.metadata ?? {},
      })
    } catch (err) {
      // Audit logging must never break the primary request flow.
      console.log("[v0] audit log failed:", (err as Error).message)
    }
  }
}
