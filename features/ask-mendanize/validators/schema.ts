import { z } from "zod";

export const askContextTypeSchema = z.enum([
  "ARTICLE",
  "GUIDE",
  "AI_TOOL",
  "GENERAL",
  "HOMEPAGE",
]);

export const tier1AskSchema = z.object({
  question: z.string().min(1).max(2000),
  contextType: askContextTypeSchema,
  contextId: z.string().max(120).nullable().optional(),
  contextTitle: z.string().max(200).nullable().optional(),
  contextExcerpt: z.string().max(4000).nullable().optional(),
});

export const sendMessageSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().min(1).max(4000),
});

export const createConversationSchema = z.object({
  title: z.string().max(120).optional(),
  contextType: askContextTypeSchema.optional(),
  contextId: z.string().max(120).nullable().optional(),
  contextTitle: z.string().max(200).nullable().optional(),
});

export const feedbackSchema = z.object({
  conversationId: z.string().optional().nullable(),
  messageId: z.string().optional().nullable(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).nullable().optional(),
});
