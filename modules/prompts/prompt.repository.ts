import { db } from "@/lib/db"
import { promptTemplates } from "@/lib/db/schema"
import { eq, and, or, isNull } from "drizzle-orm"

export interface CreatePromptInput {
  category: string
  title: string
  content: string
}

export interface UpdatePromptInput {
  category?: string
  title?: string
  content?: string
}

export class PromptRepository {
  async createPrompt(
    userId: string,
    input: CreatePromptInput
  ) {
    const result = await db
      .insert(promptTemplates)
      .values({
        userId,
        ...input,
        isSystem: false,
      })
      .returning()
    return result[0]
  }

  async createSystemPrompt(input: CreatePromptInput) {
    const result = await db
      .insert(promptTemplates)
      .values({
        ...input,
        isSystem: true,
      })
      .returning()
    return result[0]
  }

  async getPrompt(id: string, userId?: string) {
    return await db
      .select()
      .from(promptTemplates)
      .where(
        and(
          eq(promptTemplates.id, id),
          userId ? eq(promptTemplates.userId, userId) : isNull(promptTemplates.userId)
        )
      )
      .limit(1)
      .then((r) => r[0])
  }

  async getUserPrompts(userId: string) {
    return await db
      .select()
      .from(promptTemplates)
      .where(eq(promptTemplates.userId, userId))
  }

  async getSystemPrompts() {
    return await db
      .select()
      .from(promptTemplates)
      .where(eq(promptTemplates.isSystem, true))
  }

  async getPromptsByCategory(category: string, userId?: string) {
    return await db
      .select()
      .from(promptTemplates)
      .where(
        and(
          eq(promptTemplates.category, category),
          userId ? eq(promptTemplates.userId, userId) : isNull(promptTemplates.userId)
        )
      )
  }

  async getAvailablePrompts(userId: string, category?: string) {
    const baseQuery = or(
      eq(promptTemplates.userId, userId),
      eq(promptTemplates.isSystem, true)
    )

    const whereConditions = category
      ? and(baseQuery, eq(promptTemplates.category, category))
      : baseQuery

    return await db
      .select()
      .from(promptTemplates)
      .where(whereConditions)
  }

  async updatePrompt(
    id: string,
    userId: string,
    input: UpdatePromptInput
  ) {
    const result = await db
      .update(promptTemplates)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(promptTemplates.id, id),
          eq(promptTemplates.userId, userId)
        )
      )
      .returning()
    return result[0]
  }

  async deletePrompt(id: string, userId: string) {
    await db
      .delete(promptTemplates)
      .where(
        and(
          eq(promptTemplates.id, id),
          eq(promptTemplates.userId, userId)
        )
      )
  }

  async duplicatePrompt(id: string, userId: string, newTitle?: string) {
    const original = await this.getPrompt(id, userId)
    if (!original) throw new Error("Prompt not found")

    return await this.createPrompt(userId, {
      category: original.category,
      title: newTitle || `${original.title} (نسخة)`,
      content: original.content,
    })
  }
}
