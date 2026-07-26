/**
 * Grok provider adapter (MES-002).
 * Reserved — Mendanize text SSOT is Anthropic + OpenAI only.
 */

import { AppError, ErrorCode } from "@/lib/api/errors"
import type { AiGenerateParams, AiGenerateResult, AiProviderStatus } from "../types"

export async function status(): Promise<AiProviderStatus> {
  return {
    provider: "grok",
    connected: false,
    message: "Not used — configure Anthropic or OpenAI only",
  }
}

export async function generateText(
  _params: AiGenerateParams
): Promise<AiGenerateResult> {
  throw new AppError(
    ErrorCode.SERVICE_UNAVAILABLE,
    "Grok is not enabled. Use Anthropic or OpenAI.",
    503
  )
}
