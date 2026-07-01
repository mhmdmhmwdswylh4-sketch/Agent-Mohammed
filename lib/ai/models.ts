/**
 * Mx AI model registry — curated NVIDIA NIM catalog models.
 * `id` is the exact NIM model identifier passed to the inference API.
 */
export type ModelCapability = "chat" | "reasoning" | "code" | "vision"

export interface AIModel {
  id: string
  name: string
  description: string
  contextWindow: number
  capabilities: ModelCapability[]
  recommended?: boolean
}

export const AI_MODELS: AIModel[] = [
  {
    id: "meta/llama-3.3-70b-instruct",
    name: "Llama 3.3 70B",
    description: "نموذج متوازن عالي الجودة للمحادثات العامة والمهام المعقدة.",
    contextWindow: 128000,
    capabilities: ["chat", "code"],
    recommended: true,
  },
  {
    id: "meta/llama-3.1-8b-instruct",
    name: "Llama 3.1 8B",
    description: "نموذج سريع وخفيف للردود الفورية والمهام البسيطة.",
    contextWindow: 128000,
    capabilities: ["chat"],
  },
  {
    id: "deepseek-ai/deepseek-r1",
    name: "DeepSeek R1",
    description: "نموذج استدلال متقدم يعرض خطوات التفكير قبل الإجابة.",
    contextWindow: 64000,
    capabilities: ["chat", "reasoning", "code"],
  },
  {
    id: "qwen/qwen2.5-coder-32b-instruct",
    name: "Qwen 2.5 Coder 32B",
    description: "متخصص في توليد وشرح الأكواد البرمجية.",
    contextWindow: 32000,
    capabilities: ["chat", "code"],
  },
  {
    id: "nvidia/llama-3.1-nemotron-70b-instruct",
    name: "Nemotron 70B",
    description: "نموذج NVIDIA المحسّن للاتباع الدقيق للتعليمات.",
    contextWindow: 128000,
    capabilities: ["chat", "reasoning"],
  },
]

export const DEFAULT_MODEL_ID = "meta/llama-3.3-70b-instruct"

export function getModel(id: string): AIModel | undefined {
  return AI_MODELS.find((m) => m.id === id)
}

export function isValidModel(id: string): boolean {
  return AI_MODELS.some((m) => m.id === id)
}

export function resolveModelId(id?: string | null): string {
  return id && isValidModel(id) ? id : DEFAULT_MODEL_ID
}

// Re-export the NIM provider instance for use in chat service
export { nimModel } from '@/lib/ai/nim-provider'
