/**
 * Grok provider adapter (MES-002).
 * Connectivity reserved for a later MES — status is honest; generation fails clearly.
 */

import { AppError, ErrorCode } from "@/lib/api/errors"
import type { AiGenerateParams, AiGenerateResult, AiProviderStatus } from "../types"

export async function status(): Promise<AiProviderStatus> {
  const connected = Boolean(process.env.XAI_API_KEY?.trim())
  return {
    provider: "grok",
    connected: false,
    message: connected
      ? "Key present — Grok generation not wired at v1.0"
      : "Adapter reserved — set XAI_API_KEY when Grok lands",
  }
}

export async function generateText(
  _params: AiGenerateParams
): Promise<AiGenerateResult> {
  throw new AppError(
    ErrorCode.SERVICE_UNAVAILABLE,
    "Grok text generation is not enabled in this release",
    503
  )
}
