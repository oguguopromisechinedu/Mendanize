/**
 * Claude / Anthropic provider adapter (MES-002 / MES-011).
 * Owns all article / text generation. Images are OpenAI-only.
 */

import { generateStudioArticle } from "../studio"
import type { AiGenerateParams, AiGenerateResult, AiProviderStatus } from "../types"

export async function status(): Promise<AiProviderStatus> {
  const connected = Boolean(process.env.ANTHROPIC_API_KEY?.trim())
  return {
    provider: "claude",
    connected,
    message: connected
      ? "Live — all article / text generation (Studio + Ask)"
      : "Not configured — set ANTHROPIC_API_KEY for articles",
  }
}

export async function generateText(
  params: AiGenerateParams
): Promise<AiGenerateResult> {
  const result = await generateStudioArticle({
    userId: "system",
    topic: params.prompt,
    tone: typeof params.meta?.tone === "string" ? params.meta.tone : undefined,
    provider: "claude",
  })
  return {
    provider: "claude",
    content: result.outputText ?? "",
    urls: result.outputUrls,
    model: result.model ?? undefined,
  }
}
