export type {
  AIGenerationRecord,
  AIGenerationListResult,
  AIGenerationTypeValue,
  AiProviderStatus,
} from "@/services/ai/types"

export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | {
      ok: false
      message: string
      fieldErrors?: Record<string, string[]>
      data?: T
    }
