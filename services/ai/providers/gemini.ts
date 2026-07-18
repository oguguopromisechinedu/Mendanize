/**
 * Gemini provider adapter (MES-002).
 * Connectivity reserved for a later MES — status is honest; generation fails clearly.
 */

import { AppError, ErrorCode } from "@/lib/api/errors"
import type { AiGenerateParams, AiGenerateResult, AiProviderStatus } from "../types"

export async function status(): Promise<AiProviderStatus> {
  const connected = Boolean(process.env.GOOGLE_AI_API_KEY?.trim())
  return {
    provider: "gemini",
    connected: false,
    message: connected
      ? "Key present — Gemini generation not wired at v1.0"
      : "Adapter reserved — set GOOGLE_AI_API_KEY when Gemini lands",
  }
}

export async function generateText(
  _params: AiGenerateParams
): Promise<AiGenerateResult> {
  throw new AppError(
    ErrorCode.SERVICE_UNAVAILABLE,
    "Gemini text generation is not enabled in this release",
    503
  )
}
