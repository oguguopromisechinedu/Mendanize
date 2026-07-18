export type {
  GuideRecord,
  GuideListResult,
  GuideStatusValue,
  GuideDifficultyValue,
  GuideSectionRecord,
  GuideLessonRecord,
} from "@/services/content/types"

export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> }

export type GuideEditorOptions = {
  categories: Array<{ id: string; name: string; slug: string }>
  topics: Array<{
    id: string
    name: string
    slug: string
    categoryId?: string | null
  }>
  mediaPlaceholders: Array<{ id: string; filename: string; url: string }>
}
