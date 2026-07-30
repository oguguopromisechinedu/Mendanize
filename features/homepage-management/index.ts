/** Client-safe exports — features/homepage-management (MES-013)
 * Loaders: `@/features/homepage-management/server`
 */

export {
  updateHomepageAction,
  publishHomepageAction,
} from "./actions/actions"

export { HomepageOverviewView } from "./components/homepage-overview-view"
export { HomepageSectionsView } from "./components/homepage-sections-view"
export { HomepageHeroView } from "./components/homepage-hero-view"
export { HomepageFeaturedView } from "./components/homepage-featured-view"
export { HomepageLatestArticlesView } from "./components/homepage-latest-articles-view"
export {
  HomepageStatisticsView,
  HomepageTestimonialsView,
  HomepageFaqView,
} from "./components/homepage-list-editors"
export {
  HomepageNewsletterView,
  HomepageCtaView,
  HomepageAskView,
  HomepageWhyView,
} from "./components/homepage-copy-editors"
export { HomepagePreviewView } from "./components/homepage-preview-view"
export { HomepageCmsNav } from "./components/homepage-cms-nav"

export type { HomepageAdminRecord, ActionResult } from "./types/types"
