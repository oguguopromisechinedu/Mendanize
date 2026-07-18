/**
 * OpenAI provider adapter (MES-002 / MES-011).
 * Status reflects live env config; generation delegates to Studio.
 */

import { generateStudioArticle } from "../studio"
import type { AiGenerateParams, AiGenerateResult, AiProviderStatus } from "../types"

export async function status(): Promise<AiProviderStatus> {
  const connected = Boolean(process.env.OPENAI_API_KEY?.trim())
  return {
    provider: "openai",
    connected,
    message: connected
      ? "Live — Studio images (DALL·E) and article generation via OpenAI"
      : "Not configured — set OPENAI_API_KEY",
  }
}

export async function generateText(
  params: AiGenerateParams
): Promise<AiGenerateResult> {
  const result = await generateStudioArticle({
    userId: "system",
    topic: params.prompt,
    tone: typeof params.meta?.tone === "string" ? params.meta.tone : undefined,
    provider: "openai",
  })
  return {
    provider: "openai",
    content: result.outputText ?? "",
    urls: result.outputUrls,
    model: result.model ?? undefined,
  }
}
