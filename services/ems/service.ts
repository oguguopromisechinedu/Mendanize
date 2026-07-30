/**
 * MES-051 Email Management System — service layer.
 * Transport remains MES-042 (`lib/email/send` via Notification dispatch / queue worker).
 */
import "server-only"

import {
  assertDatabaseForProductionWrites,
  getPrisma,
  isDatabaseConfigured,
} from "@/lib/db/prisma"
import { sendEmail } from "@/lib/email/send"
import { logEmailEvent } from "@/lib/email/mes042"
import { interpolate } from "@/services/ems/interpolate"
import { recordAudit } from "@/services/admin/audit"

function slugify(input: string) {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "category"
  )
}

const SEED_CATEGORIES = [
  ["Welcome Email", "welcome-email", false],
  ["Newsletter", "newsletter", false],
  ["Product Updates", "product-updates", false],
  ["AI Tool Announcement", "ai-tool-announcement", false],
  ["Guide Enrollment", "guide-enrollment", false],
  ["Certificate Issued", "certificate-issued", false],
  ["Password Reset", "password-reset", true],
  ["Email Verification", "email-verification", true],
  ["Magic Login Link", "magic-login-link", true],
  ["Security Alert", "security-alert", true],
  ["Account Notification", "account-notification", false],
  ["Subscription Activated", "subscription-activated", false],
  ["Subscription Expiring", "subscription-expiring", false],
  ["Payment Successful", "payment-successful", false],
  ["Payment Failed", "payment-failed", false],
  ["Marketplace Purchase", "marketplace-purchase", false],
  ["Marketplace Sale", "marketplace-sale", false],
  ["Marketplace Approval", "marketplace-approval", false],
  ["Marketplace Rejection", "marketplace-rejection", false],
  ["Community Update", "community-update", false],
  ["Survey", "survey", false],
  ["Event Invitation", "event-invitation", false],
  ["Promotional Campaign", "promotional-campaign", false],
  ["Custom", "custom", false],
] as const

const SEED_SENDERS = [
  ["hello@mendanize.com", "Mendanize"],
  ["support@mendanize.com", "Mendanize Support"],
  ["newsletter@mendanize.com", "Mendanize Newsletter"],
  ["learn@mendanize.com", "Mendanize Learn"],
  ["marketplace@mendanize.com", "Mendanize Marketplace"],
  ["billing@mendanize.com", "Mendanize Billing"],
  ["community@mendanize.com", "Mendanize Community"],
  ["security@mendanize.com", "Mendanize Security"],
  ["notifications@mendanize.com", "Mendanize"],
  ["admin@mendanize.com", "Mendanize Admin"],
] as const

const SEED_VARIABLES = [
  ["user_name", "User name", "Alex"],
  ["first_name", "First name", "Alex"],
  ["email", "Email", "alex@example.com"],
  ["verification_link", "Verification link", "https://mendanize.com/verify"],
  ["reset_password_link", "Reset password link", "https://mendanize.com/reset"],
  ["guide_name", "Guide name", "Intro to Agents"],
  ["course_name", "Guide name (alias)", "Intro to Agents"],
  ["certificate_name", "Certificate name", "AI Fundamentals"],
  ["subscription_plan", "Subscription plan", "Professional"],
  ["tool_name", "Tool name", "Prompt Lab"],
  ["marketplace_item", "Marketplace item", "Agent Kit"],
  ["current_date", "Current date", new Date().toISOString().slice(0, 10)],
  ["current_year", "Current year", String(new Date().getFullYear())],
] as const

export async function ensureEmsSeeded() {
  if (!isDatabaseConfigured()) return
  const prisma = getPrisma()

  for (const [name, slug, systemCritical] of SEED_CATEGORIES) {
    await prisma.emailCategory.upsert({
      where: { slug },
      create: { name, slug, systemCritical },
      update: {},
    })
  }

  for (const [address, displayName] of SEED_SENDERS) {
    await prisma.emailSender.upsert({
      where: { address },
      create: {
        address,
        displayName,
        status: "VERIFIED",
        enabled: true,
      },
      update: {},
    })
  }

  for (const [key, label, sample] of SEED_VARIABLES) {
    await prisma.emailVariableDefinition.upsert({
      where: { key },
      create: {
        key,
        label,
        sampleValue: sample,
        builtin: true,
        description: `Built-in {{${key}}}`,
      },
      update: {},
    })
  }
}

function assertMendanizeSender(address: string) {
  const normalized = address.trim().toLowerCase()
  if (!normalized.endsWith("@mendanize.com")) {
    throw new Error("Senders must use a verified @mendanize.com address in v1")
  }
  return normalized
}

