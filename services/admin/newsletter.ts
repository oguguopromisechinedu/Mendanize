import {
  assertDatabaseForProductionWrites,
  getPrisma,
  isDatabaseConfigured,
} from "@/lib/db/prisma"
import { listSubscribersAdmin } from "./subscribers"
import type { ListResult, NewsletterCampaignRecord } from "./types"

const nowIso = () => new Date().toISOString()

const memory = {
  items: [] as NewsletterCampaignRecord[],
  seeded: false,
}

function seed() {
  if (memory.seeded) return
  memory.seeded = true
  const t = nowIso()
  memory.items = [
    {
      id: "nl_1",
      subject: "This week in AI learning",
      previewText: "New guides and tools",
      bodyHtml: "<p>Hello learners — here is what is new.</p>",
      status: "DRAFT",
      audienceFilter: "active",
      scheduledAt: null,
      sentAt: null,
      recipientCount: 0,
      createdAt: t,
      updatedAt: t,
    },
  ]
}

function mapRow(row: {
  id: string
  subject: string
  previewText: string | null
  bodyHtml: string
  status: NewsletterCampaignRecord["status"]
  audienceFilter: string
  scheduledAt: Date | null
  sentAt: Date | null
  recipientCount: number
  createdAt: Date
  updatedAt: Date
}): NewsletterCampaignRecord {
  return {
    id: row.id,
    subject: row.subject,
    previewText: row.previewText,
    bodyHtml: row.bodyHtml,
    status: row.status,
    audienceFilter: row.audienceFilter,
    scheduledAt: row.scheduledAt?.toISOString() ?? null,
    sentAt: row.sentAt?.toISOString() ?? null,
    recipientCount: row.recipientCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function listNewsletterCampaigns(params: {
  query?: string
  page?: number
  pageSize?: number
} = {}): Promise<ListResult<NewsletterCampaignRecord>> {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 50))
  const q = params.query?.trim().toLowerCase()

  if (!isDatabaseConfigured()) {
    seed()
    let items = [...memory.items]
    if (q) items = items.filter((c) => c.subject.toLowerCase().includes(q))
    const total = items.length
    const start = (page - 1) * pageSize
    return { items: items.slice(start, start + pageSize), total, page, pageSize }
  }

  const prisma = getPrisma()
  const where = q
    ? { subject: { contains: q, mode: "insensitive" as const } }
    : {}
  const [total, rows] = await Promise.all([
    prisma.newsletterCampaign.count({ where }),
    prisma.newsletterCampaign.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])
  return { items: rows.map(mapRow), total, page, pageSize }
}

export async function createNewsletterCampaign(input: {
  subject: string
  previewText?: string | null
  bodyHtml?: string
  audienceFilter?: string
}): Promise<NewsletterCampaignRecord> {
  assertDatabaseForProductionWrites("services/admin/newsletter")
  const subject = input.subject.trim()
  if (!subject) throw new Error("Subject is required")

  if (!isDatabaseConfigured()) {
    seed()
    const t = nowIso()
    const row: NewsletterCampaignRecord = {
      id: `nl_${Date.now()}`,
      subject,
      previewText: input.previewText ?? null,
      bodyHtml: input.bodyHtml ?? "",
      status: "DRAFT",
      audienceFilter: input.audienceFilter ?? "active",
      scheduledAt: null,
      sentAt: null,
      recipientCount: 0,
      createdAt: t,
      updatedAt: t,
    }
    memory.items.unshift(row)
    return row
  }

  const row = await getPrisma().newsletterCampaign.create({
    data: {
      subject,
      previewText: input.previewText ?? null,
      bodyHtml: input.bodyHtml ?? "",
      audienceFilter: input.audienceFilter ?? "active",
    },
  })
  return mapRow(row)
}

