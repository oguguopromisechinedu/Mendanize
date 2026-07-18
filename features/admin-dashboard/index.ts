/** Public UI exports — features/admin-dashboard (MES-007)
 * Keep this barrel free of server-only loaders so Client Components can import safely.
 * Server loaders: `@/features/admin-dashboard/server`
 */

export { DashboardShell } from "./components/dashboard-shell"
export { DashboardHomeView } from "./components/dashboard-home-view"
export { DashboardRightRail } from "./components/dashboard-right-rail"
export { AdminAiCommandBar } from "./components/admin-ai-command-bar"
export { AdminQuickCreateMenu } from "./components/admin-quick-create-menu"
export { AdminModulePlaceholder } from "./components/admin-module-placeholder"
export {
  AdminPageHeader,
  AdminActionToolbar,
  AdminFilterBar,
  AdminSearchBar,
  AdminPanel,
  AdminEmptyState,
  AdminLoadingState,
} from "./components/admin-primitives"
export { AdminDataTable, AdminStatCard } from "./components/admin-table"
export { StatusBadge } from "./components/status-badge"
export {
  ConfirmationDialog,
  AdminSidePanel,
} from "./components/confirmation-dialog"
export type { DashboardHomeData } from "./types/types"
