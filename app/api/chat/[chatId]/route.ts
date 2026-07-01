import { NextRequest } from 'next/server'
import { withApiHandler, ok } from '@/lib/http/api-handler'
import { getContainer } from '@/lib/container'
import { getCurrentUser } from '@/lib/auth/current-user'
import { z } from 'zod'
import { AppError } from '@/lib/http/errors'

const updateChatSchema = z.object({
  title: z.string().optional(),
  pinned: z.boolean().optional(),
  archived: z.boolean().optional(),
})

async function get(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    throw new AppError('UNAUTHORIZED', 'Unauthorized', 401)
  }

  const { chatId } = await params
  const container = getContainer()
  const chatService = container.getChatService()
  const chat = await chatService.getChat(chatId, user.id)

  if (!chat) {
    throw new AppError('NOT_FOUND', 'Chat not found', 404)
  }

  const messages = await chatService.getMessages(chatId)
  return ok({ chat, messages })
}

async function patch(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    throw new AppError('UNAUTHORIZED', 'Unauthorized', 401)
  }

  const body = await request.json()
  const updates = updateChatSchema.parse(body)

  const { chatId } = await params
  const container = getContainer()
  const chatService = container.getChatService()
  const chat = await chatService.updateChat(chatId, user.id, updates)

  if (!chat) {
    throw new AppError('NOT_FOUND', 'Chat not found', 404)
  }

  return ok({ chat })
}

async function del(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    throw new AppError('UNAUTHORIZED', 'Unauthorized', 401)
  }

  const { chatId } = await params
  const container = getContainer()
  const chatService = container.getChatService()
  await chatService.deleteChat(chatId, user.id)

  return ok({ success: true })
}

export const GET = withApiHandler((req, ctx) =>
  get(req, ctx as { params: Promise<{ chatId: string }> })
)
export const PATCH = withApiHandler((req, ctx) =>
  patch(req, ctx as { params: Promise<{ chatId: string }> })
)
export const DELETE = withApiHandler((req, ctx) =>
  del(req, ctx as { params: Promise<{ chatId: string }> })
)
