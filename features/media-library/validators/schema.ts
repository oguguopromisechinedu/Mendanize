import { z } from "zod"

export const assetStatusSchema = z.enum([
  "ACTIVE",
  "ARCHIVED",
  "PROCESSING",
  "FAILED",
])

export const visibilitySchema = z.enum(["PUBLIC", "PRIVATE", "UNLISTED"])

export const assetWriteSchema = z.object({
  filename: z.string().min(1).max(255).optional(),
  altText: z.string().max(300).nullable().optional(),
  caption: z.string().max(500).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  copyright: z.string().max(300).nullable().optional(),
  visibility: visibilitySchema.optional(),
  featured: z.boolean().optional(),
  status: assetStatusSchema.optional(),
  categoryId: z.string().nullable().optional(),
  collectionIds: z.array(z.string()).optional(),
  tagNames: z.array(z.string()).optional(),
})

export const uploadSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1),
  url: z.string().url().optional(),
  altText: z.string().max(300).optional().nullable(),
  categoryId: z.string().optional().nullable(),
  collectionId: z.string().optional().nullable(),
  width: z.number().int().optional().nullable(),
  height: z.number().int().optional().nullable(),
  sizeBytes: z.number().int().optional().nullable(),
})

export const bulkIdsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
})

export const bulkStatusSchema = bulkIdsSchema.extend({
  status: assetStatusSchema,
})

export const moveCollectionSchema = bulkIdsSchema.extend({
  collectionId: z.string().min(1),
})

export const categoryWriteSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().max(120).optional().or(z.literal("")),
  description: z.string().max(500).nullable().optional(),
  sortOrder: z.number().int().optional(),
})

export const collectionWriteSchema = categoryWriteSchema
