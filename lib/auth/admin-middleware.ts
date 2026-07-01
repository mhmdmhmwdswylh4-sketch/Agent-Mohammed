import { NextRequest } from 'next/server'
import { getCurrentUser } from './current-user'
import { getContainer } from '@/lib/container'

export interface AdminContext {
  userId: string
  isSuperadmin: boolean
}

export async function requireAdminAuth(request: NextRequest): Promise<AdminContext> {
  // 1. Authenticate user
  const user = await getCurrentUser()
  if (!user) {
    throw { status: 401, message: 'Unauthorized' }
  }

  // 2. Check admin role from DB
  const container = getContainer()
  const adminService = container.getAdminService()
  const isAdmin = await adminService.isAdmin(user.id)

  if (!isAdmin) {
    throw { status: 403, message: 'Admin access required' }
  }

  // 3. Check IP allowlist
  const clientIp = getClientIp(request)
  const ipAllowed = await adminService.checkIpAllowed(user.id, clientIp)

  if (!ipAllowed) {
    throw { status: 403, message: 'IP address not allowed' }
  }

  // 4. Check MFA if enabled
  const mfaEnabled = await adminService.isMfaEnabled(user.id)
  if (mfaEnabled) {
    // MFA token should be in header or checked via session
    const mfaToken = request.headers.get('x-mfa-token')
    if (!mfaToken) {
      throw { status: 401, message: 'MFA token required' }
    }

    const mfaValid = await adminService.verifyMfaToken(user.id, mfaToken)
    if (!mfaValid) {
      throw { status: 401, message: 'Invalid MFA token' }
    }
  }

  const isSuperadmin = await adminService.isSuperadmin(user.id)

  return {
    userId: user.id,
    isSuperadmin,
  }
}

export async function requireSuperadminAuth(request: NextRequest): Promise<AdminContext> {
  const context = await requireAdminAuth(request)

  if (!context.isSuperadmin) {
    throw { status: 403, message: 'Superadmin access required' }
  }

  return context
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown'
  return ip
}
