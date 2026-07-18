/** Client-safe exports — features/seo (MES-015)
 * Loaders: `@/features/seo/server`
 */

export {
  saveGlobalSeoAction,
  saveTemplateAction,
  deleteTemplateAction,
  saveRedirectAction,
  deleteRedirectAction,
  saveRobotsAction,
  updateSitemapAction,
  regenerateSitemapAction,
  toggleStructuredDataAction,
} from "./actions/actions"

export { SeoDashboardView } from "./components/seo-dashboard-view"
export { SeoSettingsView } from "./components/seo-settings-view"
export { SeoFieldsPanel } from "./components/seo-fields-panel"
export { SeoCmsNav } from "./components/seo-cms-nav"
export {
  SeoTemplatesView,
  SeoRedirectsView,
  SeoRobotsView,
  SeoSitemapView,
  SeoStructuredDataView,
} from "./components/seo-admin-views"

export type { SeoFieldsValue, ActionResult } from "./types/types"
