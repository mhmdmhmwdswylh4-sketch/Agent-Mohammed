import { NextRequest } from 'next/server'
import { withApiHandler, ok } from '@/lib/http/api-handler'
import { getContainer } from '@/lib/container'
import { getCurrentUser } from '@/lib/auth/current-user'
import { AppError } from '@/lib/http/errors'
import { z } from 'zod'

const updatePromptSchema = z.object({
  category: z.string().optional(),
  title: z.string().optional(),
  content: z.string().optional(),
})

const duplicateSchema = z.object({
  newTitle: z.string().optional(),
})

async function get(
  request: NextRequest,
  { params }: { params: Promise<{ promptId: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    throw new AppError('UNAUTHORIZED', 'Unauthorized', 401)
  }

  const { promptId } = await params
  const promptService = getContainer().promptService
  const prompt = await promptService.getPrompt(promptId, user.id)

  if (!prompt) {
    throw new AppError('NOT_FOUND', 'Prompt not found', 404)
  }

  return ok({ prompt })
}

async function patch(
  request: NextRequest,
  { params }: { params: Promise<{ promptId: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    throw new AppError('UNAUTHORIZED', 'Unauthorized', 401)
  }

  const body = await request.json()
  const updates = updatePromptSchema.parse(body)

  const { promptId } = await params
  const promptService = getContainer().promptService
  const prompt = await promptService.updatePrompt(promptId, user.id, updates)

  if (!prompt) {
    throw new AppError('NOT_FOUND', 'Prompt not found', 404)
  }

  return ok({ prompt })
}

async function del(
  request: NextRequest,
  { params }: { params: Promise<{ promptId: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    throw new AppError('UNAUTHORIZED', 'Unauthorized', 401)
  }

  const { promptId } = await params
  const promptService = getContainer().promptService
  await promptService.deletePrompt(promptId, user.id)

  return ok({ success: true })
}

export const GET = withApiHandler((req, ctx) =>
  get(req, ctx as { params: Promise<{ promptId: string }> })
)
export const PATCH = withApiHandler((req, ctx) =>
  patch(req, ctx as { params: Promise<{ promptId: string }> })
)
export const DELETE = withApiHandler((req, ctx) =>
  del(req, ctx as { params: Promise<{ promptId: string }> })
)