export async function updateNewsletterCampaign(
  id: string,
  input: {
    subject?: string
    previewText?: string | null
    bodyHtml?: string
    audienceFilter?: string
    status?: NewsletterCampaignRecord["status"]
    scheduledAt?: string | null
  }
): Promise<NewsletterCampaignRecord> {
  if (!isDatabaseConfigured()) {
    seed()
    const row = memory.items.find((c) => c.id === id)
    if (!row) throw new Error("Campaign not found")
    if (input.subject !== undefined) row.subject = input.subject.trim()
    if (input.previewText !== undefined) row.previewText = input.previewText
    if (input.bodyHtml !== undefined) row.bodyHtml = input.bodyHtml
    if (input.audienceFilter !== undefined) row.audienceFilter = input.audienceFilter
    if (input.status !== undefined) row.status = input.status
    if (input.scheduledAt !== undefined) row.scheduledAt = input.scheduledAt
    row.updatedAt = nowIso()
    return row
  }

  const row = await getPrisma().newsletterCampaign.update({
    where: { id },
    data: {
      ...(input.subject !== undefined ? { subject: input.subject.trim() } : {}),
      ...(input.previewText !== undefined ? { previewText: input.previewText } : {}),
      ...(input.bodyHtml !== undefined ? { bodyHtml: input.bodyHtml } : {}),
      ...(input.audienceFilter !== undefined
        ? { audienceFilter: input.audienceFilter }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.scheduledAt !== undefined
        ? {
            scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
          }
        : {}),
    },
  })
  return mapRow(row)
}

/** Sends campaign via EMS queue → MES-042 transport (MES-051). */
export async function sendNewsletterCampaign(
  id: string
): Promise<NewsletterCampaignRecord> {
  const { isEmailConfigured } = await import("@/lib/email/send")
  if (!(await isEmailConfigured())) {
    throw new Error(
      "Email is not configured. Set RESEND_API_KEY or SMTP in Email settings."
    )
  }

  let campaign: NewsletterCampaignRecord | null = null
  if (!isDatabaseConfigured()) {
    seed()
    campaign = memory.items.find((c) => c.id === id) ?? null
  } else {
    const row = await getPrisma().newsletterCampaign.findUnique({ where: { id } })
    campaign = row ? mapRow(row) : null
  }
  if (!campaign) throw new Error("Campaign not found")

  const subscribers = await listSubscribersAdmin({
    status: "active",
    pageSize: 500,
  })
  if (!subscribers.items.length) {
    throw new Error("No active subscribers to send to")
  }

  let sent = 0
  let failed = 0
  const errors: string[] = []

  const { enqueueAndSend } = await import("@/services/ems")

  for (const sub of subscribers.items) {
    try {
      if (isDatabaseConfigured()) {
        await enqueueAndSend({
          toEmail: sub.email,
          subject: campaign.subject,
          bodyHtml: campaign.bodyHtml,
          bodyText: campaign.previewText ?? campaign.subject,
          campaignId: id,
        })
        sent++
      } else {
        const { sendEmail } = await import("@/lib/email/send")
        const result = await sendEmail({
          to: sub.email,
          subject: campaign.subject,
          html: campaign.bodyHtml,
          text: campaign.previewText ?? campaign.subject,
        })
        if (result.ok) sent++
        else {
          failed++
          if (errors.length < 5) {
            errors.push(`${sub.email}: ${result.error ?? "failed"}`)
          }
        }
      }
    } catch (e) {
      failed++
      if (errors.length < 5) {
        errors.push(
          `${sub.email}: ${e instanceof Error ? e.message : "failed"}`,
        )
      }
    }
  }

  if (sent === 0) {
    throw new Error(
      `Newsletter send failed for all recipients. ${errors.join("; ")}`
    )
  }

  const note =
    failed > 0
      ? `Sent ${sent}, failed ${failed}. ${errors.join("; ")}`
      : `Sent ${sent} via EMS queue`

  if (!isDatabaseConfigured()) {
    seed()
    const row = memory.items.find((c) => c.id === id)
    if (!row) throw new Error("Campaign not found")
    row.status = "SENT"
    row.sentAt = nowIso()
    row.recipientCount = sent
    row.updatedAt = nowIso()
    return row
  }

  const row = await getPrisma().newsletterCampaign.update({
    where: { id },
    data: {
      status: "SENT",
      sentAt: new Date(),
      recipientCount: sent,
      previewText: campaign.previewText
        ? `${campaign.previewText} — ${note}`
        : note,
    },
  })
  return mapRow(row)
}

export async function deleteNewsletterCampaigns(ids: string[]): Promise<number> {
  if (!ids.length) return 0
  if (!isDatabaseConfigured()) {
    seed()
    const before = memory.items.length
    memory.items = memory.items.filter((c) => !ids.includes(c.id))
    return before - memory.items.length
  }
  const result = await getPrisma().newsletterCampaign.deleteMany({
    where: { id: { in: ids } },
  })
  return result.count
}
