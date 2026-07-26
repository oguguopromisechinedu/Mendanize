/**
 * Gemini provider adapter (MES-002).
 * Reserved — Mendanize text SSOT is Anthropic + OpenAI only.
 */

import { AppError, ErrorCode } from "@/lib/api/errors"
import type { AiGenerateParams, AiGenerateResult, AiProviderStatus } from "../types"

export async function status(): Promise<AiProviderStatus> {
  return {
    provider: "gemini",
    connected: false,
    message: "Not used — configure Anthropic or OpenAI only",
  }
}

export async function generateText(
  _params: AiGenerateParams
): Promise<AiGenerateResult> {
  throw new AppError(
    ErrorCode.SERVICE_UNAVAILABLE,
    "Gemini is not enabled. Use Anthropic or OpenAI.",
    503
  )
}
