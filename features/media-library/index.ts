/** Client-safe exports — features/media-library (MES-014)
 * Loaders: `@/features/media-library/server`
 */

export {
  uploadMediaAction,
  updateAssetAction,
  deleteAssetsAction,
  bulkAssetStatusAction,
  moveToCollectionAction,
  saveCategoryAction,
  deleteCategoryAction,
  saveCollectionAction,
  deleteCollectionAction,
} from "./actions/actions"

export { MediaLibraryView } from "./components/media-library-view"
export { MediaUploadView } from "./components/media-upload-view"
export { MediaAssetDetailView } from "./components/media-asset-detail-view"
export {
  MediaCategoriesView,
  MediaCollectionsView,
} from "./components/media-taxonomy-views"
export { MediaPicker } from "./components/media-picker"
export { MediaCmsNav } from "./components/media-cms-nav"

export type {
  MediaAssetRecord,
  MediaListResult,
  ActionResult,
} from "./types/types"
