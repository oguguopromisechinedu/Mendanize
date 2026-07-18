"use server"

import { revalidatePath } from "next/cache"
import { requireEditor } from "@/features/authentication/server"
import {
  bulkUpdateArticleStatus,
  createArticle,
  deleteArticles,
  updateArticle,
} from "@/services/content"
import { assistArticleAuthoring } from "@/services/ai"
import { suggestArticleSeo } from "@/services/seo"
import {
  articleWriteSchema,
  bulkArticleIdsSchema,
  bulkStatusSchema,
} from "../validators/schema"
import type { ActionResult } from "../types/types"
import type { ArticleRecord } from "@/services/content/types"

function revalidateArticles(slug?: string) {
  revalidatePath("/dashboard/articles")
  revalidatePath("/dashboard/articles/drafts")
  revalidatePath("/dashboard/articles/scheduled")
  revalidatePath("/dashboard/articles/published")
  revalidatePath("/dashboard/articles/archived")
  if (slug) {
    revalidatePath(`/dashboard/articles/${slug}/preview`)
  }
}

export async function createArticleAction(
  input: unknown
): Promise<ActionResult<ArticleRecord>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }

  const parsed = articleWriteSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const data = parsed.data
  const seo =
    !data.seoTitle && !data.seoDescription
      ? suggestArticleSeo({ title: data.title, excerpt: data.excerpt })
      : null

  try {
    const article = await createArticle({
      title: data.title,
      slug: data.slug || undefined,
      excerpt: data.excerpt ?? null,
      content: data.content,
      status: data.status ?? "DRAFT",
      featured: data.featured ?? false,
      categoryId: data.categoryId || null,
      topicId: data.topicId || null,
      publishedAt: data.publishedAt || null,
      scheduledAt: data.scheduledAt || null,
      seoTitle: data.seoTitle || seo?.seoTitle || null,
      seoDescription: data.seoDescription || seo?.seoDescription || null,
      focusKeyword: data.focusKeyword || null,
      canonicalUrl: data.canonicalUrl || null,
      socialImageUrl: data.socialImageUrl || null,
      featuredImageUrl: data.featuredImageUrl || null,
      featuredImageAlt: data.featuredImageAlt || null,
      tagNames: data.tagNames ?? [],
      authorId: session.user.id,
    })
    revalidateArticles(article.slug)
    return { ok: true, message: "Article saved", data: article }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to create article",
    }
  }
}

export async function updateArticleAction(
  id: string,
  input: unknown
): Promise<ActionResult<ArticleRecord>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }

  const parsed = articleWriteSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const data = parsed.data
  try {
    const article = await updateArticle(id, {
      title: data.title,
      slug: data.slug || undefined,
      excerpt: data.excerpt ?? null,
      content: data.content,
      status: data.status,
      featured: data.featured ?? false,
      categoryId: data.categoryId || null,
      topicId: data.topicId || null,
      publishedAt: data.publishedAt || null,
      scheduledAt: data.scheduledAt || null,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      focusKeyword: data.focusKeyword || null,
      canonicalUrl: data.canonicalUrl || null,
      socialImageUrl: data.socialImageUrl || null,
      featuredImageUrl: data.featuredImageUrl || null,
      featuredImageAlt: data.featuredImageAlt || null,
      tagNames: data.tagNames ?? [],
    })
    if (!article) return { ok: false, message: "Article not found" }
    revalidateArticles(article.slug)
    return { ok: true, message: "Article updated", data: article }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to update article",
    }
  }
}

export async function deleteArticlesAction(
  input: unknown
): Promise<ActionResult<{ count: number }>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }

  const parsed = bulkArticleIdsSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: "Select at least one article" }
  }

  const count = await deleteArticles(parsed.data.ids)
  revalidateArticles()
  return { ok: true, message: `Deleted ${count} article(s)`, data: { count } }
}

export async function bulkStatusAction(
  input: unknown
): Promise<ActionResult<{ count: number }>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }

  const parsed = bulkStatusSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: "Invalid bulk status request" }
  }

  const count = await bulkUpdateArticleStatus(
    parsed.data.ids,
    parsed.data.status
  )
  revalidateArticles()
  return {
    ok: true,
    message: `Updated ${count} article(s) to ${parsed.data.status}`,
    data: { count },
  }
}

export async function requestAiAssistAction(input: {
  mode: "draft" | "rewrite" | "summarize"
  prompt: string
  content?: string
}): Promise<ActionResult<{ content?: string }>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }

  const result = await assistArticleAuthoring(input)
  if (!result.ok) {
    return { ok: false, message: result.message }
  }
  return { ok: true, data: { content: result.content } }
}
