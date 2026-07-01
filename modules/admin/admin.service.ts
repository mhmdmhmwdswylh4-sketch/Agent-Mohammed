import speakeasy from 'speakeasy'
import { scrypt, randomBytes } from 'crypto'
import { promisify } from 'util'
import {
  AdminRoleRepository,
  AdminMfaRepository,
  AdminIpAllowlistRepository,
  AdminStatsRepository,
} from './admin.repository'

const scryptAsync = promisify(scrypt)

export interface MfaSetupResponse {
  secret: string
  qrCode: string
  backupCodes: string[]
}

export class AdminService {
  constructor(
    private roleRepository: AdminRoleRepository,
    private mfaRepository: AdminMfaRepository,
    private ipRepository: AdminIpAllowlistRepository,
    private statsRepository: AdminStatsRepository
  ) {}

  // ─── RBAC ──────────────────────────────────────────────────────────────────
  async isAdmin(userId: string): Promise<boolean> {
    return await this.roleRepository.isAdmin(userId)
  }

  async isSuperadmin(userId: string): Promise<boolean> {
    return await this.roleRepository.isSuperadmin(userId)
  }

  async requireAdmin(userId: string): Promise<void> {
    const isAdmin = await this.roleRepository.isAdmin(userId)
    if (!isAdmin) {
      throw { status: 403, message: 'Admin access required' }
    }
  }

  async requireSuperadmin(userId: string): Promise<void> {
    const isSuperadmin = await this.roleRepository.isSuperadmin(userId)
    if (!isSuperadmin) {
      throw { status: 403, message: 'Superadmin access required' }
    }
  }

  // ─── MFA Setup ──────────────────────────────────────────────────────────────
  async setupMfa(userId: string): Promise<MfaSetupResponse> {
    const secret = speakeasy.generateSecret({
      name: `Mx AI Admin (${userId})`,
      issuer: 'Mx AI',
      length: 32,
    })

    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () => randomBytes(4).toString('hex').toUpperCase())
    const backupCodesHash = await this.hashBackupCodes(backupCodes)

    // Encrypt and store
    const encryptedSecret = await this.encryptSecret(secret.base32)
    await this.mfaRepository.createMfaSettings(userId, encryptedSecret, backupCodesHash)

    return {
      secret: secret.base32,
      qrCode: secret.otpauth_url || '',
      backupCodes,
    }
  }

  async verifyAndEnableMfa(userId: string, token: string): Promise<boolean> {
    const settings = await this.mfaRepository.getMfaSettings(userId)
    if (!settings) {
      throw new Error('MFA not initialized')
    }

    const decryptedSecret = await this.decryptSecret(settings.secret)
    const verified = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token,
      window: 2,
    })

    if (verified) {
      await this.mfaRepository.enableMfa(userId)
      return true
    }
    return false
  }

  async isMfaEnabled(userId: string): Promise<boolean> {
    const settings = await this.mfaRepository.getMfaSettings(userId)
    return !!settings?.enabled
  }

  async verifyMfaToken(userId: string, token: string): Promise<boolean> {
    const settings = await this.mfaRepository.getMfaSettings(userId)
    if (!settings || !settings.enabled) {
      return false
    }

    const decryptedSecret = await this.decryptSecret(settings.secret)
    return speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token,
      window: 2,
    })
  }

  async disableMfa(userId: string): Promise<void> {
    await this.mfaRepository.disableMfa(userId)
  }

  // ─── IP Allowlist ─────────────────────────────────────────────────────────
  async checkIpAllowed(userId: string, ipAddress: string): Promise<boolean> {
    return await this.ipRepository.isIpAllowed(userId, ipAddress)
  }

  async getAllowedIps(userId: string) {
    return await this.ipRepository.getAllowedIps(userId)
  }

  async addIpAllowlist(userId: string, ipAddress: string, description?: string) {
    return await this.ipRepository.addIp(userId, ipAddress, description)
  }

  async removeIpAllowlist(userId: string, ipAddress: string) {
    await this.ipRepository.removeIp(userId, ipAddress)
  }

  async toggleIpAllowlist(userId: string, ipAddress: string, active: boolean) {
    return await this.ipRepository.toggleIp(userId, ipAddress, active)
  }

  // ─── Stats ──────────────────────────────────────────────────────────────────
  async getStats() {
    const totalUsers = await this.statsRepository.getTotalUsers()
    const activeUsers = await this.statsRepository.getActiveUsers()
    const recentLogs = await this.statsRepository.getRecentAuditLogs(20)

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      recentLogs,
    }
  }

  // ─── Encryption Helpers ─────────────────────────────────────────────────────
  private async encryptSecret(secret: string): Promise<string> {
    // For production, use proper encryption (e.g., AES-256)
    // For now, simple base64 encoding (NOT SECURE for production)
    return Buffer.from(secret).toString('base64')
  }

  private async decryptSecret(encryptedSecret: string): Promise<string> {
    return Buffer.from(encryptedSecret, 'base64').toString('utf-8')
  }

  private async hashBackupCodes(codes: string[]): Promise<string> {
    const codesStr = codes.join(',')
    const salt = randomBytes(16)
    const hash = (await scryptAsync(codesStr, salt, 32)) as Buffer
    return `${salt.toString('hex')}:${hash.toString('hex')}`
  }

  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const settings = await this.mfaRepository.getMfaSettings(userId)
    if (!settings || !settings.backupCodesHash) {
      return false
    }

    // In production, properly verify backup codes
    // For now, simple comparison
    return settings.backupCodesHash.includes(code)
  }
}
