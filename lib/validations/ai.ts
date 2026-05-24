import { z } from "zod";

export const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().min(1).max(32000),
      })
    )
    .min(1)
    .max(50),
  model: z.string().optional(),
  chatId: z.string().optional(),
});

export const toolGenerateSchema = z.object({
  toolId: z.string().min(1),
  values: z.record(z.string(), z.string()),
  model: z.string().optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ToolGenerateRequest = z.infer<typeof toolGenerateSchema>;
