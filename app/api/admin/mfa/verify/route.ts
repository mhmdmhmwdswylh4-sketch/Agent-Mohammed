import { NextRequest } from 'next/server'
import { withApiHandler, ok } from '@/lib/http/api-handler'
import { requireAdminAuth } from '@/lib/auth/admin-middleware'
import { getContainer } from '@/lib/container'
import { z } from 'zod'
import { AppError } from '@/lib/http/errors'

const verifyMfaSchema = z.object({
  token: z.string().length(6),
})

async function post(request: NextRequest) {
  const context = await requireAdminAuth(request)

  const body = await request.json()
  const { token } = verifyMfaSchema.parse(body)

  const container = getContainer()
  const adminService = container.getAdminService()
  const verified = await adminService.verifyAndEnableMfa(context.userId, token)

  if (!verified) {
    throw new AppError('INVALID_TOKEN', 'Invalid MFA token', 400)
  }

  return ok({ mfaEnabled: true })
}

export const POST = withApiHandler((req) => post(req))
