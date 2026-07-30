/** Client-safe exports — features/admin-modules
 * Loaders: `@/features/admin-modules/server`
 */

export {
  createTagAction,
  updateTagAction,
  deleteTagsAction,
  mergeTagsAction,
  updateUserRoleAction,
  createAdminAction,
  inviteStaffAction,
  resendStaffInviteAction,
  cancelStaffInviteAction,
  setAdminActiveAction,
  removeAdminUserAction,
  acceptStaffInviteAction,
  setAdminPasswordAction,
  createSubscriberAction,
  updateSubscriberAction,
  deleteSubscribersAction,
  moderateCommentsAction,
  deleteCommentsAction,
  createPageAction,
  updatePageAction,
  deletePagesAction,
  createNewsletterAction,
  updateNewsletterAction,
  sendNewsletterAction,
  deleteNewsletterAction,
  scanBrokenLinksAction,
  updateBrokenLinkStatusAction,
  redirectBrokenLinkAction,
  toggleAutomationAction,
  runAutomationAction,
  createKnowledgeAction,
  updateKnowledgeAction,
  deleteKnowledgeAction,
  advanceWorkflowAction,
} from "./actions/actions"

export { TagsListView, CreateHubView, ContentHubView } from "./components/tags-and-hubs"
export { UsersListView } from "./components/users-list-view"
export { SubscribersListView } from "./components/subscribers-list-view"
export { CommentsListView } from "./components/comments-list-view"
export { PagesListView } from "./components/pages-list-view"
export { ActivityLogView } from "./components/activity-log-view"
export { NewsletterListView } from "./components/newsletter-list-view"
export { BrokenLinksView } from "./components/broken-links-view"
export { AutomationView } from "./components/automation-view"
export { KnowledgeListView } from "./components/knowledge-list-view"
export { WorkflowQueueView } from "./components/workflow-queue-view"
export { IntegrationsView } from "./components/integrations-view"

export type { ActionResult } from "./types/types"
