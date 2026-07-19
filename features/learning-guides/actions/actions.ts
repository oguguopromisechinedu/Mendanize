"use server"

import { revalidatePath } from "next/cache"
import { requireEditor } from "@/features/authentication/server"
import { invalidateDashboardHome } from "@/features/admin-dashboard/server"
import {
  bulkUpdateGuideStatus,
  createGuide,
  deleteGuides,
  updateGuide,
} from "@/services/content"
import type { GuideRecord } from "@/services/content/types"
import {
  bulkGuideIdsSchema,
  bulkGuideStatusSchema,
  guideWriteSchema,
} from "../validators/schema"
import type { ActionResult } from "../types/types"

function revalidateGuides() {
  invalidateDashboardHome()
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/guides")
  revalidatePath("/dashboard/guides/drafts")
  revalidatePath("/dashboard/guides/published")
  revalidatePath("/dashboard/guides/archived")
}

export async function createGuideAction(
  input: unknown
): Promise<ActionResult<GuideRecord>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }

  const parsed = guideWriteSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  try {
    const data = parsed.data
    const guide = await createGuide({
      ...data,
      slug: data.slug || undefined,
      categoryId: data.categoryId || null,
      canonicalUrl: data.canonicalUrl || null,
      authorId: session.user.id,
    })
    revalidateGuides()
    return { ok: true, message: "Guide saved", data: guide }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to create guide",
    }
  }
}

export async function updateGuideAction(
  id: string,
  input: unknown
): Promise<ActionResult<GuideRecord>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }

  const parsed = guideWriteSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  try {
    const data = parsed.data
    const guide = await updateGuide(id, {
      ...data,
      slug: data.slug || undefined,
      categoryId: data.categoryId || null,
      canonicalUrl: data.canonicalUrl || null,
    })
    if (!guide) return { ok: false, message: "Guide not found" }
    revalidateGuides()
    return { ok: true, message: "Guide updated", data: guide }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to update guide",
    }
  }
}

export async function deleteGuidesAction(
  input: unknown
): Promise<ActionResult<{ count: number }>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = bulkGuideIdsSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Select at least one guide" }

  const count = await deleteGuides(parsed.data.ids)
  revalidateGuides()
  return { ok: true, message: `Deleted ${count} guide(s)`, data: { count } }
}

export async function bulkGuideStatusAction(
  input: unknown
): Promise<ActionResult<{ count: number }>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = bulkGuideStatusSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Invalid request" }

  const count = await bulkUpdateGuideStatus(
    parsed.data.ids,
    parsed.data.status
  )
  revalidateGuides()
  return {
    ok: true,
    message: `Updated ${count} guide(s) to ${parsed.data.status}`,
    data: { count },
  }
}
