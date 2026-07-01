import { NextRequest } from 'next/server'
import { withApiHandler, ok } from '@/lib/http/api-handler'
import { requireAdminAuth } from '@/lib/auth/admin-middleware'
import { getContainer } from '@/lib/container'

async function post(request: NextRequest) {
  const context = await requireAdminAuth(request)

  const container = getContainer()
  const adminService = container.getAdminService()
  const setup = await adminService.setupMfa(context.userId)

  return ok({ setup }, { status: 201 })
}

export const POST = withApiHandler((req) => post(req))
