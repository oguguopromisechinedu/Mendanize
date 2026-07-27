import {
  listAuditLogsAdmin,
  listAutomationJobs,
  listBrokenLinksAdmin,
  listCommentsAdmin,
  listIntegrationsAdmin,
  listKnowledgeArticles,
  listNewsletterCampaigns,
  listPagesAdmin,
  listSubscribersAdmin,
  listTagsAdminDetailed,
  listUsersAdmin,
  listWorkflowQueue,
} from "@/services/admin"
import { listAdminRolesWithPermissions } from "@/services/admin/invitations"

export async function loadTags(params?: { query?: string }) {
  return listTagsAdminDetailed({ ...params, pageSize: 100 })
}

export async function loadUsers(params?: {
  query?: string
  role?: string
  status?: "ACTIVE" | "INVITED" | "DEACTIVATED" | "ALL"
  staffOnly?: boolean
}) {
  return listUsersAdmin({ ...params, pageSize: 100 })
}

export async function loadStaffRoles() {
  return listAdminRolesWithPermissions()
}

export async function loadSubscribers(params?: {
  query?: string
  status?: string
}) {
  return listSubscribersAdmin({ ...params, pageSize: 100 })
}

export async function loadComments(params?: {
  query?: string
  status?: "PENDING" | "APPROVED" | "REJECTED" | "SPAM"
}) {
  return listCommentsAdmin({ ...params, pageSize: 100 })
}

export async function loadPages(params?: {
  query?: string
  status?: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED"
}) {
  return listPagesAdmin({ ...params, pageSize: 100 })
}

export async function loadActivityLog(params?: {
  query?: string
  entityType?: string
}) {
  return listAuditLogsAdmin({ ...params, pageSize: 100 })
}

export async function loadNewsletter(params?: { query?: string }) {
  return listNewsletterCampaigns({ ...params, pageSize: 100 })
}

export async function loadBrokenLinks(params?: {
  query?: string
  status?: "OPEN" | "IGNORED" | "FIXED"
}) {
  return listBrokenLinksAdmin({ ...params, pageSize: 100 })
}

export async function loadAutomation() {
  return listAutomationJobs()
}

export async function loadKnowledge(params?: {
  query?: string
  category?: string
}) {
  return listKnowledgeArticles({ ...params, pageSize: 100 })
}

export async function loadWorkflow(params?: {
  query?: string
  status?: string
  kind?: "article" | "guide" | "tool"
}) {
  return listWorkflowQueue(params)
}

export async function loadIntegrations() {
  return listIntegrationsAdmin()
}
