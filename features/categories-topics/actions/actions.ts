"use server"

import { revalidatePath } from "next/cache"
import { requireEditor } from "@/features/authentication/server"
import { invalidateDashboardHome } from "@/features/admin-dashboard/server"
import {
  bulkUpdateCategoryStatus,
  bulkUpdateTopicStatus,
  createCategory,
  createTopic,
  deleteCategories,
  deleteTopics,
  updateCategory,
  updateTopic,
} from "@/services/content"
import type { CategoryRecord, TopicRecord } from "@/services/content/types"
import {
  bulkIdsSchema,
  bulkTaxonomyStatusSchema,
  categoryWriteSchema,
  topicWriteSchema,
} from "../validators/schema"
import type { ActionResult } from "../types/types"

function revalidateTaxonomy() {
  invalidateDashboardHome()
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/categories")
  revalidatePath("/dashboard/topics")
  revalidatePath("/dashboard/articles")
}

export async function createCategoryAction(
  input: unknown
): Promise<ActionResult<CategoryRecord>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }

  const parsed = categoryWriteSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  try {
    const data = parsed.data
    const category = await createCategory({
      ...data,
      slug: data.slug || undefined,
      accentColor: data.accentColor || null,
      canonicalUrl: data.canonicalUrl || null,
    })
    revalidateTaxonomy()
    return { ok: true, message: "Category saved", data: category }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to save category",
    }
  }
}

export async function updateCategoryAction(
  id: string,
  input: unknown
): Promise<ActionResult<CategoryRecord>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }

  const parsed = categoryWriteSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  try {
    const data = parsed.data
    const category = await updateCategory(id, {
      ...data,
      slug: data.slug || undefined,
      accentColor: data.accentColor || null,
      canonicalUrl: data.canonicalUrl || null,
    })
    if (!category) return { ok: false, message: "Category not found" }
    revalidateTaxonomy()
    return { ok: true, message: "Category updated", data: category }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to update category",
    }
  }
}

export async function createTopicAction(
  input: unknown
): Promise<ActionResult<TopicRecord>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }

  const parsed = topicWriteSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  try {
    const data = parsed.data
    const topic = await createTopic({
      ...data,
      slug: data.slug || undefined,
      canonicalUrl: data.canonicalUrl || null,
    })
    revalidateTaxonomy()
    return { ok: true, message: "Topic saved", data: topic }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to save topic",
    }
  }
}

export async function updateTopicAction(
  id: string,
  input: unknown
): Promise<ActionResult<TopicRecord>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }

  const parsed = topicWriteSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  try {
    const data = parsed.data
    const topic = await updateTopic(id, {
      ...data,
      slug: data.slug || undefined,
      canonicalUrl: data.canonicalUrl || null,
    })
    if (!topic) return { ok: false, message: "Topic not found" }
    revalidateTaxonomy()
    return { ok: true, message: "Topic updated", data: topic }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to update topic",
    }
  }
}

export async function deleteCategoriesAction(
  input: unknown
): Promise<ActionResult<{ count: number }>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = bulkIdsSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Select at least one category" }

  try {
    const count = await deleteCategories(parsed.data.ids)
    revalidateTaxonomy()
    return { ok: true, message: `Deleted ${count} categor(ies)`, data: { count } }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to delete",
    }
  }
}

export async function deleteTopicsAction(
  input: unknown
): Promise<ActionResult<{ count: number }>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = bulkIdsSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Select at least one topic" }

  const count = await deleteTopics(parsed.data.ids)
  revalidateTaxonomy()
  return { ok: true, message: `Deleted ${count} topic(s)`, data: { count } }
}

export async function bulkCategoryStatusAction(
  input: unknown
): Promise<ActionResult<{ count: number }>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = bulkTaxonomyStatusSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Invalid request" }

  const count = await bulkUpdateCategoryStatus(
    parsed.data.ids,
    parsed.data.status
  )
  revalidateTaxonomy()
  return {
    ok: true,
    message: `Updated ${count} categor(ies)`,
    data: { count },
  }
}

export async function bulkTopicStatusAction(
  input: unknown
): Promise<ActionResult<{ count: number }>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = bulkTaxonomyStatusSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Invalid request" }

  const count = await bulkUpdateTopicStatus(parsed.data.ids, parsed.data.status)
  revalidateTaxonomy()
  return {
    ok: true,
    message: `Updated ${count} topic(s)`,
    data: { count },
  }
}
