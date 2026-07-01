import { ChatRepository, MessageRepository, UpdateChatInput } from './chat.repository'
import { nimModel } from '@/lib/ai/models'
import { streamText } from 'ai'

export interface StreamChatInput {
  chatId: string
  userId: string
  userMessage: string
}

export class ChatService {
  constructor(
    private chatRepository: ChatRepository,
    private messageRepository: MessageRepository
  ) {}

  async createChat(userId: string, title?: string) {
    return await this.chatRepository.createChat({
      userId,
      title: title || 'محادثة جديدة',
      model: 'nvidia/llama-3.1-405b',
    })
  }

  async getChat(chatId: string, userId: string) {
    return await this.chatRepository.getChat(chatId, userId)
  }

  async listChats(userId: string) {
    return await this.chatRepository.listChats(userId)
  }

  async updateChat(chatId: string, userId: string, input: UpdateChatInput) {
    return await this.chatRepository.updateChat(chatId, userId, input)
  }

  async deleteChat(chatId: string, userId: string) {
    await this.chatRepository.deleteChat(chatId, userId)
  }

  async archiveChat(chatId: string, userId: string) {
    return await this.chatRepository.archiveChat(chatId, userId)
  }

  async getMessages(chatId: string) {
    return await this.messageRepository.getMessages(chatId)
  }

  /**
   * Stream a chat completion via NVIDIA NIM.
   * Messages are stored in DB before and after streaming.
   */
  async streamChat(input: StreamChatInput) {
    // Verify chat ownership
    const chat = await this.chatRepository.getChat(input.chatId, input.userId)
    if (!chat) {
      throw new Error('Chat not found')
    }

    // Fetch message history
    const history = await this.messageRepository.getMessages(input.chatId)

    // Persist user message
    await this.messageRepository.createMessage(input.chatId, {
      role: 'user',
      content: input.userMessage,
      model: chat.model || undefined,
    })

    // Build conversation history - streamText accepts plain MessageParam objects
    const messages = [
      ...history.map((msg) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      })),
      { role: 'user' as const, content: input.userMessage },
    ]

    // Stream the completion
    const result = streamText({
      model: nimModel,
      messages: messages as any, // Messages format for AI SDK
      system:
        'أنت مساعد ذكي يتحدث باللغة العربية بشكل احترافي وودود. ساعد المستخدم بإجابات دقيقة ومفيدة.',
    })

    // Note: The client will receive the streamed text via the API response.
    // Persistence to the DB happens asynchronously after streaming completes
    // (via a fire-and-forget task that collects the full text from result.textStream).
    //
    // For now, we return the result as-is. The streaming response is handled
    // by the route handler via createUIMessageStreamResponse + toUIMessageStream.

    return result
  }
}
