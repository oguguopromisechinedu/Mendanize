"use server"

import { revalidatePath } from "next/cache"
import { requireEditor } from "@/features/authentication/server"
import {
  generateStudioArticle,
  generateStudioImage,
  getGenerationById,
  linkGenerationToArticle,
  linkGenerationToMedia,
  prepareStudioVideo,
} from "@/services/ai"
import { createArticle } from "@/services/content"
import { acceptGeneratedImage } from "@/services/media"
import type { AIGenerationRecord } from "@/services/ai/types"
import type { ArticleRecord } from "@/services/content/types"
import type { MediaAsset } from "@/services/media/types"
import {
  saveImageSchema,
  sendToArticleSchema,
  studioArticleSchema,
  studioImageSchema,
  studioVideoSchema,
} from "../validators/schema"
import type { ActionResult } from "../types/types"

function revalidateStudio() {
  revalidatePath("/dashboard/ai-studio")
  revalidatePath("/dashboard/ai-studio/history")
  revalidatePath("/dashboard/articles")
  revalidatePath("/dashboard/media")
}

export async function generateArticleAction(
  input: unknown
): Promise<ActionResult<AIGenerationRecord>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }

  const parsed = studioArticleSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const generation = await generateStudioArticle({
    userId: session.admin.id,
    ...parsed.data,
  })
  revalidateStudio()
  if (generation.status === "FAILED") {
    return {
      ok: false,
      message: generation.errorMessage || "Generation failed",
      data: generation,
    }
  }
  return { ok: true, message: "Draft + image generated (Claude + OpenAI)", data: generation }
}

export async function generateImageAction(
  input: unknown
): Promise<ActionResult<AIGenerationRecord>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }

  const parsed = studioImageSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const generation = await generateStudioImage({
    userId: session.admin.id,
    ...parsed.data,
  })
  revalidateStudio()
  if (generation.status === "FAILED") {
    return {
      ok: false,
      message: generation.errorMessage || "Generation failed",
      data: generation,
    }
  }
  return { ok: true, message: "Images generated", data: generation }
}

export async function prepareVideoAction(
  input: unknown
): Promise<ActionResult<AIGenerationRecord>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }

  const parsed = studioVideoSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const generation = await prepareStudioVideo({
    userId: session.admin.id,
    ...parsed.data,
  })
  revalidateStudio()
  return {
    ok: true,
    message: "Video request recorded (provider TBD)",
    data: generation,
  }
}

export async function sendToArticleEditorAction(
  input: unknown
): Promise<ActionResult<ArticleRecord>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }

  const parsed = sendToArticleSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: "Invalid article handoff payload" }
  }

  if (!parsed.data.topicId) {
    // Articles allow null topic; create draft without forcing taxonomy
  }

  try {
    const generation = await getGenerationById(parsed.data.generationId)
    const featuredImageUrl = generation?.outputUrls?.[0] ?? null

    const article = await createArticle({
      title: parsed.data.title,
      content: parsed.data.content,
      excerpt: null,
      status: "DRAFT",
      categoryId: parsed.data.categoryId || null,
      topicId: parsed.data.topicId || null,
      authorId: session.admin.id,
      tagNames: ["ai-studio"],
      featuredImageUrl,
    })
    await linkGenerationToArticle(parsed.data.generationId, article.id)
    revalidateStudio()
    return {
      ok: true,
      message: featuredImageUrl
        ? "Sent to Article Editor as draft (with featured image)"
        : "Sent to Article Editor as draft",
      data: article,
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to create article",
    }
  }
}

export async function saveImageToMediaAction(
  input: unknown
): Promise<ActionResult<MediaAsset>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }

  const parsed = saveImageSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: "Invalid image save payload" }
  }

  const asset = await acceptGeneratedImage({ url: parsed.data.url })
  await linkGenerationToMedia(parsed.data.generationId, asset.id)
  revalidateStudio()
  return {
    ok: true,
    message: "Saved to Media Library",
    data: asset,
  }
}
