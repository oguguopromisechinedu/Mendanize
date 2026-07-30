/**
 * Server-only loaders for admin module pages.
 * Keep these out of `index.ts` so client components can safely import
 * actions/views from the feature barrel without pulling `server-only`.
 */
import "server-only"

export {
  loadTags,
  loadUsers,
  loadStaffRoles,
  loadSubscribers,
  loadComments,
  loadPages,
  loadActivityLog,
  loadNewsletter,
  loadBrokenLinks,
  loadAutomation,
  loadKnowledge,
  loadWorkflow,
  loadIntegrations,
} from "./services/service"
