import { NextRequest } from 'next/server'
import { getContainer } from '@/lib/container'
import { getCurrentUser } from '@/lib/auth/current-user'
import { createUIMessageStreamResponse, toUIMessageStream } from 'ai'
import { z } from 'zod'

const streamSchema = z.object({
  chatId: z.string().uuid(),
  message: z.string().min(1),
})

export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const user = await getCurrentUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    // Parse body
    const body = await request.json()
    const { chatId, message } = streamSchema.parse(body)

    // Get chat service from container
    const container = getContainer()
    const chatService = container.getChatService()

    // Stream chat completion
    const result = await chatService.streamChat({
      chatId,
      userId: user.id,
      userMessage: message,
    })

    // Return streaming response
    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error('[v0] Stream error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
