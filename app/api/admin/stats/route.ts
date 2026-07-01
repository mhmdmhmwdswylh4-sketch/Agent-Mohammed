import { NextRequest } from 'next/server'
import { withApiHandler, ok } from '@/lib/http/api-handler'
import { requireAdminAuth } from '@/lib/auth/admin-middleware'
import { getContainer } from '@/lib/container'

async function get(request: NextRequest) {
  await requireAdminAuth(request)

  const container = getContainer()
  const adminService = container.getAdminService()
  const stats = await adminService.getStats()

  return ok({ stats })
}

export const GET = withApiHandler((req) => get(req))
