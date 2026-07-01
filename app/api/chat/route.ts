import { NextRequest } from 'next/server'
import { withApiHandler, ok } from '@/lib/http/api-handler'
import { getContainer } from '@/lib/container'
import { getCurrentUser } from '@/lib/auth/current-user'
import { z } from 'zod'
import { AppError } from '@/lib/http/errors'

const createChatSchema = z.object({
  title: z.string().optional(),
})

async function get(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    throw new AppError('UNAUTHORIZED', 'Unauthorized', 401)
  }

  const container = getContainer()
  const chatService = container.getChatService()
  const chats = await chatService.listChats(user.id)

  return ok({ chats })
}

async function post(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    throw new AppError('UNAUTHORIZED', 'Unauthorized', 401)
  }

  const body = await request.json()
  const { title } = createChatSchema.parse(body)

  const container = getContainer()
  const chatService = container.getChatService()
  const chat = await chatService.createChat(user.id, title)

  return ok({ chat }, { status: 201 })
}

export const GET = withApiHandler((req) => get(req))
export const POST = withApiHandler((req) => post(req))