export async function listEmsTemplates() {
  await ensureEmsSeeded()
  if (!isDatabaseConfigured()) return []
  return getPrisma().emailTemplate.findMany({
    where: { deletedAt: null },
    include: { category: true, sender: true },
    orderBy: { updatedAt: "desc" },
  })
}

export async function getEmsTemplate(id: string) {
  await ensureEmsSeeded()
  if (!isDatabaseConfigured()) return null
  return getPrisma().emailTemplate.findFirst({
    where: { id, deletedAt: null },
    include: { category: true, sender: true, versions: { orderBy: { version: "desc" }, take: 20 } },
  })
}

export async function upsertEmsTemplate(input: {
  id?: string
  key?: string
  name: string
  subject: string
  bodyHtml: string
  bodyText?: string | null
  description?: string | null
  categoryId?: string | null
  senderId?: string | null
  replyTo?: string | null
  status?: "DRAFT" | "PUBLISHED"
  enabled?: boolean
  adminId?: string | null
}) {
  assertDatabaseForProductionWrites("services/ems")
  await ensureEmsSeeded()
  const prisma = getPrisma()

  if (input.senderId) {
    const sender = await prisma.emailSender.findUnique({ where: { id: input.senderId } })
    if (!sender || sender.status !== "VERIFIED" || !sender.enabled) {
      throw new Error("Templates may only use Verified + Enabled senders")
    }
  }

  const key =
    input.key?.trim() ||
    slugify(input.name).replace(/-/g, "_") ||
    `tpl_${Date.now()}`

  const data = {
    name: input.name.trim(),
    subject: input.subject.trim(),
    bodyHtml: input.bodyHtml,
    bodyText: input.bodyText ?? null,
    description: input.description ?? null,
    categoryId: input.categoryId ?? null,
    senderId: input.senderId ?? null,
    replyTo: input.replyTo ?? null,
    status: input.status ?? "DRAFT",
    enabled: input.enabled ?? true,
    active: (input.enabled ?? true) && (input.status ?? "DRAFT") === "PUBLISHED",
  }

  const row = input.id
    ? await prisma.emailTemplate.update({ where: { id: input.id }, data })
    : await prisma.emailTemplate.create({
        data: { ...data, key },
      })

  const last = await prisma.emailTemplateVersion.findFirst({
    where: { templateId: row.id },
    orderBy: { version: "desc" },
  })
  await prisma.emailTemplateVersion.create({
    data: {
      templateId: row.id,
      version: (last?.version ?? 0) + 1,
      subject: row.subject,
      bodyHtml: row.bodyHtml,
      bodyText: row.bodyText,
      createdByAdminId: input.adminId ?? null,
    },
  })

  return row
}

export async function duplicateEmsTemplate(id: string, adminId?: string) {
  const src = await getEmsTemplate(id)
  if (!src) throw new Error("Template not found")
  return upsertEmsTemplate({
    name: `${src.name} (Copy)`,
    key: `${src.key}_copy_${Date.now()}`,
    subject: src.subject,
    bodyHtml: src.bodyHtml,
    bodyText: src.bodyText,
    description: src.description,
    categoryId: src.categoryId,
    senderId: src.senderId,
    replyTo: src.replyTo,
    status: "DRAFT",
    enabled: false,
    adminId,
  })
}

export async function softDeleteEmsTemplate(id: string) {
  assertDatabaseForProductionWrites("services/ems")
  return getPrisma().emailTemplate.update({
    where: { id },
    data: { deletedAt: new Date(), enabled: false, active: false },
  })
}

export async function listEmsCategories() {
  await ensureEmsSeeded()
  if (!isDatabaseConfigured()) return []
  return getPrisma().emailCategory.findMany({ orderBy: { name: "asc" } })
}

export async function createEmsCategory(name: string) {
  assertDatabaseForProductionWrites("services/ems")
  await ensureEmsSeeded()
  const slug = slugify(name)
  return getPrisma().emailCategory.create({
    data: { name: name.trim(), slug },
  })
}

export async function deleteEmsCategory(id: string) {
  assertDatabaseForProductionWrites("services/ems")
  const cat = await getPrisma().emailCategory.findUnique({ where: { id } })
  if (!cat) throw new Error("Category not found")
  if (cat.systemCritical) throw new Error("System-critical categories cannot be deleted")
  const inUse = await getPrisma().emailTemplate.count({
    where: { categoryId: id, deletedAt: null },
  })
  if (inUse > 0) throw new Error("Category is referenced by templates")
  return getPrisma().emailCategory.delete({ where: { id } })
}

