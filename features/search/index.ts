/** Client-safe exports — features/search (MES-017)
 * Loaders: `@/features/search/server`
 */

export { GlobalSearch } from "./components/global-search"
export { SearchFilters } from "./components/search-filters"
export { SearchResultsView } from "./components/search-results-view"
export { SearchSettingsView } from "./components/search-settings-view"
export {
  saveSearchSettingsAction,
  toggleSearchFilterAction,
} from "./actions/actions"