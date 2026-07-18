import { z } from "zod"

export const guideStatusSchema = z.enum([
  "DRAFT",
  "REVIEW",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
])

export const guideDifficultySchema = z.enum([
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
])

const lessonSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  slug: z.string().optional(),
  content: z.string().optional(),
  readingTimeMin: z.number().int().min(1).optional(),
  featuredImageUrl: z.string().optional().nullable(),
  featuredImageAlt: z.string().optional().nullable(),
  videoUrl: z.string().optional().nullable(),
  codeExample: z.string().optional().nullable(),
  resourceUrl: z.string().optional().nullable(),
  articleId: z.string().optional().nullable(),
  aiToolId: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
})

const sectionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  lessons: z.array(lessonSchema).optional(),
})

export const guideWriteSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().max(120).optional().or(z.literal("")),
  shortDescription: z.string().max(500).optional().nullable(),
  fullDescription: z.string().optional().nullable(),
  coverImageUrl: z.string().optional().nullable(),
  coverImageAlt: z.string().max(200).optional().nullable(),
  status: guideStatusSchema.optional(),
  difficulty: guideDifficultySchema.optional(),
  estimatedMinutes: z.coerce.number().int().min(1).max(10080).optional(),
  learningObjectives: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  categoryId: z.string().optional().nullable(),
  topicId: z.string().min(1, "Topic is required"),
  publishedAt: z.string().optional().nullable(),
  scheduledAt: z.string().optional().nullable(),
  seoTitle: z.string().max(70).optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
  focusKeyword: z.string().max(80).optional().nullable(),
  canonicalUrl: z
    .union([z.string().url(), z.literal("")])
    .optional()
    .nullable(),
  sections: z.array(sectionSchema).optional(),
})

export const bulkGuideIdsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
})

export const bulkGuideStatusSchema = bulkGuideIdsSchema.extend({
  status: guideStatusSchema,
})
