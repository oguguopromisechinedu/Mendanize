import { z } from "zod";

export const saveContentSchema = z.object({
  entityType: z.enum(["article", "guide", "ai_tool"]),
  entityId: z.string().min(1),
});

export const unsaveContentSchema = z.object({
  savedId: z.string().min(1).optional(),
  entityType: z.enum(["article", "guide", "ai_tool"]).optional(),
  entityId: z.string().min(1).optional(),
});

export const interestSchema = z.object({
  categoryId: z.string().nullable().optional(),
  topicId: z.string().nullable().optional(),
  enabled: z.boolean(),
});

export const preferencesSchema = z.object({
  preferredDifficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  dailyReminderEnabled: z.boolean().optional(),
  preferredCategoryIds: z.array(z.string()).optional(),
  preferredTopicIds: z.array(z.string()).optional(),
  themePreference: z.enum(["system", "light", "dark"]).optional(),
});

export const learningGoalSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(120),
  description: z.string().max(500).nullable().optional(),
  targetNote: z.string().max(200).nullable().optional(),
  isActive: z.boolean().optional(),
});
