export type {
  MediaAsset,
  MediaAssetRecord,
  MediaListResult,
  MediaCategoryRecord,
  MediaCollectionRecord,
  AssetStatusValue,
} from "@/services/media/types"

export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> }

export type MediaLibraryOptions = {
  categories: Array<{ id: string; name: string; slug: string }>
  collections: Array<{ id: string; name: string; slug: string }>
}
