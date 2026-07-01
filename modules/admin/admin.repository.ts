import { db } from '@/lib/db'
import { adminRoles, adminMfaSettings, adminIpAllowlist, users, auditLogs } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export class AdminRoleRepository {
  async getAdminRole(userId: string) {
    const result = await db
      .select()
      .from(adminRoles)
      .where(eq(adminRoles.userId, userId))
      .limit(1)
    return result[0] || null
  }

  async isAdmin(userId: string): Promise<boolean> {
    const role = await this.getAdminRole(userId)
    return !!role && (role.role === 'admin' || role.role === 'superadmin')
  }

  async isSuperadmin(userId: string): Promise<boolean> {
    const role = await this.getAdminRole(userId)
    return !!role && role.role === 'superadmin'
  }

  async createAdminRole(userId: string, role: 'admin' | 'superadmin') {
    const result = await db
      .insert(adminRoles)
      .values({ userId, role })
      .returning()
    return result[0]
  }

  async updateAdminRole(userId: string, role: 'admin' | 'superadmin') {
    const result = await db
      .update(adminRoles)
      .set({ role, updatedAt: new Date() })
      .where(eq(adminRoles.userId, userId))
      .returning()
    return result[0] || null
  }

  async removeAdminRole(userId: string) {
    await db.delete(adminRoles).where(eq(adminRoles.userId, userId))
  }
}

export class AdminMfaRepository {
  async getMfaSettings(userId: string) {
    const result = await db
      .select()
      .from(adminMfaSettings)
      .where(eq(adminMfaSettings.userId, userId))
      .limit(1)
    return result[0] || null
  }

  async createMfaSettings(userId: string, secret: string, backupCodesHash: string) {
    const result = await db
      .insert(adminMfaSettings)
      .values({ userId, secret, backupCodesHash, enabled: false })
      .returning()
    return result[0]
  }

  async enableMfa(userId: string) {
    const result = await db
      .update(adminMfaSettings)
      .set({ enabled: true, lastVerifiedAt: new Date() })
      .where(eq(adminMfaSettings.userId, userId))
      .returning()
    return result[0] || null
  }

  async disableMfa(userId: string) {
    await db
      .update(adminMfaSettings)
      .set({ enabled: false })
      .where(eq(adminMfaSettings.userId, userId))
  }

  async updateLastVerified(userId: string) {
    await db
      .update(adminMfaSettings)
      .set({ lastVerifiedAt: new Date() })
      .where(eq(adminMfaSettings.userId, userId))
  }
}

export class AdminIpAllowlistRepository {
  async getAllowedIps(userId: string) {
    return await db
      .select()
      .from(adminIpAllowlist)
      .where(and(eq(adminIpAllowlist.userId, userId), eq(adminIpAllowlist.active, true)))
  }

  async isIpAllowed(userId: string, ipAddress: string): Promise<boolean> {
    const allowlist = await this.getAllowedIps(userId)
    if (allowlist.length === 0) {
      return true // No allowlist = all IPs allowed
    }
    return allowlist.some((entry) => entry.ipAddress === ipAddress || this.matchesCidr(ipAddress, entry.ipAddress))
  }

  async addIp(userId: string, ipAddress: string, description?: string) {
    const result = await db
      .insert(adminIpAllowlist)
      .values({ userId, ipAddress, description })
      .returning()
    return result[0]
  }

  async removeIp(userId: string, ipAddress: string) {
    await db
      .delete(adminIpAllowlist)
      .where(and(eq(adminIpAllowlist.userId, userId), eq(adminIpAllowlist.ipAddress, ipAddress)))
  }

  async toggleIp(userId: string, ipAddress: string, active: boolean) {
    const result = await db
      .update(adminIpAllowlist)
      .set({ active })
      .where(and(eq(adminIpAllowlist.userId, userId), eq(adminIpAllowlist.ipAddress, ipAddress)))
      .returning()
    return result[0] || null
  }

  private matchesCidr(ip: string, cidr: string): boolean {
    // Simple CIDR matching (for now, just exact match; can be enhanced)
    return ip === cidr
  }
}

export class AdminStatsRepository {
  async getTotalUsers() {
    const result = await db
      .select()
      .from(users)
    return result.length
  }

  async getActiveUsers() {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.isActive, true))
    return result.length
  }

  async getRecentAuditLogs(limit: number = 50) {
    return await db
      .select()
      .from(auditLogs)
      .orderBy((t) => [t.createdAt])
      .limit(limit)
  }
}
