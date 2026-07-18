import { z } from "zod"

export const studioArticleSchema = z.object({
  topic: z.string().min(1).max(200),
  categoryId: z.string().optional().nullable(),
  topicId: z.string().optional().nullable(),
  tone: z.string().max(80).optional(),
  targetLength: z.enum(["short", "medium", "long"]).optional(),
})

export const studioImageSchema = z.object({
  prompt: z.string().min(1).max(1000),
  style: z.string().max(120).optional(),
  aspectRatio: z.enum(["1:1", "16:9", "4:3", "9:16"]).optional(),
})

export const studioVideoSchema = z.object({
  prompt: z.string().min(1).max(1000),
  durationSec: z.coerce.number().int().min(5).max(180).optional(),
  style: z.string().max(120).optional(),
})

export const sendToArticleSchema = z.object({
  generationId: z.string().min(1),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  categoryId: z.string().optional().nullable(),
  topicId: z.string().optional().nullable(),
})

export const saveImageSchema = z.object({
  generationId: z.string().min(1),
  url: z.string().url(),
})
