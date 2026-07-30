"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import {
  requireEditor,
  requireAdmin,
  requireSuperAdministrator,
  isAdminRoleKey,
} from "@/features/authentication/server"
import { recordAudit } from "@/services/admin/audit"
import {
  cancelEmsQueueItem,
  createEmsCategory,
  createEmsSender,
  createEmsVariable,
  deleteEmsCategory,
  deleteEmsSender,
  duplicateEmsTemplate,
  retryEmsQueueItem,
  sendTestEmsTemplate,
  softDeleteEmsTemplate,
  updateEmsSender,
  updateEmsSettingsExtended,
  upsertEmsAutomation,
  upsertEmsTemplate,
} from "@/services/ems"

type ActionResult<T = undefined> = {
  ok: boolean
  message: string
  data?: T
}

const EMS_BASE = "/dashboard/communication/email"

function revalidateEms(...extra: string[]) {
  for (const p of [EMS_BASE, ...extra]) revalidatePath(p)
}

async function audit(
  session: { admin: { id: string; email: string } },
  action: string,
  entityType: string,
  summary: string,
  entityId?: string,
) {
  await recordAudit({
    actorId: session.admin.id,
    actorEmail: session.admin.email,
    action,
    entityType,
    entityId,
    summary,
  })
}

function canPublish(roleKey: string) {
  return isAdminRoleKey(roleKey)
}

function canSendOps(roleKey: string) {
  return isAdminRoleKey(roleKey)
}

const templateSchema = z.object({
  id: z.string().optional(),
  key: z.string().optional(),
  name: z.string().min(1).max(200),
  subject: z.string().min(1).max(500),
  bodyHtml: z.string().min(1),
  bodyText: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  senderId: z.string().optional().nullable(),
  replyTo: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  enabled: z.boolean().optional(),
})

