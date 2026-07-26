/**
 * OpenAI provider adapter (MES-002 / MES-011).
 * Sole source of truth for image generation. Article text is Anthropic-only.
 */

import { AppError, ErrorCode } from "@/lib/api/errors"
import { generateStudioImage } from "../studio"
import type { AiGenerateParams, AiGenerateResult, AiProviderStatus } from "../types"

export async function status(): Promise<AiProviderStatus> {
  const connected = Boolean(process.env.OPENAI_API_KEY?.trim())
  return {
    provider: "openai",
    connected,
    message: connected
      ? "Live — sole image provider (cover, inline, Studio)"
      : "Not configured — set OPENAI_API_KEY for images",
  }
}

export async function generateText(
  _params: AiGenerateParams
): Promise<AiGenerateResult> {
  throw new AppError(
    ErrorCode.SERVICE_UNAVAILABLE,
    "OpenAI does not generate articles. Use Anthropic for article text.",
    503
  )
}

export async function generateImage(
  params: AiGenerateParams
): Promise<AiGenerateResult> {
  const result = await generateStudioImage({
    userId: "system",
    prompt: params.prompt,
    provider: "openai",
  })
  return {
    provider: "openai",
    content: result.outputUrls[0] ?? "",
    urls: result.outputUrls,
    model: result.model ?? undefined,
  }
}
