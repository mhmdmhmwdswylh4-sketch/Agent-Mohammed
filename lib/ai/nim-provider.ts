import { createOpenAICompatible } from "@ai-sdk/openai-compatible"

/**
 * NVIDIA NIM provider (OpenAI-compatible inference API).
 * Mx AI uses NVIDIA NIM exclusively for chat completions.
 * Docs: https://integrate.api.nvidia.com/v1
 */
if (!process.env.NVIDIA_API_KEY) {
  // Fail loud at import time on the server so misconfiguration is obvious.
  console.error("[v0] NVIDIA_API_KEY is not set — AI features will not work.")
}

export const nim = createOpenAICompatible({
  name: "nvidia-nim",
  apiKey: process.env.NVIDIA_API_KEY ?? "",
  baseURL: "https://integrate.api.nvidia.com/v1",
  includeUsage: true,
})

// Export the default model instance for chat operations
export const nimModel = nim("meta/llama-3.3-70b-instruct")
