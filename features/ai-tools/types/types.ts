export type {
  ToolRecord,
  ToolListResult,
  ToolStatusValue,
  ToolPricingValue,
  ToolDifficultyValue,
  ToolAvailabilityValue,
  ToolFeatureKindValue,
  ToolFeatureRecord,
  ToolImageRecord,
} from "@/services/content/types"

export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> }

export type ToolEditorOptions = {
  categories: Array<{ id: string; name: string; slug: string }>
  topics: Array<{
    id: string
    name: string
    slug: string
    categoryId?: string | null
  }>
  mediaPlaceholders: Array<{ id: string; filename: string; url: string }>
}
