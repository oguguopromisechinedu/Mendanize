import { z } from "zod"

export const toolStatusSchema = z.enum([
  "DRAFT",
  "REVIEW",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
])

export const toolPricingSchema = z.enum([
  "FREE",
  "FREEMIUM",
  "PAID",
  "ENTERPRISE",
])

export const toolDifficultySchema = z.enum([
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
])

export const toolAvailabilitySchema = z.enum([
  "AVAILABLE",
  "BETA",
  "WAITLIST",
  "DISCONTINUED",
])

export const toolFeatureKindSchema = z.enum([
  "FEATURE",
  "USE_CASE",
  "ADVANTAGE",
  "LIMITATION",
])

const featureSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1),
  kind: toolFeatureKindSchema,
  sortOrder: z.number().int().optional(),
})

export const toolWriteSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().max(120).optional().or(z.literal("")),
  shortDescription: z.string().max(500).optional().nullable(),
  fullDescription: z.string().optional().nullable(),
  websiteUrl: z
    .union([z.string().url(), z.literal("")])
    .optional()
    .nullable(),
  developer: z.string().max(120).optional().nullable(),
  platforms: z.array(z.string()).optional(),
  availability: toolAvailabilitySchema.optional(),
  pricing: toolPricingSchema.optional(),
  difficulty: toolDifficultySchema.optional(),
  recommendedFor: z.array(z.string()).optional(),
  learningOutcomes: z.array(z.string()).optional(),
  relatedArticleIds: z.array(z.string()).optional(),
  relatedGuideIds: z.array(z.string()).optional(),
  relatedToolIds: z.array(z.string()).optional(),
  demoVideoUrl: z
    .union([z.string().url(), z.literal("")])
    .optional()
    .nullable(),
  featured: z.boolean().optional(),
  status: toolStatusSchema.optional(),
  publishedAt: z.string().optional().nullable(),
  seoTitle: z.string().max(70).optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
  focusKeyword: z.string().max(80).optional().nullable(),
  canonicalUrl: z
    .union([z.string().url(), z.literal("")])
    .optional()
    .nullable(),
  categoryIds: z.array(z.string()).optional(),
  topicIds: z.array(z.string()).optional(),
  tagNames: z.array(z.string()).optional(),
  features: z.array(featureSchema).optional(),
  logoUrl: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  screenshotUrls: z.array(z.string()).optional(),
})

export const bulkToolIdsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
})

export const bulkToolStatusSchema = bulkToolIdsSchema.extend({
  status: toolStatusSchema,
})
