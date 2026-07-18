export type {
  HomepageAdminRecord,
  HomepageWriteInput,
  HomepageFeaturedKindValue,
  HomepageStatusValue,
} from "@/services/content/types"

export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> }

export type FeaturedPickerOptions = {
  categories: Array<{ id: string; name: string; slug: string }>
  articles: Array<{ id: string; title: string; slug: string }>
  guides: Array<{ id: string; title: string; slug: string }>
  tools: Array<{ id: string; name: string; slug: string }>
}
