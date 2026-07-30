/** Client-safe exports — features/learning-guides (MES-010 admin + MES-026 public)
 * Loaders: `@/features/learning-guides/server`
 */

export {
  createGuideAction,
  updateGuideAction,
  deleteGuidesAction,
  bulkGuideStatusAction,
} from "./actions/actions"

export { GuideListView } from "./components/guide-list-view"
export { GuideEditorForm } from "./components/guide-editor-form"
export { GuidePreviewView } from "./components/guide-preview-view"
export { GuideStructureBuilder } from "./components/guide-structure-builder"

export { PublicGuideListView } from "./components/public/public-guide-list-view"
export { GuideOverviewView } from "./components/public/guide-overview-view"
export { GuideLessonView } from "./components/public/guide-lesson-view"
export { GuideLessonNav } from "./components/public/guide-lesson-nav"
export { GuideResourcePanel } from "./components/public/guide-resource-panel"
export { GuideContinuePanel } from "./components/public/guide-continue-panel"

export type {
  GuideRecord,
  GuideListResult,
  GuideEditorOptions,
  ActionResult,
} from "./types/types"
