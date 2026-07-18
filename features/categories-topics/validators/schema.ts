import { z } from "zod"

export const taxonomyStatusSchema = z.enum([
  "DRAFT",
  "ACTIVE",
  "HIDDEN",
  "ARCHIVED",
])

export const categoryWriteSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  slug: z.string().max(120).optional().or(z.literal("")),
  description: z.string().max(1000).optional().nullable(),
  icon: z.string().max(64).optional().nullable(),
  accentColor: z.string().max(32).optional().nullable().or(z.literal("")),
  status: taxonomyStatusSchema.optional(),
  featured: z.boolean().optional(),
  displayOrder: z.coerce.number().int().min(0).max(9999).optional(),
  seoTitle: z.string().max(70).optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
  focusKeyword: z.string().max(80).optional().nullable(),
  canonicalUrl: z
    .union([z.string().url(), z.literal("")])
    .optional()
    .nullable(),
  imageUrl: z.string().optional().nullable(),
  imageAlt: z.string().max(200).optional().nullable(),
})

export const topicWriteSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  slug: z.string().max(120).optional().or(z.literal("")),
  description: z.string().max(1000).optional().nullable(),
  categoryId: z.string().min(1, "Parent category is required"),
  status: taxonomyStatusSchema.optional(),
  featured: z.boolean().optional(),
  displayOrder: z.coerce.number().int().min(0).max(9999).optional(),
  seoTitle: z.string().max(70).optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
  focusKeyword: z.string().max(80).optional().nullable(),
  canonicalUrl: z
    .union([z.string().url(), z.literal("")])
    .optional()
    .nullable(),
  imageUrl: z.string().optional().nullable(),
  imageAlt: z.string().max(200).optional().nullable(),
})

export const bulkIdsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
})

export const bulkTaxonomyStatusSchema = bulkIdsSchema.extend({
  status: taxonomyStatusSchema,
})
