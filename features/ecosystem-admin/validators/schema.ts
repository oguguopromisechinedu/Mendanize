import { z } from "zod";

// ── Prompt Packs ──────────────────────────────────────────────────────────────

export const promptPackWriteSchema = z.object({
  title: z.string().min(1).max(120),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().max(1000).nullable().optional(),
  category: z.string().max(80).nullable().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export const promptPackItemWriteSchema = z.object({
  title: z.string().min(1).max(200),
  prompt: z.string().min(1).max(4000),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export const idSchema = z.object({ id: z.string().min(1) });

// ── Project Templates ─────────────────────────────────────────────────────────

export const projectTemplateWriteSchema = z.object({
  title: z.string().min(1).max(120),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  brief: z.string().min(1).max(3000),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  guideIds: z.array(z.string()).optional(),
  toolIds: z.array(z.string()).optional(),
  estimatedHours: z.coerce.number().int().min(1).max(500).optional(),
});

// ── Certificate Templates ─────────────────────────────────────────────────────

export const certificateTemplateWriteSchema = z.object({
  title: z.string().min(1).max(120),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().max(1000).nullable().optional(),
  guideId: z.string().min(1),
  badgeUrl: z.string().url().nullable().optional().or(z.literal("")),
});

// ── Featured Learning ─────────────────────────────────────────────────────────

export const featuredSettingWriteSchema = z.object({
  featuredGuideIds: z.array(z.string()).optional(),
  featuredArticleIds: z.array(z.string()).optional(),
  featuredToolIds: z.array(z.string()).optional(),
  featuredPromptPackIds: z.array(z.string()).optional(),
  featuredProjectIds: z.array(z.string()).optional(),
});

// ── Workspace Presets ─────────────────────────────────────────────────────────

export const workspacePresetWriteSchema = z.object({
  title: z.string().min(1).max(120),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().max(1000).nullable().optional(),
  guideId: z.string().nullable().optional(),
  starterPrompt: z.string().max(4000).nullable().optional(),
  challengeNote: z.string().max(2000).nullable().optional(),
});
