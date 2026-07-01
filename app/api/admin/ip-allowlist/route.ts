import { NextRequest } from 'next/server'
import { withApiHandler, ok } from '@/lib/http/api-handler'
import { requireAdminAuth } from '@/lib/auth/admin-middleware'
import { getContainer } from '@/lib/container'
import { z } from 'zod'

const addIpSchema = z.object({
  ipAddress: z.string().min(1),
  description: z.string().optional(),
})

async function get(request: NextRequest) {
  const context = await requireAdminAuth(request)

  const container = getContainer()
  const adminService = container.getAdminService()
  const ips = await adminService.getAllowedIps(context.userId)

  return ok({ ips })
}

async function post(request: NextRequest) {
  const context = await requireAdminAuth(request)

  const body = await request.json()
  const { ipAddress, description } = addIpSchema.parse(body)

  const container = getContainer()
  const adminService = container.getAdminService()
  const ip = await adminService.addIpAllowlist(context.userId, ipAddress, description)

  return ok({ ip }, { status: 201 })
}

export const GET = withApiHandler((req) => get(req))
export const POST = withApiHandler((req) => post(req))
