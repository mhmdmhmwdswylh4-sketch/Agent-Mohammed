import { PromptRepository, CreatePromptInput, UpdatePromptInput } from "./prompt.repository"
import { AuditRepository } from "@/modules/audit/audit.repository"
import { getCached, invalidateCache, CACHE_KEYS } from "@/lib/cache/redis"

export class PromptService {
  constructor(
    private promptRepository: PromptRepository,
    private auditRepository: AuditRepository
  ) {}

  async createPrompt(userId: string, input: CreatePromptInput, ipAddress?: string) {
    const prompt = await this.promptRepository.createPrompt(userId, input)

    await this.auditRepository.log({
      userId,
      action: "PROMPT_CREATED",
      resource: "prompt",
      ipAddress,
      metadata: {
        promptId: prompt.id,
        title: input.title,
        category: input.category,
      },
    })

    // Invalidate cache
    await invalidateCache(`prompts:${userId}`)
    await invalidateCache('prompts:system')

    return prompt
  }

  async getPrompt(id: string, userId: string) {
    return await this.promptRepository.getPrompt(id, userId)
  }

  async getUserPrompts(userId: string) {
    return await this.promptRepository.getUserPrompts(userId)
  }

  async getSystemPrompts() {
    return await this.promptRepository.getSystemPrompts()
  }

  async getAvailablePrompts(userId: string, category?: string) {
    const cacheKey = `${CACHE_KEYS.PROMPTS(userId)}${category ? `:${category}` : ''}`
    return await getCached(cacheKey, () =>
      this.promptRepository.getAvailablePrompts(userId, category),
      { ttl: 3600 }
    )
  }

  async updatePrompt(
    id: string,
    userId: string,
    input: UpdatePromptInput,
    ipAddress?: string
  ) {
    const prompt = await this.promptRepository.updatePrompt(id, userId, input)

    await this.auditRepository.log({
      userId,
      action: "PROMPT_UPDATED",
      resource: "prompt",
      ipAddress,
      metadata: {
        promptId: id,
        changes: input,
      },
    })

    // Invalidate cache
    await invalidateCache(`prompts:${userId}*`)

    return prompt
  }

  async deletePrompt(id: string, userId: string, ipAddress?: string) {
    await this.promptRepository.deletePrompt(id, userId)

    await this.auditRepository.log({
      userId,
      action: "PROMPT_DELETED",
      resource: "prompt",
      ipAddress,
      metadata: { promptId: id },
    })

    // Invalidate cache
    await invalidateCache(`prompts:${userId}*`)
  }

  async duplicatePrompt(id: string, userId: string, newTitle?: string, ipAddress?: string) {
    const prompt = await this.promptRepository.duplicatePrompt(id, userId, newTitle)

    await this.auditRepository.log({
      userId,
      action: "PROMPT_DUPLICATED",
      resource: "prompt",
      ipAddress,
      metadata: {
        originalId: id,
        newId: prompt.id,
      },
    })

    return prompt
  }

  async getCategories(userId: string) {
    const userPrompts = await this.getUserPrompts(userId)
    const systemPrompts = await this.getSystemPrompts()

    const categories = new Set<string>()
    userPrompts.forEach((p) => categories.add(p.category))
    systemPrompts.forEach((p) => categories.add(p.category))

    return Array.from(categories).sort()
  }
}
