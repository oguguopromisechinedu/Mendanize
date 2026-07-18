export type {
  ArticleRecord,
  ArticleListResult,
  ArticleStatusValue,
  CategorySummary,
  TopicSummary,
  TagSummary,
} from "@/services/content/types"

export type ArticleEditorOptions = {
  categories: Array<{ id: string; name: string; slug: string }>
  topics: Array<{
    id: string
    name: string
    slug: string
    categoryId?: string | null
  }>
  tags: Array<{ id: string; name: string; slug: string }>
  mediaPlaceholders: Array<{
    id: string
    filename: string
    url: string
  }>
}

export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> }