export async function upsertEmsTemplateAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = templateSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Validation failed" }

  const status = parsed.data.status ?? "DRAFT"
  if (status === "PUBLISHED" && !canPublish(session.admin.roleKey)) {
    return { ok: false, message: "Editors may only save drafts" }
  }

  try {
    const row = await upsertEmsTemplate({
      ...parsed.data,
      adminId: session.admin.id,
    })
    await audit(
      session,
      parsed.data.id ? "update" : "create",
      "email_template",
      `${parsed.data.id ? "Updated" : "Created"} template “${row.name}”`,
      row.id,
    )
    revalidateEms(`${EMS_BASE}/templates`, `${EMS_BASE}/templates/${row.id}`)
    return { ok: true, message: "Template saved", data: { id: row.id } }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function duplicateEmsTemplateAction(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  try {
    const row = await duplicateEmsTemplate(id, session.admin.id)
    await audit(session, "duplicate", "email_template", `Duplicated template`, row.id)
    revalidateEms(`${EMS_BASE}/templates`)
    return { ok: true, message: "Duplicated as draft", data: { id: row.id } }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function deleteEmsTemplateAction(id: string): Promise<ActionResult> {
  const session = await requireSuperAdministrator()
  if (!session) return { ok: false, message: "Super Administrator required" }
  try {
    await softDeleteEmsTemplate(id)
    await audit(session, "delete", "email_template", "Soft-deleted template", id)
    revalidateEms(`${EMS_BASE}/templates`)
    return { ok: true, message: "Template deleted" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function sendTestEmsTemplateAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireAdmin()
  if (!session) return { ok: false, message: "Admin required" }
  if (!canSendOps(session.admin.roleKey)) {
    return { ok: false, message: "Not permitted" }
  }
  const parsed = z
    .object({ templateId: z.string().min(1), toEmail: z.string().email() })
    .safeParse(input)
  if (!parsed.success) return { ok: false, message: "Valid recipient required" }
  try {
    await sendTestEmsTemplate(parsed.data)
    await audit(
      session,
      "test_send",
      "email_template",
      `Test send to ${parsed.data.toEmail}`,
      parsed.data.templateId,
    )
    revalidateEms(`${EMS_BASE}/queue`)
    return { ok: true, message: "Test email queued/sent" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function createEmsCategoryAction(
  name: string,
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  if (!name.trim()) return { ok: false, message: "Name required" }
  try {
    const row = await createEmsCategory(name)
    await audit(session, "create", "email_category", `Created ${row.name}`, row.id)
    revalidateEms(`${EMS_BASE}/categories`)
    return { ok: true, message: "Category created" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function deleteEmsCategoryAction(id: string): Promise<ActionResult> {
  const session = await requireAdmin()
  if (!session) return { ok: false, message: "Unauthorized" }
  try {
    await deleteEmsCategory(id)
    await audit(session, "delete", "email_category", "Deleted category", id)
    revalidateEms(`${EMS_BASE}/categories`)
    return { ok: true, message: "Category deleted" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function createEmsSenderAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireSuperAdministrator()
  if (!session) return { ok: false, message: "Super Administrator required" }
  const parsed = z
    .object({
      address: z.string().email(),
      displayName: z.string().min(1).max(120),
      replyTo: z.string().optional().nullable(),
    })
    .safeParse(input)
  if (!parsed.success) return { ok: false, message: "Valid @mendanize.com address required" }
  try {
    const row = await createEmsSender(parsed.data)
    await audit(session, "create", "email_sender", `Added ${row.address}`, row.id)
    revalidateEms(`${EMS_BASE}/senders`)
    return { ok: true, message: "Sender added (PENDING until verified)" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function updateEmsSenderAction(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const session = await requireSuperAdministrator()
  if (!session) return { ok: false, message: "Super Administrator required" }
  const parsed = z
    .object({
      displayName: z.string().optional(),
      replyTo: z.string().optional().nullable(),
      status: z.enum(["PENDING", "VERIFIED", "FAILED"]).optional(),
      enabled: z.boolean().optional(),
    })
    .safeParse(input)
  if (!parsed.success) return { ok: false, message: "Validation failed" }
  try {
    await updateEmsSender(id, parsed.data)
    await audit(session, "update", "email_sender", "Updated sender", id)
    revalidateEms(`${EMS_BASE}/senders`)
    return { ok: true, message: "Sender updated" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function deleteEmsSenderAction(id: string): Promise<ActionResult> {
  const session = await requireSuperAdministrator()
  if (!session) return { ok: false, message: "Super Administrator required" }
  try {
    await deleteEmsSender(id)
    await audit(session, "delete", "email_sender", "Removed sender", id)
    revalidateEms(`${EMS_BASE}/senders`)
    return { ok: true, message: "Sender removed" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function createEmsVariableAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = z
    .object({
      key: z.string().min(1).max(80),
      label: z.string().min(1).max(120),
      description: z.string().optional().nullable(),
      sampleValue: z.string().optional().nullable(),
    })
    .safeParse(input)
  if (!parsed.success) return { ok: false, message: "Key and label required" }
  try {
    const row = await createEmsVariable(parsed.data)
    await audit(session, "create", "email_variable", `Added {{${row.key}}}`, row.id)
    revalidateEms(`${EMS_BASE}/variables`)
    return { ok: true, message: "Variable added" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function upsertEmsAutomationAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireAdmin()
  if (!session) return { ok: false, message: "Admin required" }
  const parsed = z
    .object({
      id: z.string().optional(),
      name: z.string().min(1).max(200),
      eventKey: z.string().min(1).max(120),
      templateKey: z.string().min(1).max(120),
      senderId: z.string().optional().nullable(),
      enabled: z.boolean().optional(),
      delayMinutes: z.number().int().min(0).max(10080).optional(),
    })
    .safeParse(input)
  if (!parsed.success) return { ok: false, message: "Validation failed" }
  try {
    const row = await upsertEmsAutomation(parsed.data)
    await audit(
      session,
      parsed.data.id ? "update" : "create",
      "email_automation",
      `${parsed.data.id ? "Updated" : "Created"} automation “${row.name}”`,
      row.id,
    )
    revalidateEms(`${EMS_BASE}/automations`)
    return { ok: true, message: "Automation saved" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function retryEmsQueueAction(id: string): Promise<ActionResult> {
  const session = await requireAdmin()
  if (!session) return { ok: false, message: "Admin required" }
  try {
    await retryEmsQueueItem(id)
    await audit(session, "retry", "email_queue", "Retried queue item", id)
    revalidateEms(`${EMS_BASE}/queue`, `${EMS_BASE}/analytics`)
    return { ok: true, message: "Retry complete" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function cancelEmsQueueAction(id: string): Promise<ActionResult> {
  const session = await requireAdmin()
  if (!session) return { ok: false, message: "Admin required" }
  try {
    await cancelEmsQueueItem(id)
    await audit(session, "cancel", "email_queue", "Cancelled queue item", id)
    revalidateEms(`${EMS_BASE}/queue`)
    return { ok: true, message: "Cancelled" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function updateEmsSettingsAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireSuperAdministrator()
  if (!session) return { ok: false, message: "Super Administrator required" }
  const parsed = z
    .object({
      senderName: z.string().optional(),
      senderEmail: z.string().optional(),
      smtpHost: z.string().optional().nullable(),
      smtpPort: z.number().int().optional(),
      smtpUser: z.string().optional().nullable(),
      smtpPassword: z.string().optional().nullable(),
      smtpSecure: z.boolean().optional(),
      defaultReplyTo: z.string().optional().nullable(),
      brandLogoUrl: z.string().optional().nullable(),
      footerHtml: z.string().optional().nullable(),
      companyAddress: z.string().optional().nullable(),
      socialLinksJson: z.string().optional().nullable(),
      unsubscribeFooterHtml: z.string().optional().nullable(),
      trackingOpens: z.boolean().optional(),
      trackingClicks: z.boolean().optional(),
      templatesNote: z.string().optional().nullable(),
    })
    .safeParse(input)
  if (!parsed.success) return { ok: false, message: "Validation failed" }
  try {
    await updateEmsSettingsExtended(parsed.data, {
      id: session.admin.id,
      email: session.admin.email,
    })
    revalidateEms(`${EMS_BASE}/settings`, "/dashboard/settings/email")
    return { ok: true, message: "Settings saved" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}
