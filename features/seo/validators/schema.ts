import { z } from "zod"

export const seoEntityTypeSchema = z.enum([
  "HOMEPAGE",
  "ARTICLE",
  "CATEGORY",
  "TOPIC",
  "GUIDE",
  "AI_TOOL",
  "PAGE",
])

export const globalSettingsSchema = z.object({
  websiteTitle: z.string().min(1).max(120).optional(),
  defaultMetaTitle: z.string().max(70).nullable().optional(),
  defaultMetaDescription: z.string().max(160).nullable().optional(),
  defaultOgImageUrl: z.string().nullable().optional(),
  defaultTwitterImageUrl: z.string().nullable().optional(),
  brandName: z.string().min(1).max(80).optional(),
  siteLanguage: z.string().min(2).max(10).optional(),
  canonicalDomain: z.string().nullable().optional(),
  defaultRobotsIndex: z.boolean().optional(),
  defaultRobotsFollow: z.boolean().optional(),
  faviconUrl: z.string().nullable().optional(),
  appleTouchIconUrl: z.string().nullable().optional(),
})

export const templateSchema = z.object({
  entityType: seoEntityTypeSchema,
  name: z.string().min(1).max(120),
  titleTemplate: z.string().min(1).max(200),
  descriptionTemplate: z.string().min(1).max(500),
  isDefault: z.boolean().optional(),
})

export const redirectSchema = z.object({
  sourcePath: z.string().min(1).max(500),
  destination: z.string().min(1).max(500),
  type: z.enum(["PERMANENT_301", "TEMPORARY_302"]).optional(),
  status: z.enum(["ACTIVE", "DISABLED"]).optional(),
  notes: z.string().max(500).nullable().optional(),
})

export const robotsRuleSchema = z.object({
  userAgent: z.string().min(1).optional(),
  allowPath: z.string().nullable().optional(),
  disallowPath: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  enabled: z.boolean().optional(),
})

export const sitemapUpdateSchema = z.object({
  entityType: seoEntityTypeSchema,
  included: z.boolean().optional(),
  changefreq: z.string().optional(),
  priority: z.number().min(0).max(1).optional(),
})
