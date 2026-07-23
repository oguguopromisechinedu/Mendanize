"use server"

import { revalidatePath } from "next/cache"
import { requireEditor } from "@/features/authentication/server"
import { invalidateDashboardHome } from "@/features/admin-dashboard/server"
import { invalidatePublicContent } from "@/lib/cache/content"
import {
  bulkUpdateToolStatus,
  createTool,
  deleteTools,
  updateTool,
} from "@/services/content"
import type { ToolRecord } from "@/services/content/types"
import {
  bulkToolIdsSchema,
  bulkToolStatusSchema,
  toolWriteSchema,
} from "../validators/schema"
import type { ActionResult } from "../types/types"

function revalidateTools() {
  invalidateDashboardHome()
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/ai-tools")
  revalidatePath("/dashboard/ai-tools/drafts")
  revalidatePath("/dashboard/ai-tools/published")
  revalidatePath("/dashboard/ai-tools/archived")
  invalidatePublicContent()
}

export async function createToolAction(
  input: unknown
): Promise<ActionResult<ToolRecord>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }

  const parsed = toolWriteSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    }
  }

  try {
    const data = parsed.data
    const tool = await createTool({
      ...data,
      slug: data.slug || undefined,
      websiteUrl: data.websiteUrl || null,
      demoVideoUrl: data.demoVideoUrl || null,
      canonicalUrl: data.canonicalUrl || null,
    })
    revalidateTools()
    return { ok: true, message: "Tool saved", data: tool }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to create tool",
    }
  }
}

export async function updateToolAction(
  id: string,
  input: unknown
): Promise<ActionResult<ToolRecord>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }

  const parsed = toolWriteSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    }
  }

  try {
    const data = parsed.data
    const tool = await updateTool(id, {
      ...data,
      slug: data.slug || undefined,
      websiteUrl: data.websiteUrl || null,
      demoVideoUrl: data.demoVideoUrl || null,
      canonicalUrl: data.canonicalUrl || null,
    })
    if (!tool) return { ok: false, message: "Tool not found" }
    revalidateTools()
    return { ok: true, message: "Tool updated", data: tool }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to update tool",
    }
  }
}

export async function deleteToolsAction(
  input: unknown
): Promise<ActionResult<{ count: number }>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = bulkToolIdsSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Select at least one tool" }

  const count = await deleteTools(parsed.data.ids)
  revalidateTools()
  return { ok: true, message: `Deleted ${count} tool(s)`, data: { count } }
}

export async function bulkToolStatusAction(
  input: unknown
): Promise<ActionResult<{ count: number }>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = bulkToolStatusSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Invalid request" }

  const count = await bulkUpdateToolStatus(
    parsed.data.ids,
    parsed.data.status
  )
  revalidateTools()
  return {
    ok: true,
    message: `Updated ${count} tool(s) to ${parsed.data.status}`,
    data: { count },
  }
}
