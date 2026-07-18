import { z } from "zod"

export const articleStatusSchema = z.enum([
  "DRAFT",
  "REVIEW",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
])

export const articleWriteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().max(120).optional().or(z.literal("")),
  excerpt: z.string().max(500).optional().nullable(),
  content: z.string().min(1, "Content is required"),
  status: articleStatusSchema.optional(),
  featured: z.boolean().optional(),
  categoryId: z.string().optional().nullable(),
  topicId: z.string().optional().nullable(),
  publishedAt: z.string().optional().nullable(),
  scheduledAt: z.string().optional().nullable(),
  seoTitle: z.string().max(70).optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
  focusKeyword: z.string().max(80).optional().nullable(),
  canonicalUrl: z
    .union([z.string().url(), z.literal("")])
    .optional()
    .nullable(),
  socialImageUrl: z.string().optional().nullable(),
  featuredImageUrl: z.string().optional().nullable(),
  featuredImageAlt: z.string().max(200).optional().nullable(),
  tagNames: z.array(z.string()).optional(),
})

export const articleListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  query: z.string().optional(),
  status: z
    .enum(["ALL", "DRAFT", "REVIEW", "SCHEDULED", "PUBLISHED", "ARCHIVED"])
    .optional(),
  categoryId: z.string().optional(),
  topicId: z.string().optional(),
  sort: z
    .enum(["updatedAt", "publishedAt", "title", "readingTimeMin"])
    .optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
})

export const bulkArticleIdsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
})

export const bulkStatusSchema = bulkArticleIdsSchema.extend({
  status: articleStatusSchema,
})

export type ArticleWriteInput = z.infer<typeof articleWriteSchema>
