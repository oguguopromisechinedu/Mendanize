import type { AdminRoleKey } from "@prisma/client"

export type ListResult<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export type TagAdminRecord = {
  id: string
  name: string
  slug: string
  articleCount: number
  toolCount: number
  postCount: number
  createdAt: string
  updatedAt: string
}

export type UserAdminRecord = {
  id: string
  name: string | null
  email: string
  role: AdminRoleKey
  roleLabel: string
  active: boolean
  status: "ACTIVE" | "INVITED" | "DEACTIVATED"
  emailVerified: string | null
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
  permissions: string[]
  invitationId?: string | null
  plan: string | null
}

export type SubscriberRecord = {
  id: string
  email: string
  name: string | null
  status: string
  categories: string[]
  createdAt: string
  updatedAt: string
}

export type CommentRecord = {
  id: string
  entityType: "ARTICLE" | "GUIDE" | "TOOL" | "PAGE" | "PROJECT"
  entityId: string
  entityTitle: string | null
  authorName: string
  authorEmail: string | null
  body: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "SPAM"
  createdAt: string
  updatedAt: string
}

export type StaticPageRecord = {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  status: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED"
  seoTitle: string | null
  seoDescription: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export type AuditLogRecord = {
  id: string
  actorId: string | null
  actorEmail: string | null
  action: string
  entityType: string
  entityId: string | null
  summary: string
  metadataJson: string | null
  createdAt: string
}

export type NewsletterCampaignRecord = {
  id: string
  subject: string
  previewText: string | null
  bodyHtml: string
  status: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "CANCELLED"
  audienceFilter: string
  scheduledAt: string | null
  sentAt: string | null
  recipientCount: number
  createdAt: string
  updatedAt: string
}

export type BrokenLinkRecord = {
  id: string
  url: string
  foundOnPath: string
  statusCode: number | null
  status: "OPEN" | "IGNORED" | "FIXED"
  lastCheckedAt: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type AutomationJobRecord = {
  id: string
  key: string
  name: string
  description: string | null
  enabled: boolean
  schedule: string | null
  status: "IDLE" | "RUNNING" | "FAILED" | "DISABLED"
  lastRunAt: string | null
  lastResult: string | null
  createdAt: string
  updatedAt: string
}

export type KnowledgeArticleRecord = {
  id: string
  title: string
  slug: string
  category: string
  body: string
  published: boolean
  createdAt: string
  updatedAt: string
}

export type WorkflowItem = {
  id: string
  title: string
  slug: string
  kind: "article" | "guide" | "tool"
  status: string
  updatedAt: string
  href: string
}

export type IntegrationCard = {
  id: string
  name: string
  category: string
  configured: boolean
  enabled: boolean
  detail: string
  settingsHref: string
}
