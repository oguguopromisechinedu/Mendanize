import { z } from "zod"

export const tagWriteSchema = z.object({
  name: z.string().min(1).max(80),
  slug: z.string().max(120).optional(),
})

export const tagMergeSchema = z.object({
  sourceId: z.string().min(1),
  targetId: z.string().min(1),
})

export const userRoleSchema = z.object({
  id: z.string().min(1),
  role: z.enum([
    "SUPER_ADMINISTRATOR",
    "ADMINISTRATOR",
    "EDITOR",
    "CONTENT_MANAGER",
    "ANALYTICS_MANAGER",
    "SUPPORT_MANAGER",
  ]),
})

export const adminPasswordSchema = z.object({
  id: z.string().min(1),
  password: z.string().min(8).max(128),
})

export const adminCreateSchema = z.object({
  email: z.string().email().max(320),
  name: z.string().max(120).optional().nullable(),
  password: z.string().min(8).max(128),
  role: z.enum([
    "SUPER_ADMINISTRATOR",
    "ADMINISTRATOR",
    "EDITOR",
    "CONTENT_MANAGER",
    "ANALYTICS_MANAGER",
    "SUPPORT_MANAGER",
  ]),
})

export const staffInviteSchema = z.object({
  email: z.string().email().max(320),
  name: z.string().max(120).optional().nullable(),
  role: z.enum([
    "SUPER_ADMINISTRATOR",
    "ADMINISTRATOR",
    "EDITOR",
    "CONTENT_MANAGER",
    "ANALYTICS_MANAGER",
    "SUPPORT_MANAGER",
  ]),
  sendEmail: z.boolean().optional(),
})

export const staffInviteAcceptSchema = z.object({
  token: z.string().min(16),
  password: z.string().min(8).max(128),
  name: z.string().max(120).optional().nullable(),
})

export const staffIdSchema = z.object({
  id: z.string().min(1),
})

export const invitationIdSchema = z.object({
  invitationId: z.string().min(1),
})

export const subscriberWriteSchema = z.object({
  email: z.string().email(),
  name: z.string().max(120).optional().nullable(),
  status: z.string().max(40).optional(),
  categories: z.array(z.string()).optional(),
})

export const commentStatusSchema = z.object({
  ids: z.array(z.string()).min(1),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "SPAM"]),
})

export const pageWriteSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().max(120).optional(),
  content: z.string().optional(),
  excerpt: z.string().max(500).optional().nullable(),
  status: z.enum(["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"]).optional(),
  seoTitle: z.string().max(200).optional().nullable(),
  seoDescription: z.string().max(500).optional().nullable(),
})

export const newsletterWriteSchema = z.object({
  subject: z.string().min(1).max(200),
  previewText: z.string().max(300).optional().nullable(),
  bodyHtml: z.string().optional(),
  audienceFilter: z.string().max(40).optional(),
})

export const knowledgeWriteSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().max(120).optional(),
  category: z.string().max(80).optional(),
  body: z.string().optional(),
  published: z.boolean().optional(),
})

export const idsSchema = z.object({
  ids: z.array(z.string()).min(1),
})

export const workflowAdvanceSchema = z.object({
  kind: z.enum(["article", "guide", "tool"]),
  id: z.string().min(1),
  status: z.enum(["DRAFT", "REVIEW", "SCHEDULED", "PUBLISHED", "ARCHIVED"]),
})

export const brokenLinkStatusSchema = z.object({
  ids: z.array(z.string()).min(1),
  status: z.enum(["OPEN", "IGNORED", "FIXED"]),
})

export const brokenLinkRedirectSchema = z.object({
  id: z.string().min(1),
  destination: z.string().min(1),
})

export const automationToggleSchema = z.object({
  key: z.string().min(1),
  enabled: z.boolean(),
})
