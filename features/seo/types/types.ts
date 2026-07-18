export type {
  GlobalSEOSettingsRecord,
  MetadataTemplateRecord,
  RedirectRecord,
  RobotsRuleRecord,
  SitemapConfigRecord,
  StructuredDataRecord,
  SeoDashboardStats,
  SeoFieldsValue,
  SeoEntityTypeValue,
} from "@/services/seo/types"

export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> }