export async function listEmsSenders() {
  await ensureEmsSeeded()
  if (!isDatabaseConfigured()) return []
  return getPrisma().emailSender.findMany({ orderBy: { address: "asc" } })
}

export async function createEmsSender(input: {
  address: string
  displayName: string
  replyTo?: string | null
}) {
  assertDatabaseForProductionWrites("services/ems")
  await ensureEmsSeeded()
  const address = assertMendanizeSender(input.address)
  return getPrisma().emailSender.create({
    data: {
      address,
      displayName: input.displayName.trim() || address,
      replyTo: input.replyTo ?? null,
      status: "PENDING",
      enabled: true,
    },
  })
}

export async function updateEmsSender(
  id: string,
  input: {
    displayName?: string
    replyTo?: string | null
    status?: "PENDING" | "VERIFIED" | "FAILED"
    enabled?: boolean
  }
) {
  assertDatabaseForProductionWrites("services/ems")
  return getPrisma().emailSender.update({
    where: { id },
    data: {
      ...(input.displayName !== undefined
        ? { displayName: input.displayName.trim() }
        : {}),
      ...(input.replyTo !== undefined ? { replyTo: input.replyTo } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
    },
  })
}

export async function deleteEmsSender(id: string) {
  assertDatabaseForProductionWrites("services/ems")
  return getPrisma().emailSender.delete({ where: { id } })
}

export async function listEmsVariables() {
  await ensureEmsSeeded()
  if (!isDatabaseConfigured()) return []
  return getPrisma().emailVariableDefinition.findMany({ orderBy: { key: "asc" } })
}

export async function createEmsVariable(input: {
  key: string
  label: string
  description?: string | null
  sampleValue?: string | null
}) {
  assertDatabaseForProductionWrites("services/ems")
  const key = input.key.trim().replace(/^\{\{|\}\}$/g, "").replace(/\s+/g, "_")
  return getPrisma().emailVariableDefinition.create({
    data: {
      key,
      label: input.label.trim(),
      description: input.description ?? null,
      sampleValue: input.sampleValue ?? null,
      builtin: false,
    },
  })
}

export async function listEmsAutomations() {
  await ensureEmsSeeded()
  if (!isDatabaseConfigured()) return []
  return getPrisma().emailAutomationRule.findMany({
    include: { sender: true },
    orderBy: { updatedAt: "desc" },
  })
}

export async function upsertEmsAutomation(input: {
  id?: string
  name: string
  eventKey: string
  templateKey: string
  senderId?: string | null
  enabled?: boolean
  delayMinutes?: number
}) {
  assertDatabaseForProductionWrites("services/ems")
  const data = {
    name: input.name.trim(),
    eventKey: input.eventKey.trim(),
    templateKey: input.templateKey.trim(),
    senderId: input.senderId ?? null,
    enabled: input.enabled ?? true,
    delayMinutes: input.delayMinutes ?? 0,
  }
  if (input.id) {
    return getPrisma().emailAutomationRule.update({ where: { id: input.id }, data })
  }
  return getPrisma().emailAutomationRule.create({ data })
}

export async function listEmsQueue(params: { status?: string } = {}) {
  if (!isDatabaseConfigured()) return []
  return getPrisma().emailQueueItem.findMany({
    where: params.status
      ? { status: params.status as "PENDING" | "SENDING" | "COMPLETED" | "FAILED" | "CANCELLED" }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  })
}

export async function retryEmsQueueItem(id: string) {
  assertDatabaseForProductionWrites("services/ems")
  const item = await getPrisma().emailQueueItem.findUnique({ where: { id } })
  if (!item) throw new Error("Queue item not found")
  if (item.status === "COMPLETED") throw new Error("Already completed")
  await getPrisma().emailQueueItem.update({
    where: { id },
    data: { status: "PENDING", lastError: null },
  })
  return processQueueItem(id)
}

export async function cancelEmsQueueItem(id: string) {
  assertDatabaseForProductionWrites("services/ems")
  const item = await getPrisma().emailQueueItem.findUnique({ where: { id } })
  if (!item) throw new Error("Queue item not found")
  if (item.status === "COMPLETED") throw new Error("Already completed")
  return getPrisma().emailQueueItem.update({
    where: { id },
    data: { status: "CANCELLED" },
  })
}

export async function enqueueAndSend(input: {
  toEmail: string
  subject: string
  bodyHtml?: string | null
  bodyText?: string | null
  templateKey?: string | null
  campaignId?: string | null
  isTest?: boolean
  payload?: Record<string, unknown>
  fromOverride?: { name: string; email: string; replyTo?: string | null }
}) {
  assertDatabaseForProductionWrites("services/ems")
  const prisma = getPrisma()
  const item = await prisma.emailQueueItem.create({
    data: {
      toEmail: input.toEmail,
      subject: input.subject,
      bodyHtml: input.bodyHtml ?? null,
      bodyText: input.bodyText ?? null,
      templateKey: input.templateKey ?? null,
      campaignId: input.campaignId ?? null,
      isTest: input.isTest ?? false,
      payloadJson: input.payload ? JSON.stringify(input.payload) : null,
      status: "PENDING",
    },
  })
  return processQueueItem(item.id, input.fromOverride)
}

async function processQueueItem(
  id: string,
  fromOverride?: { name: string; email: string; replyTo?: string | null }
) {
  const prisma = getPrisma()
  const item = await prisma.emailQueueItem.findUnique({ where: { id } })
  if (!item || item.status === "CANCELLED" || item.status === "COMPLETED") {
    return item
  }

  await prisma.emailQueueItem.update({
    where: { id },
    data: { status: "SENDING", attempts: { increment: 1 } },
  })

  let html = item.bodyHtml ?? undefined
  let text = item.bodyText ?? undefined
  let subject = item.subject
  const payload = item.payloadJson
    ? (JSON.parse(item.payloadJson) as Record<string, unknown>)
    : {}

  if (item.templateKey) {
    const tpl = await prisma.emailTemplate.findUnique({
      where: { key: item.templateKey },
      include: { sender: true },
    })
    if (tpl) {
      subject = interpolate(tpl.subject, payload, { html: false })
      html = interpolate(tpl.bodyHtml, payload, { html: true })
      text = interpolate(tpl.bodyText || tpl.bodyHtml, payload, { html: false })
      if (!fromOverride && tpl.sender && tpl.sender.status === "VERIFIED" && tpl.sender.enabled) {
        fromOverride = {
          name: tpl.sender.displayName,
          email: tpl.sender.address,
          replyTo: tpl.replyTo || tpl.sender.replyTo,
        }
      }
    }
  }

  // Missing mustache vars → fail (do not send half-rendered)
  const unresolved = `${subject}\n${html ?? ""}\n${text ?? ""}`.match(/\{\{[a-z0-9_]+\}\}/gi)
  if (unresolved?.length) {
    const err = `Missing variables: ${[...new Set(unresolved)].join(", ")}`
    await prisma.emailQueueItem.update({
      where: { id },
      data: { status: "FAILED", lastError: err },
    })
    await logEmailEvent({
      level: "ERROR",
      message: err,
      template: item.templateKey ?? undefined,
      email: item.toEmail,
    })
    throw new Error(err)
  }

  const { getEmailSettings } = await import("@/services/settings/platform")
  const settings = await getEmailSettings()
  const result = await sendEmail({
    to: item.toEmail,
    subject,
    html,
    text,
    replyTo:
      fromOverride?.replyTo ?? settings.defaultReplyTo ?? undefined,
    from: fromOverride
      ? { name: fromOverride.name, email: fromOverride.email }
      : undefined,
  })

  if (!result.ok) {
    await prisma.emailQueueItem.update({
      where: { id },
      data: {
        status: "FAILED",
        lastError: result.error ?? "Send failed",
      },
    })
    throw new Error(result.error ?? "Send failed")
  }

  await prisma.emailQueueItem.update({
    where: { id },
    data: {
      status: "COMPLETED",
      providerMessageId: result.id ?? null,
      sentAt: new Date(),
      lastError: null,
      subject,
      bodyHtml: html ?? null,
      bodyText: text ?? null,
    },
  })
  await prisma.emailDeliveryEvent.create({
    data: {
      queueItemId: id,
      templateKey: item.templateKey,
      campaignId: item.campaignId,
      type: "sent",
      metaJson: JSON.stringify({ provider: result.provider, id: result.id }),
    },
  })
  return prisma.emailQueueItem.findUnique({ where: { id } })
}

export async function sendTestEmsTemplate(input: {
  templateId: string
  toEmail: string
}) {
  const tpl = await getEmsTemplate(input.templateId)
  if (!tpl) throw new Error("Template not found")
  const vars = await listEmsVariables()
  const payload: Record<string, unknown> = {}
  for (const v of vars) {
    payload[v.key] = v.sampleValue ?? `sample_${v.key}`
  }
  // Safe link samples
  payload.verification_link = payload.verification_link ?? "https://mendanize.com/verify-email"
  payload.reset_password_link = payload.reset_password_link ?? "https://mendanize.com/reset-password"
  payload.verifyUrl = payload.verification_link
  payload.resetUrl = payload.reset_password_link

  return enqueueAndSend({
    toEmail: input.toEmail.trim().toLowerCase(),
    subject: tpl.subject,
    bodyHtml: tpl.bodyHtml,
    bodyText: tpl.bodyText,
    templateKey: tpl.key,
    isTest: true,
    payload,
    fromOverride:
      tpl.sender && tpl.sender.status === "VERIFIED" && tpl.sender.enabled
        ? {
            name: tpl.sender.displayName,
            email: tpl.sender.address,
            replyTo: tpl.replyTo || tpl.sender.replyTo,
          }
        : undefined,
  })
}

/** Platform modules call this instead of embedding HTML (MES-051). */
export async function emitEmailEvent(
  eventKey: string,
  input: { email: string; payload?: Record<string, unknown> }
) {
  if (!isDatabaseConfigured()) return { queued: 0 }
  await ensureEmsSeeded()
  const rules = await getPrisma().emailAutomationRule.findMany({
    where: { eventKey, enabled: true },
    include: { sender: true },
  })
  let queued = 0
  for (const rule of rules) {
    const tpl = await getPrisma().emailTemplate.findFirst({
      where: {
        key: rule.templateKey,
        deletedAt: null,
        enabled: true,
        status: "PUBLISHED",
      },
      include: { sender: true },
    })
    if (!tpl) continue
    const sender = rule.sender ?? tpl.sender
    await enqueueAndSend({
      toEmail: input.email,
      subject: tpl.subject,
      bodyHtml: tpl.bodyHtml,
      bodyText: tpl.bodyText,
      templateKey: tpl.key,
      payload: input.payload,
      fromOverride:
        sender && sender.status === "VERIFIED" && sender.enabled
          ? {
              name: sender.displayName,
              email: sender.address,
              replyTo: tpl.replyTo || sender.replyTo,
            }
          : undefined,
    })
    queued += 1
  }
  return { queued }
}

export async function getEmsAnalytics() {
  if (!isDatabaseConfigured()) {
    return {
      totalSent: 0,
      delivered: 0,
      opened: null as number | null,
      clicked: null as number | null,
      bounced: null as number | null,
      failed: 0,
      unsubscribed: null as number | null,
      spamComplaints: null as number | null,
      openRate: null as number | null,
      clickRate: null as number | null,
      deliveryRate: null as number | null,
      note: "Open/click/bounce require provider webhooks — unavailable until configured.",
    }
  }
  const prisma = getPrisma()
  const [completed, failed, sentEvents] = await Promise.all([
    prisma.emailQueueItem.count({ where: { status: "COMPLETED" } }),
    prisma.emailQueueItem.count({ where: { status: "FAILED" } }),
    prisma.emailDeliveryEvent.count({ where: { type: "sent" } }),
  ])
  const totalAttempts = completed + failed
  return {
    totalSent: completed,
    delivered: sentEvents || completed,
    opened: null as number | null,
    clicked: null as number | null,
    bounced: null as number | null,
    failed,
    unsubscribed: null as number | null,
    spamComplaints: null as number | null,
    openRate: null as number | null,
    clickRate: null as number | null,
    deliveryRate:
      totalAttempts > 0 ? Math.round((completed / totalAttempts) * 1000) / 10 : null,
    note: "Open/click/bounce/spam require provider webhooks — shown as unavailable, not zero.",
  }
}

export async function getEmsSettingsExtended() {
  const { getEmailSettings } = await import("@/services/settings/platform")
  return getEmailSettings()
}

export async function updateEmsSettingsExtended(
  input: {
    senderName?: string
    senderEmail?: string
    smtpHost?: string | null
    smtpPort?: number
    smtpUser?: string | null
    smtpPassword?: string | null
    smtpSecure?: boolean
    defaultReplyTo?: string | null
    brandLogoUrl?: string | null
    footerHtml?: string | null
    companyAddress?: string | null
    socialLinksJson?: string | null
    unsubscribeFooterHtml?: string | null
    trackingOpens?: boolean
    trackingClicks?: boolean
    templatesNote?: string | null
  },
  actor?: { id?: string | null; email?: string | null },
) {
  assertDatabaseForProductionWrites("services/ems")
  const { updateEmailSettings } = await import("@/services/settings/platform")
  const row = await updateEmailSettings(input)
  await recordAudit({
    actorId: actor?.id,
    actorEmail: actor?.email,
    action: "update",
    entityType: "email_settings",
    entityId: row.id,
    summary: "Updated EMS email settings",
  })
  return row
}
