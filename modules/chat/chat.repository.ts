import { db } from '@/lib/db'
import { chats, messages } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

export interface CreateChatInput {
  userId: string
  title?: string
  model?: string
}

export interface CreateMessageInput {
  role: 'user' | 'assistant' | 'system'
  content: string
  model?: string
  tokens?: number
}

export interface UpdateChatInput {
  title?: string
  pinned?: boolean
  archived?: boolean
}

export class ChatRepository {
  async createChat(input: CreateChatInput) {
    const [chat] = await db
      .insert(chats)
      .values({
        userId: input.userId,
        title: input.title || 'محادثة جديدة',
        model: input.model,
      })
      .returning()
    return chat
  }

  async getChat(chatId: string, userId: string) {
    const [chat] = await db
      .select()
      .from(chats)
      .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
    return chat
  }

  async listChats(userId: string) {
    return await db
      .select()
      .from(chats)
      .where(and(eq(chats.userId, userId), eq(chats.archived, false)))
      .orderBy(desc(chats.updatedAt))
  }

  async updateChat(chatId: string, userId: string, input: UpdateChatInput) {
    const [chat] = await db
      .update(chats)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
      .returning()
    return chat
  }

  async deleteChat(chatId: string, userId: string) {
    await db
      .update(chats)
      .set({ deletedAt: new Date() })
      .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
  }

  async archiveChat(chatId: string, userId: string) {
    const [chat] = await db
      .update(chats)
      .set({ archived: true, updatedAt: new Date() })
      .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
      .returning()
    return chat
  }
}

export class MessageRepository {
  async createMessage(chatId: string, input: CreateMessageInput) {
    const [message] = await db
      .insert(messages)
      .values({
        chatId,
        role: input.role,
        content: input.content,
        model: input.model,
        tokens: input.tokens || 0,
      })
      .returning()
    return message
  }

  async getMessages(chatId: string) {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(messages.createdAt)
  }

  async getLastMessage(chatId: string) {
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(desc(messages.createdAt))
      .limit(1)
    return message
  }

  async deleteMessages(chatId: string) {
    await db.delete(messages).where(eq(messages.chatId, chatId))
  }
}
