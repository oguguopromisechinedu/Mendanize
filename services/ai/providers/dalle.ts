/**
 * DALL·E provider adapter (MES-002 / MES-011).
 */

import { generateStudioImage } from "../studio"
import type { AiGenerateParams, AiGenerateResult, AiProviderStatus } from "../types"

export async function status(): Promise<AiProviderStatus> {
  const connected = Boolean(process.env.OPENAI_API_KEY?.trim())
  return {
    provider: "dalle",
    connected,
    message: connected
      ? "Live via OPENAI_API_KEY (DALL·E image generation)"
      : "Not configured — placeholder images used",
  }
}

export async function generateImage(
  params: AiGenerateParams
): Promise<AiGenerateResult> {
  const result = await generateStudioImage({
    userId: "system",
    prompt: params.prompt,
    provider: "dalle",
  })
  return {
    provider: "dalle",
    content: result.outputUrls[0] ?? "",
    urls: result.outputUrls,
    model: result.model ?? undefined,
  }
}
