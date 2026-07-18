"use server"

import { revalidatePath } from "next/cache"
import { requireEditor } from "@/features/authentication/server"
import {
  deleteMetadataTemplate,
  deleteRedirect,
  regenerateSitemapPlaceholder,
  replaceRobotsRules,
  setStructuredDataEnabled,
  updateGlobalSEOSettings,
  updateSitemapConfig,
  upsertMetadataTemplate,
  upsertRedirect,
} from "@/services/seo"
import {
  globalSettingsSchema,
  redirectSchema,
  robotsRuleSchema,
  sitemapUpdateSchema,
  templateSchema,
} from "../validators/schema"
import type { ActionResult } from "../types/types"
import { z } from "zod"

function revalidateSeo() {
  revalidatePath("/dashboard/seo")
  revalidatePath("/dashboard/seo/settings")
  revalidatePath("/dashboard/seo/templates")
  revalidatePath("/dashboard/seo/robots")
  revalidatePath("/dashboard/seo/structured-data")
  revalidatePath("/dashboard/redirects")
  revalidatePath("/dashboard/sitemap")
}

export async function saveGlobalSeoAction(
  input: unknown
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = globalSettingsSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Validation failed" }
  await updateGlobalSEOSettings(parsed.data)
  revalidateSeo()
  return { ok: true, message: "Global SEO settings saved" }
}

export async function saveTemplateAction(
  input: unknown,
  id?: string
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = templateSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Validation failed" }
  await upsertMetadataTemplate(parsed.data, id)
  revalidateSeo()
  return { ok: true, message: "Template saved" }
}

export async function deleteTemplateAction(id: string): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  await deleteMetadataTemplate(id)
  revalidateSeo()
  return { ok: true, message: "Template deleted" }
}

export async function saveRedirectAction(
  input: unknown,
  id?: string
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = redirectSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Validation failed" }
  await upsertRedirect(parsed.data, id)
  revalidateSeo()
  return { ok: true, message: "Redirect saved" }
}

export async function deleteRedirectAction(id: string): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  await deleteRedirect(id)
  revalidateSeo()
  return { ok: true, message: "Redirect deleted" }
}

export async function saveRobotsAction(input: unknown): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = z.array(robotsRuleSchema).safeParse(input)
  if (!parsed.success) return { ok: false, message: "Validation failed" }
  await replaceRobotsRules(parsed.data)
  revalidateSeo()
  return { ok: true, message: "Robots rules saved" }
}

export async function updateSitemapAction(
  input: unknown
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = sitemapUpdateSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Validation failed" }
  const { entityType, ...rest } = parsed.data
  await updateSitemapConfig(entityType, rest)
  revalidateSeo()
  return { ok: true, message: "Sitemap config updated" }
}

export async function regenerateSitemapAction(): Promise<
  ActionResult<{ regeneratedAt: string; includedTypes: number }>
> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const result = await regenerateSitemapPlaceholder()
  revalidateSeo()
  return {
    ok: true,
    message: `Sitemap placeholder regenerated (${result.includedTypes} types)`,
    data: result,
  }
}

export async function toggleStructuredDataAction(
  id: string,
  enabled: boolean
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  await setStructuredDataEnabled(id, enabled)
  revalidateSeo()
  return { ok: true, message: enabled ? "Schema enabled" : "Schema disabled" }
}
