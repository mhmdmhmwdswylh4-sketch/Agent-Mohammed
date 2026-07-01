import { NextRequest } from 'next/server'
import { withApiHandler, ok } from '@/lib/http/api-handler'
import { getContainer } from '@/lib/container'
import { getCurrentUser } from '@/lib/auth/current-user'
import { AppError } from '@/lib/http/errors'
import { z } from 'zod'

const createPromptSchema = z.object({
  category: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
})

const getPromptsSchema = z.object({
  category: z.string().optional(),
})

async function get(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    throw new AppError('UNAUTHORIZED', 'Unauthorized', 401)
  }

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  const promptService = getContainer().promptService
  const prompts = await promptService.getAvailablePrompts(user.id, category || undefined)

  return ok({ prompts })
}

async function post(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    throw new AppError('UNAUTHORIZED', 'Unauthorized', 401)
  }

  const body = await request.json()
  const { category, title, content } = createPromptSchema.parse(body)

  const promptService = getContainer().promptService
  const prompt = await promptService.createPrompt(user.id, { category, title, content })

  return ok({ prompt }, { status: 201 })
}

export const GET = withApiHandler((req) => get(req))
export const POST = withApiHandler((req) => post(req))
