export type {
  CategoryRecord,
  TopicRecord,
  CategoryDetail,
  TopicDetail,
  CategoryListResult,
  TopicListResult,
  TaxonomyStatusValue,
} from "@/services/content/types"

export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> }
