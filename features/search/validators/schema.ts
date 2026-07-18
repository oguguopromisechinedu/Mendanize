import { z } from "zod";

export const searchEntityTypeSchema = z.enum([
  "article",
  "guide",
  "ai_tool",
  "category",
  "topic",
]);

export const searchFiltersSchema = z.object({
  q: z.string().max(200).optional().default(""),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional(),
  types: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => {
      if (!v) return undefined;
      const arr = Array.isArray(v) ? v : v.split(",");
      return arr
        .map((t) => t.trim())
        .filter(Boolean) as Array<
        "article" | "guide" | "ai_tool" | "category" | "topic"
      >;
    }),
  category: z.string().max(120).optional(),
  topic: z.string().max(120).optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  featured: z
    .union([z.literal("1"), z.literal("0"), z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) =>
      v === undefined ? undefined : v === "1" || v === "true",
    ),
  recentlyUpdated: z
    .union([z.literal("1"), z.literal("0"), z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) =>
      v === undefined ? undefined : v === "1" || v === "true",
    ),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const searchSettingsSchema = z.object({
  enabled: z.boolean(),
  minQueryLength: z.number().int().min(1).max(10),
  resultsPerPage: z.number().int().min(5).max(50),
  rankingRulesNote: z.string().max(2000).nullable().optional(),
  synonymsPlaceholder: z.string().max(4000).nullable().optional(),
  stopWordsPlaceholder: z.string().max(4000).nullable().optional(),
  analyticsPlaceholder: z.string().max(4000).nullable().optional(),
  includeArticles: z.boolean(),
  includeGuides: z.boolean(),
  includeTools: z.boolean(),
  includeCategories: z.boolean(),
  includeTopics: z.boolean(),
});

export const searchFilterToggleSchema = z.object({
  key: z.string().min(1),
  enabled: z.boolean(),
});
