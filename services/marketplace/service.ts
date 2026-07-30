/**
 * Marketplace service — MES-039 Work + AI Tools marketplaces (Stripe Connect rail).
 */

import "server-only"

import { assertDatabaseForProductionWrites, getPrisma, isDatabaseConfigured } from "@/lib/db/prisma"
import { recordAudit } from "@/services/admin/audit"
import { dispatch as dispatchNotification, notifyStaff } from "@/services/notification"
import {
  getMarketplaceAppBaseUrl,
  getStripeConnect,
  isStripeConnectConfigured,
} from "./connect"
import { feeCentsFor } from "./finance"
import type {
  ContractKind,
  ContractRecord,
  JobApplicationRecord,
  JobPostingRecord,
  MaintenanceTaskPriority,
  MaintenanceTaskRecord,
  MaintenanceTaskStatus,
  MaintenanceTaskType,
  MaintenanceSubscriptionRecord,
  MarketplaceListingKind,
  MarketplaceListingRecord,
  MarketplaceListingSource,
  MarketplaceLicenseType,
  MarketplaceMetrics,
  MarketplacePricingModel,
  MarketplacePurchaseRecord,
} from "./types"

export type * from "./types"

function db() {
  return getPrisma()
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
}

async function uniqueJobSlug(base: string): Promise<string> {
  let slug = slugify(base) || `job-${Date.now()}`
  let n = 0
  while (await db().jobPosting.findUnique({ where: { slug } })) {
    n += 1
    slug = `${slugify(base)}-${n}`
  }
  return slug
}

async function uniqueListingSlug(base: string): Promise<string> {
  let slug = slugify(base) || `listing-${Date.now()}`
  let n = 0
  while (await db().marketplaceListing.findUnique({ where: { slug } })) {
    n += 1
    slug = `${slugify(base)}-${n}`
  }
  return slug
}

function mapJob(row: {
  id: string
  clientId: string
  organizationId?: string | null
  title: string
  slug: string
  description: string
  budgetCents: number | null
  currency: string
  skills: string[]
  category?: string | null
  jobType?: string | null
  location?: string | null
  experienceLevel?: string | null
  workplaceType?: string | null
  featured?: boolean | null
  status: JobPostingRecord["status"]
  reviewNote: string | null
  publishedAt: Date | null
  createdAt: Date
  client?: { name: string | null } | null
  organization?: { name: string } | null
  _count?: { applications?: number } | null
}): JobPostingRecord {
  return {
    id: row.id,
    clientId: row.clientId,
    organizationId: row.organizationId ?? null,
    title: row.title,
    slug: row.slug,
    description: row.description,
    budgetCents: row.budgetCents,
    currency: row.currency,
    skills: row.skills,
    category: row.category ?? null,
    jobType: row.jobType ?? null,
    location: row.location ?? null,
    experienceLevel: row.experienceLevel ?? null,
    workplaceType: row.workplaceType ?? null,
    featured: Boolean(row.featured),
    status: row.status,
    reviewNote: row.reviewNote,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    clientName: row.client?.name ?? null,
    organizationName: row.organization?.name ?? null,
    proposalCount: row._count?.applications,
  }
}

function mapListing(row: {
  id: string
  creatorId: string
  title: string
  slug: string
  description: string
  kind: MarketplaceListingKind
  source?: MarketplaceListingSource | null
  pricingModel: MarketplacePricingModel
  priceCents: number
  currency: string
  category?: string | null
  tags?: string[] | null
  logoUrl?: string | null
  featured?: boolean | null
  licenseType?: MarketplaceLicenseType | null
  deliveryType?: string | null
  status: MarketplaceListingRecord["status"]
  reviewNote: string | null
  publishedAt: Date | null
  createdAt: Date
  creator?: { name: string | null } | null
  reviews?: Array<{ rating: number }> | null
}): MarketplaceListingRecord {
  const reviews = row.reviews ?? []
  const reviewCount = reviews.length
  const averageRating =
    reviewCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : null
  return {
    id: row.id,
    creatorId: row.creatorId,
    title: row.title,
    slug: row.slug,
    description: row.description,
    kind: row.kind,
    source: row.source ?? "BUILT_ON_MENDANIZE",
    pricingModel: row.pricingModel,
    priceCents: row.priceCents,
    currency: row.currency,
    category: row.category ?? null,
    tags: row.tags ?? [],
    logoUrl: row.logoUrl ?? null,
    featured: Boolean(row.featured),
    licenseType: row.licenseType ?? "STANDARD",
    deliveryType: row.deliveryType ?? null,
    status: row.status,
    reviewNote: row.reviewNote,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    creatorName: row.creator?.name ?? null,
    averageRating,
    reviewCount,
  }
}

export async function ensureClientFlag(publicUserId: string) {
  if (!isDatabaseConfigured()) return null
  const { isMissingSchemaError } = await import("@/lib/db/safe-query")
  try {
    return await db().clientFlag.upsert({
      where: { publicUserId },
      create: { publicUserId, selfServe: true, active: true },
      update: { active: true, revokedAt: null },
    })
  } catch (error) {
    if (isMissingSchemaError(error)) {
      console.warn(
        "[marketplace] ClientFlag table missing — run prisma migrate deploy",
        error,
      )
      return null
    }
    throw error
  }
}

export async function ensureCreatorFlag(publicUserId: string) {
  if (!isDatabaseConfigured()) return null
  const { isMissingSchemaError } = await import("@/lib/db/safe-query")
  try {
    return await db().creatorFlag.upsert({
      where: { publicUserId },
      create: { publicUserId, selfServe: true, active: true },
      update: { active: true, revokedAt: null },
    })
  } catch (error) {
    if (isMissingSchemaError(error)) {
      console.warn(
        "[marketplace] CreatorFlag table missing — run prisma migrate deploy",
        error,
      )
      return null
    }
    throw error
  }
}

export async function hasActiveClientFlag(publicUserId: string) {
  if (!isDatabaseConfigured()) return false
  const { safeDbQuery } = await import("@/lib/db/safe-query")
  return safeDbQuery("marketplace.hasClientFlag", false, async () => {
    const row = await db().clientFlag.findUnique({ where: { publicUserId } })
    return Boolean(row?.active)
  })
}

export async function hasActiveCreatorFlag(publicUserId: string) {
  if (!isDatabaseConfigured()) return false
  const { safeDbQuery } = await import("@/lib/db/safe-query")
  return safeDbQuery("marketplace.hasCreatorFlag", false, async () => {
    const row = await db().creatorFlag.findUnique({ where: { publicUserId } })
    return Boolean(row?.active)
  })
}

export async function listOpenJobs(filters?: {
  category?: string
  query?: string
}): Promise<JobPostingRecord[]> {
  if (!isDatabaseConfigured()) return []
  const { safeDbQuery } = await import("@/lib/db/safe-query")
  return safeDbQuery("marketplace.listOpenJobs", [], async () => {
    const rows = await db().jobPosting.findMany({
      where: {
        status: "OPEN",
        NOT: { jobType: "maintenance" },
        ...(filters?.category ? { category: filters.category } : {}),
        ...(filters?.query
          ? {
              OR: [
                { title: { contains: filters.query, mode: "insensitive" } },
                { description: { contains: filters.query, mode: "insensitive" } },
                { skills: { has: filters.query } },
              ],
            }
          : {}),
      },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      include: {
        client: { select: { name: true } },
        organization: { select: { name: true } },
        _count: { select: { applications: true } },
      },
      take: 100,
    })
    return rows.map(mapJob)
  })
}

export async function listJobsForClient(clientId: string): Promise<JobPostingRecord[]> {
  if (!isDatabaseConfigured()) return []
  const { safeDbQuery } = await import("@/lib/db/safe-query")
  return safeDbQuery("marketplace.listJobsForClient", [], async () => {
    const rows = await db().jobPosting.findMany({
      where: {
        clientId,
        NOT: { jobType: "maintenance" },
      },
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { name: true } },
        organization: { select: { name: true } },
      },
    })
    return rows.map(mapJob)
  })
}

export async function getJobBySlug(slug: string): Promise<JobPostingRecord | null> {
  if (!isDatabaseConfigured()) return null
  const row = await db().jobPosting.findUnique({
    where: { slug },
    include: {
      client: { select: { name: true } },
      organization: { select: { name: true } },
    },
  })
  return row ? mapJob(row) : null
}

export async function createJobPosting(input: {
  clientId: string
  title: string
  description: string
  budgetCents?: number | null
  skills?: string[]
  organizationId?: string | null
  category?: string | null
  jobType?: string | null
  location?: string | null
  experienceLevel?: string | null
  workplaceType?: string | null
  submitForReview?: boolean
}): Promise<JobPostingRecord> {
  await ensureClientFlag(input.clientId)
  if (input.organizationId) {
    const { userCanPostForOrganization } = await import(
      "@/services/organization"
    )
    const ok = await userCanPostForOrganization(
      input.organizationId,
      input.clientId,
    )
    if (!ok) throw new Error("You cannot post jobs for this company.")

    const { getOrgEntitlements } = await import(
      "@/services/organization-licensing"
    )
    const entitlements = await getOrgEntitlements(input.organizationId)
    if (
      entitlements.hasActiveOrgPlan &&
      entitlements.marketplaceJobLimit != null
    ) {
      const activeCount = await db().jobPosting.count({
        where: {
          organizationId: input.organizationId,
          status: { notIn: ["CLOSED", "REJECTED", "FILLED"] },
        },
      })
      if (activeCount >= entitlements.marketplaceJobLimit) {
        throw new Error(
          `Company job posting limit reached (${entitlements.marketplaceJobLimit}). Upgrade the seat plan.`,
        )
      }
    }
  }
  const slug = await uniqueJobSlug(input.title)
  const status = input.submitForReview ? "PENDING_REVIEW" : "DRAFT"
  const row = await db().jobPosting.create({
    data: {
      clientId: input.clientId,
      organizationId: input.organizationId ?? null,
      title: input.title.trim(),
      slug,
      description: input.description.trim(),
      budgetCents: input.budgetCents ?? null,
      skills: input.skills ?? [],
      category: input.category?.trim() || null,
      jobType: input.jobType?.trim() || null,
      location: input.location?.trim() || null,
      experienceLevel: input.experienceLevel?.trim() || null,
      workplaceType: input.workplaceType?.trim() || null,
      status,
    },
    include: {
      client: { select: { name: true } },
      organization: { select: { name: true } },
    },
  })
  if (status === "PENDING_REVIEW") {
    await notifyStaff({
      template: "system.info",
      type: "SYSTEM",
      title: "Job pending review",
      body: `“${row.title}” was submitted for Work Marketplace review.`,
      link: "/dashboard/marketplace",
      payload: { jobId: row.id },
    }).catch(() => 0)
  }
  return mapJob(row)
}

export async function submitJobForReview(jobId: string, clientId: string) {
  const existing = await db().jobPosting.findFirst({
    where: { id: jobId, clientId, status: { in: ["DRAFT", "REJECTED"] } },
  })
  const row = await db().jobPosting.updateMany({
    where: { id: jobId, clientId, status: { in: ["DRAFT", "REJECTED"] } },
    data: { status: "PENDING_REVIEW", reviewNote: null },
  })
  if (row.count === 0) throw new Error("Job not found or not editable.")
  if (existing) {
    await notifyStaff({
      template: "system.info",
      type: "SYSTEM",
      title: "Job pending review",
      body: `“${existing.title}” was submitted for Work Marketplace review.`,
      link: "/dashboard/marketplace",
      payload: { jobId },
    }).catch(() => 0)
  }
}

export async function adminReviewJob(input: {
  jobId: string
  adminId: string
  adminEmail?: string | null
  approve: boolean
  note?: string
}) {
  const status = input.approve ? "OPEN" : "REJECTED"
  const row = await db().jobPosting.update({
    where: { id: input.jobId },
    data: {
      status,
      reviewNote: input.note ?? null,
      reviewedByAdminId: input.adminId,
      publishedAt: input.approve ? new Date() : null,
    },
  })
  await recordAudit({
    actorId: input.adminId,
    actorEmail: input.adminEmail,
    action: input.approve ? "approve_job" : "reject_job",
    entityType: "job_posting",
    entityId: row.id,
    summary: `${input.approve ? "Approved" : "Rejected"} job “${row.title}”`,
  })
  await dispatchNotification({
    channel: "in_app",
    template: "system.info",
    userId: row.clientId,
    type: "SYSTEM",
    title: input.approve ? "Job approved" : "Job needs changes",
    body: input.approve
      ? `“${row.title}” is now live on Work Marketplace.`
      : `“${row.title}” was not approved. ${input.note ?? ""}`.trim(),
    link: "/account/hiring",
    payload: { jobId: row.id },
  }).catch(() => undefined)
  return row
}

export async function applyToJob(input: {
  jobId: string
  publicUserId: string
  coverLetter: string
  bidCents?: number | null
  estimatedDays?: number | null
}): Promise<JobApplicationRecord> {
  const job = await db().jobPosting.findUnique({ where: { id: input.jobId } })
  if (!job || job.status !== "OPEN") throw new Error("Job is not open for applications.")
  if (job.clientId === input.publicUserId) {
    throw new Error("You cannot apply to your own job.")
  }
  const row = await db().jobApplication.create({
    data: {
      jobId: input.jobId,
      publicUserId: input.publicUserId,
      coverLetter: input.coverLetter.trim(),
      bidCents:
        input.bidCents != null && Number.isFinite(input.bidCents)
          ? Math.round(input.bidCents)
          : null,
      estimatedDays:
        input.estimatedDays != null && Number.isFinite(input.estimatedDays)
          ? Math.round(input.estimatedDays)
          : null,
    },
    include: { publicUser: { select: { name: true } } },
  })
  await dispatchNotification({
    channel: "in_app",
    template: "system.info",
    userId: job.clientId,
    type: "SYSTEM",
    title: "New job application",
    body: `Someone applied to “${job.title}”.`,
    link: "/account/hiring",
    payload: { jobId: job.id, applicationId: row.id },
  }).catch(() => undefined)
  return {
    id: row.id,
    jobId: row.jobId,
    publicUserId: row.publicUserId,
    coverLetter: row.coverLetter,
    bidCents: row.bidCents,
    estimatedDays: row.estimatedDays,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    applicantName: row.publicUser.name,
  }
}

export async function listApplicationsForJob(
  jobId: string,
  clientId: string,
): Promise<JobApplicationRecord[]> {
  const job = await db().jobPosting.findFirst({ where: { id: jobId, clientId } })
  if (!job) return []
  const rows = await db().jobApplication.findMany({
    where: { jobId },
    orderBy: { createdAt: "desc" },
    include: { publicUser: { select: { name: true } } },
  })
  return rows.map((row) => ({
    id: row.id,
    jobId: row.jobId,
    publicUserId: row.publicUserId,
    coverLetter: row.coverLetter,
    bidCents: row.bidCents,
    estimatedDays: row.estimatedDays,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    applicantName: row.publicUser.name,
  }))
}

export async function acceptApplication(input: {
  applicationId: string
  clientId: string
  milestoneTitle?: string
  milestoneAmountCents?: number
}): Promise<ContractRecord> {
  const app = await db().jobApplication.findUnique({
    where: { id: input.applicationId },
    include: { job: true },
  })
  if (!app || app.job.clientId !== input.clientId) {
    throw new Error("Application not found.")
  }
  if (app.job.status !== "OPEN") throw new Error("Job is not open.")

  const amount =
    input.milestoneAmountCents ??
    app.bidCents ??
    app.job.budgetCents ??
    10000

  const contract = await db().$transaction(async (tx) => {
    await tx.jobApplication.update({
      where: { id: app.id },
      data: { status: "ACCEPTED" },
    })
    await tx.jobPosting.update({
      where: { id: app.jobId },
      data: { status: "FILLED" },
    })
    const c = await tx.contract.create({
      data: {
        jobId: app.jobId,
        applicationId: app.id,
        clientId: input.clientId,
        workerId: app.publicUserId,
        milestones: {
          create: {
            title: input.milestoneTitle ?? "Delivery",
            amountCents: amount,
          },
        },
      },
    })
    return c
  })

  await dispatchNotification({
    channel: "in_app",
    template: "system.info",
    userId: app.publicUserId,
    type: "SUCCESS",
    title: "Proposal accepted",
    body: `You’re hired for “${app.job.title}”.`,
    link: `/account/work/contracts/${contract.id}`,
    payload: { contractId: contract.id },
  }).catch(() => undefined)

  return {
    id: contract.id,
    jobId: contract.jobId,
    clientId: contract.clientId,
    workerId: contract.workerId,
    status: contract.status,
    kind: contract.kind ?? "PROJECT",
    parentContractId: contract.parentContractId ?? null,
    websiteLabel: contract.websiteLabel ?? null,
    disputeNote: contract.disputeNote,
    createdAt: contract.createdAt.toISOString(),
  }
}

export async function fundMilestone(input: {
  milestoneId: string
  clientId: string
}): Promise<{ paymentId: string; status: string; connectConfigured: boolean }> {
  const milestone = await db().milestone.findUnique({
    where: { id: input.milestoneId },
    include: { contract: true },
  })
  if (!milestone || milestone.contract.clientId !== input.clientId) {
    throw new Error("Milestone not found.")
  }
  const platformFee = await feeCentsFor(milestone.amountCents, "WORK")
  const connectConfigured = isStripeConnectConfigured()
  let stripePaymentIntentId: string | null = null

  if (connectConfigured) {
    const stripe = getStripeConnect()
    const intent = await stripe.paymentIntents.create({
      amount: milestone.amountCents,
      currency: "usd",
      // Destination charges / Connect transfers land when creator account exists.
      metadata: {
        rail: "mes039_connect",
        contractId: milestone.contractId,
        milestoneId: milestone.id,
      },
      automatic_payment_methods: { enabled: true },
    })
    stripePaymentIntentId = intent.id
  }

  const payment = await db().contractPayment.create({
    data: {
      contractId: milestone.contractId,
      milestoneId: milestone.id,
      amountCents: milestone.amountCents,
      platformFeeCents: platformFee,
      stripePaymentIntentId,
      status: connectConfigured ? "requires_payment" : "pending_connect_config",
    },
  })
  await db().milestone.update({
    where: { id: milestone.id },
    data: { status: "FUNDED" },
  })

  return {
    paymentId: payment.id,
    status: payment.status,
    connectConfigured,
  }
}

/**
 * Release a FUNDED milestone to the worker via Stripe Connect transfer when configured.
 * MES-039 / MES-048 — no parallel ledger.
 */
export async function releaseMilestone(input: {
  milestoneId: string
  /** Admin or client may call; actorId used for audit context only when provided */
  actorNote?: string
}): Promise<{ status: string; stripeTransferId: string | null }> {
  assertDatabaseForProductionWrites("services/marketplace")
  const milestone = await db().milestone.findUnique({
    where: { id: input.milestoneId },
    include: {
      contract: true,
      payment: true,
    },
  })
  if (!milestone) throw new Error("Milestone not found.")
  if (milestone.status === "RELEASED") {
    return {
      status: "RELEASED",
      stripeTransferId: milestone.payment?.stripeTransferId ?? null,
    }
  }
  if (milestone.status !== "FUNDED") {
    throw new Error("Only FUNDED milestones can be released.")
  }

  let stripeTransferId: string | null = null
  const payment = milestone.payment
  if (isStripeConnectConfigured() && payment) {
    const payout = await db().creatorPayoutAccount.findUnique({
      where: { publicUserId: milestone.contract.workerId },
    })
    if (payout?.stripeConnectAccountId) {
      const stripe = getStripeConnect()
      const transferAmount = Math.max(
        0,
        payment.amountCents - payment.platformFeeCents,
      )
      if (transferAmount > 0) {
        const transfer = await stripe.transfers.create({
          amount: transferAmount,
          currency: payment.currency || "usd",
          destination: payout.stripeConnectAccountId,
          metadata: {
            rail: "mes039_connect",
            contractId: milestone.contractId,
            milestoneId: milestone.id,
            action: "release_milestone",
          },
        })
        stripeTransferId = transfer.id
      }
    }
  }

  await db().$transaction([
    db().milestone.update({
      where: { id: milestone.id },
      data: { status: "RELEASED" },
    }),
    ...(payment
      ? [
          db().contractPayment.update({
            where: { id: payment.id },
            data: {
              status: "released",
              stripeTransferId: stripeTransferId ?? payment.stripeTransferId,
            },
          }),
        ]
      : []),
  ])

  return { status: "RELEASED", stripeTransferId }
}

/**
 * Refund a FUNDED milestone via Stripe PaymentIntent refund when configured.
 * partialRefundCents optional; full amount when omitted.
 */
export async function refundMilestone(input: {
  milestoneId: string
  partialRefundCents?: number | null
}): Promise<{ status: string; refundedCents: number }> {
  assertDatabaseForProductionWrites("services/marketplace")
  const milestone = await db().milestone.findUnique({
    where: { id: input.milestoneId },
    include: { payment: true },
  })
  if (!milestone) throw new Error("Milestone not found.")
  if (milestone.status === "REFUNDED") {
    return { status: "REFUNDED", refundedCents: milestone.amountCents }
  }
  if (milestone.status !== "FUNDED" && milestone.status !== "RELEASED") {
    throw new Error("Milestone is not eligible for refund.")
  }

  const payment = milestone.payment
  const refundCents =
    input.partialRefundCents != null && input.partialRefundCents > 0
      ? Math.min(input.partialRefundCents, milestone.amountCents)
      : milestone.amountCents

  if (
    isStripeConnectConfigured() &&
    payment?.stripePaymentIntentId
  ) {
    const stripe = getStripeConnect()
    await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: refundCents,
      metadata: {
        rail: "mes039_connect",
        milestoneId: milestone.id,
        action: "dispute_refund",
      },
    })
  }

  await db().$transaction([
    db().milestone.update({
      where: { id: milestone.id },
      data: { status: "REFUNDED" },
    }),
    ...(payment
      ? [
          db().contractPayment.update({
            where: { id: payment.id },
            data: { status: "refunded" },
          }),
        ]
      : []),
  ])

  return { status: "REFUNDED", refundedCents: refundCents }
}

export async function listApprovedListings(filters?: {
  category?: string
  pricing?: "FREE" | "PAID" | "FREEMIUM" | "ALL"
  query?: string
  featuredOnly?: boolean
}): Promise<MarketplaceListingRecord[]> {
  if (!isDatabaseConfigured()) return []
  const { safeDbQuery } = await import("@/lib/db/safe-query")
  return safeDbQuery("marketplace.listApprovedListings", [], async () => {
    const pricing = filters?.pricing ?? "ALL"
    const rows = await db().marketplaceListing.findMany({
      where: {
        status: "APPROVED",
        ...(filters?.category ? { category: filters.category } : {}),
        ...(filters?.featuredOnly ? { featured: true } : {}),
        ...(pricing === "FREE"
          ? { OR: [{ pricingModel: "FREE" }, { priceCents: 0 }] }
          : pricing === "PAID"
            ? { priceCents: { gt: 0 }, pricingModel: { not: "FREE" } }
            : {}),
        ...(filters?.query
          ? {
              OR: [
                { title: { contains: filters.query, mode: "insensitive" } },
                { description: { contains: filters.query, mode: "insensitive" } },
                { tags: { has: filters.query } },
              ],
            }
          : {}),
      },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      include: {
        creator: { select: { name: true } },
        reviews: { select: { rating: true } },
      },
      take: 100,
    })
    return rows.map(mapListing)
  })
}

export async function listListingsForCreator(
  creatorId: string,
): Promise<MarketplaceListingRecord[]> {
  if (!isDatabaseConfigured()) return []
  const { safeDbQuery } = await import("@/lib/db/safe-query")
  return safeDbQuery("marketplace.listListingsForCreator", [], async () => {
    const rows = await db().marketplaceListing.findMany({
      where: { creatorId },
      orderBy: { createdAt: "desc" },
      include: { creator: { select: { name: true } } },
    })
    return rows.map(mapListing)
  })
}

export async function createMarketplaceListing(input: {
  creatorId: string
  title: string
  description: string
  kind: MarketplaceListingKind
  source?: MarketplaceListingSource
  pricingModel?: MarketplacePricingModel
  priceCents: number
  category?: string | null
  tags?: string[]
  licenseType?: MarketplaceLicenseType
  deliveryType?: string | null
  submitForReview?: boolean
}): Promise<MarketplaceListingRecord> {
  await ensureCreatorFlag(input.creatorId)
  if (input.priceCents < 0) throw new Error("Price must be non-negative.")
  const slug = await uniqueListingSlug(input.title)
  const source =
    input.source === "OFFICIAL"
      ? "BUILT_ON_MENDANIZE"
      : (input.source ?? "BUILT_ON_MENDANIZE")
  const pricingModel =
    input.priceCents === 0 ? "FREE" : (input.pricingModel ?? "ONE_TIME")
  const row = await db().marketplaceListing.create({
    data: {
      creatorId: input.creatorId,
      title: input.title.trim(),
      slug,
      description: input.description.trim(),
      kind: input.kind,
      source,
      pricingModel,
      priceCents: input.priceCents,
      category: input.category?.trim() || null,
      tags: input.tags ?? [],
      licenseType: input.licenseType ?? "STANDARD",
      deliveryType: input.deliveryType?.trim() || null,
      status: input.submitForReview ? "PENDING_REVIEW" : "DRAFT",
    },
    include: { creator: { select: { name: true } } },
  })
  if (input.submitForReview) {
    await notifyStaff({
      template: "system.info",
      type: "SYSTEM",
      title: "Listing pending review",
      body: `“${row.title}” was submitted for AI Tools Marketplace review.`,
      link: "/dashboard/marketplace",
      payload: { listingId: row.id },
    }).catch(() => 0)
  }
  return mapListing(row)
}

export async function adminSetListingSource(input: {
  listingId: string
  source: MarketplaceListingSource
  adminId: string
}): Promise<MarketplaceListingRecord> {
  const row = await db().marketplaceListing.update({
    where: { id: input.listingId },
    data: { source: input.source },
    include: { creator: { select: { name: true } } },
  })
  await recordAudit({
    actorId: input.adminId,
    action: "update",
    entityType: "marketplace_listing",
    entityId: row.id,
    summary: `Set listing source to ${input.source}`,
  }).catch(() => undefined)
  return mapListing(row)
}

export async function submitListingForReview(listingId: string, creatorId: string) {
  const existing = await db().marketplaceListing.findFirst({
    where: {
      id: listingId,
      creatorId,
      status: { in: ["DRAFT", "REJECTED"] },
    },
  })
  const row = await db().marketplaceListing.updateMany({
    where: {
      id: listingId,
      creatorId,
      status: { in: ["DRAFT", "REJECTED"] },
    },
    data: { status: "PENDING_REVIEW", reviewNote: null },
  })
  if (row.count === 0) throw new Error("Listing not found or not editable.")
  if (existing) {
    await notifyStaff({
      template: "system.info",
      type: "SYSTEM",
      title: "Listing pending review",
      body: `“${existing.title}” was submitted for AI Tools Marketplace review.`,
      link: "/dashboard/marketplace",
      payload: { listingId },
    }).catch(() => 0)
  }
}

export async function adminReviewListing(input: {
  listingId: string
  adminId: string
  adminEmail?: string | null
  approve: boolean
  note?: string
}) {
  const status = input.approve ? "APPROVED" : "REJECTED"
  const row = await db().marketplaceListing.update({
    where: { id: input.listingId },
    data: {
      status,
      reviewNote: input.note ?? null,
      reviewedByAdminId: input.adminId,
      publishedAt: input.approve ? new Date() : null,
    },
  })
  await recordAudit({
    actorId: input.adminId,
    actorEmail: input.adminEmail,
    action: input.approve ? "approve_listing" : "reject_listing",
    entityType: "marketplace_listing",
    entityId: row.id,
    summary: `${input.approve ? "Approved" : "Rejected"} listing “${row.title}”`,
  })
  await dispatchNotification({
    channel: "in_app",
    template: "system.info",
    userId: row.creatorId,
    type: "SYSTEM",
    title: input.approve ? "Listing approved" : "Listing needs changes",
    body: input.approve
      ? `“${row.title}” is now purchasable.`
      : `“${row.title}” was not approved. ${input.note ?? ""}`.trim(),
    link: "/account/marketplace",
    payload: { listingId: row.id },
  }).catch(() => undefined)
  return row
}

export async function purchaseListing(input: {
  listingId: string
  buyerId: string
}): Promise<MarketplacePurchaseRecord> {
  const listing = await db().marketplaceListing.findUnique({
    where: { id: input.listingId },
  })
  if (!listing || listing.status !== "APPROVED") {
    throw new Error("Listing is not available for purchase.")
  }
  if (listing.creatorId === input.buyerId) {
    throw new Error("You cannot buy your own listing.")
  }

  const platformFee = await feeCentsFor(listing.priceCents, "TOOLS")
  const connectConfigured = isStripeConnectConfigured()
  let stripePaymentIntentId: string | null = null

  if (connectConfigured && listing.priceCents > 0) {
    const stripe = getStripeConnect()
    const intent = await stripe.paymentIntents.create({
      amount: listing.priceCents,
      currency: listing.currency,
      metadata: {
        rail: "mes039_connect",
        listingId: listing.id,
        buyerId: input.buyerId,
      },
      automatic_payment_methods: { enabled: true },
    })
    stripePaymentIntentId = intent.id
  }

  const purchase = await db().marketplacePurchase.create({
    data: {
      listingId: listing.id,
      buyerId: input.buyerId,
      amountCents: listing.priceCents,
      currency: listing.currency,
      platformFeeCents: platformFee,
      stripePaymentIntentId,
      status:
        listing.priceCents === 0
          ? "completed"
          : connectConfigured
            ? "requires_payment"
            : "pending_connect_config",
      license: {
        create: {
          listingId: listing.id,
          ownerId: input.buyerId,
          licenseType: listing.licenseType,
          status: "ACTIVE",
        },
      },
    },
  })

  await dispatchNotification({
    channel: "in_app",
    template: "system.info",
    userId: listing.creatorId,
    type: "SUCCESS",
    title: "Marketplace sale started",
    body: `A buyer started checkout for “${listing.title}”.`,
    link: "/account/marketplace",
    payload: { purchaseId: purchase.id },
  }).catch(() => undefined)

  return {
    id: purchase.id,
    listingId: purchase.listingId,
    buyerId: purchase.buyerId,
    amountCents: purchase.amountCents,
    status: purchase.status,
    stripePaymentIntentId: purchase.stripePaymentIntentId,
    createdAt: purchase.createdAt.toISOString(),
  }
}

export async function ensureCreatorPayoutAccount(publicUserId: string) {
  await ensureCreatorFlag(publicUserId)
  const existing = await db().creatorPayoutAccount.findUnique({
    where: { publicUserId },
  })
  if (existing) return existing

  let stripeConnectAccountId: string | null = null
  if (isStripeConnectConfigured()) {
    const stripe = getStripeConnect()
    const account = await stripe.accounts.create({
      type: "express",
      metadata: { publicUserId, rail: "mes039_connect" },
    })
    stripeConnectAccountId = account.id
  }

  return db().creatorPayoutAccount.create({
    data: {
      publicUserId,
      stripeConnectAccountId,
      onboardingComplete: false,
    },
  })
}

export async function createConnectOnboardingLink(publicUserId: string) {
  const account = await ensureCreatorPayoutAccount(publicUserId)
  if (!account.stripeConnectAccountId || !isStripeConnectConfigured()) {
    return {
      url: null as string | null,
      message: "Stripe Connect is not configured yet.",
    }
  }
  const stripe = getStripeConnect()
  const base = getMarketplaceAppBaseUrl()
  const link = await stripe.accountLinks.create({
    account: account.stripeConnectAccountId,
    refresh_url: `${base}/account/marketplace?connect=refresh`,
    return_url: `${base}/account/marketplace?connect=return`,
    type: "account_onboarding",
  })
  return { url: link.url, message: null as string | null }
}

export async function listPendingJobReviews(): Promise<JobPostingRecord[]> {
  if (!isDatabaseConfigured()) return []
  const rows = await db().jobPosting.findMany({
    where: { status: "PENDING_REVIEW" },
    orderBy: { createdAt: "asc" },
    include: {
      client: { select: { name: true } },
      organization: { select: { name: true } },
    },
  })
  return rows.map(mapJob)
}

export async function listPendingListingReviews(): Promise<MarketplaceListingRecord[]> {
  if (!isDatabaseConfigured()) return []
  const rows = await db().marketplaceListing.findMany({
    where: { status: "PENDING_REVIEW" },
    orderBy: { createdAt: "asc" },
    include: { creator: { select: { name: true } } },
  })
  return rows.map(mapListing)
}

export async function listDisputedContracts(): Promise<ContractRecord[]> {
  if (!isDatabaseConfigured()) return []
  const rows = await db().contract.findMany({
    where: { status: "DISPUTED" },
    orderBy: { updatedAt: "desc" },
  })
  return rows.map((c) => ({
    id: c.id,
    jobId: c.jobId,
    clientId: c.clientId,
    workerId: c.workerId,
    status: c.status,
    kind: c.kind ?? "PROJECT",
    parentContractId: c.parentContractId ?? null,
    websiteLabel: c.websiteLabel ?? null,
    disputeNote: c.disputeNote,
    createdAt: c.createdAt.toISOString(),
  }))
}

export async function getMarketplaceMetrics(): Promise<MarketplaceMetrics> {
  const empty: MarketplaceMetrics = {
    openJobs: 0,
    pendingJobReviews: 0,
    completedContracts: 0,
    activeClients: 0,
    approvedListings: 0,
    pendingListingReviews: 0,
    purchasesCompleted: 0,
    activeCreators: 0,
  }

  if (!isDatabaseConfigured()) {
    return empty
  }

  const { safeDbQuery } = await import("@/lib/db/safe-query")

  return safeDbQuery("marketplace.metrics", empty, async () => {
    const [
      openJobs,
      pendingJobReviews,
      completedContracts,
      activeClients,
      approvedListings,
      pendingListingReviews,
      purchasesCompleted,
      activeCreators,
    ] = await Promise.all([
      db().jobPosting.count({ where: { status: "OPEN" } }),
      db().jobPosting.count({ where: { status: "PENDING_REVIEW" } }),
      db().contract.count({ where: { status: "COMPLETED" } }),
      db().clientFlag.count({ where: { active: true } }),
      db().marketplaceListing.count({ where: { status: "APPROVED" } }),
      db().marketplaceListing.count({ where: { status: "PENDING_REVIEW" } }),
      db().marketplacePurchase.count({
        where: { status: { in: ["succeeded", "completed", "paid"] } },
      }),
      db().creatorFlag.count({ where: { active: true } }),
    ])
    return {
      openJobs,
      pendingJobReviews,
      completedContracts,
      activeClients,
      approvedListings,
      pendingListingReviews,
      purchasesCompleted,
      activeCreators,
    }
  })
}

export type ContractWorkspace = {
  id: string
  status: ContractRecord["status"]
  kind: ContractKind
  parentContractId: string | null
  websiteLabel: string | null
  jobTitle: string
  jobSlug: string
  clientId: string
  workerId: string
  clientName: string | null
  workerName: string | null
  milestones: Array<{
    id: string
    title: string
    amountCents: number
    status: string
    paymentStatus: string | null
  }>
  /** ACTIVE continuation for this lineage (client may already have one) */
  activeContinuationId: string | null
  rootContractId: string
  tasks: MaintenanceTaskRecord[]
  retainer: MaintenanceSubscriptionRecord | null
  retainerPayments: Array<{
    id: string
    amountCents: number
    platformFeeCents: number
    status: string
    createdAt: string
  }>
  maintenancePlans: Array<{
    tier: string
    label: string
    amountCents: number
    summary: string
    fairUse: string
  }>
  lineagePayments: Array<{
    id: string
    contractId: string
    amountCents: number
    platformFeeCents: number
    status: string
    createdAt: string
    milestoneTitle: string | null
  }>
}

async function resolveRootContractId(contractId: string): Promise<string> {
  let currentId = contractId
  for (let i = 0; i < 20; i += 1) {
    const row = await db().contract.findUnique({
      where: { id: currentId },
      select: { id: true, parentContractId: true },
    })
    if (!row) return contractId
    if (!row.parentContractId) return row.id
    currentId = row.parentContractId
  }
  return currentId
}

function mapMaintenanceTask(row: {
  id: string
  contractId: string
  createdById: string
  assigneeId: string
  title: string
  description: string
  type: MaintenanceTaskType
  status: MaintenanceTaskStatus
  priority: MaintenanceTaskPriority
  milestoneId: string | null
  coveredByRetainer?: boolean
  createdAt: Date
  completedAt: Date | null
  milestone?: { amountCents: number; status: string } | null
}): MaintenanceTaskRecord {
  return {
    id: row.id,
    contractId: row.contractId,
    createdById: row.createdById,
    assigneeId: row.assigneeId,
    title: row.title,
    description: row.description,
    type: row.type,
    status: row.status,
    priority: row.priority,
    milestoneId: row.milestoneId,
    coveredByRetainer: Boolean(row.coveredByRetainer),
    amountCents: row.milestone?.amountCents ?? null,
    milestoneStatus: row.milestone?.status ?? null,
    createdAt: row.createdAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
  }
}

export async function getContractWorkspace(
  contractId: string,
  publicUserId: string,
): Promise<ContractWorkspace | null> {
  if (!isDatabaseConfigured()) return null
  const row = await db().contract.findFirst({
    where: {
      id: contractId,
      OR: [{ clientId: publicUserId }, { workerId: publicUserId }],
    },
    include: {
      job: { select: { title: true, slug: true } },
      client: { select: { name: true } },
      worker: { select: { name: true } },
      milestones: {
        orderBy: { createdAt: "asc" },
        include: { payment: { select: { status: true } } },
      },
      maintenanceTasks: {
        orderBy: { createdAt: "desc" },
        include: { milestone: { select: { amountCents: true, status: true } } },
      },
    },
  })
  if (!row) return null

  const rootContractId = await resolveRootContractId(row.id)
  const candidateContinuations = await db().contract.findMany({
    where: {
      kind: "CONTINUATION",
      status: "ACTIVE",
      clientId: row.clientId,
      workerId: row.workerId,
    },
    select: { id: true, parentContractId: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  })
  let activeContinuationId: string | null = null
  for (const c of candidateContinuations) {
    const cRoot = await resolveRootContractId(c.id)
    if (cRoot === rootContractId) {
      activeContinuationId = c.id
      break
    }
  }

  const lineageContracts = await db().contract.findMany({
    where: {
      OR: [{ id: rootContractId }, { parentContractId: rootContractId }],
    },
    select: { id: true },
  })
  // Also include one more hop of grandchildren (continuation-of-continuation)
  const childIds = lineageContracts.map((c) => c.id)
  const grandchildren = childIds.length
    ? await db().contract.findMany({
        where: { parentContractId: { in: childIds } },
        select: { id: true },
      })
    : []
  const lineageIds = Array.from(
    new Set([
      row.id,
      rootContractId,
      ...childIds,
      ...grandchildren.map((c) => c.id),
    ]),
  )
  const payments = await db().contractPayment.findMany({
    where: { contractId: { in: lineageIds } },
    orderBy: { createdAt: "desc" },
    take: 40,
    include: { milestone: { select: { title: true } } },
  })

  const { getActiveMaintenanceSubscription, listMaintenancePlans, listMaintenanceSubscriptionPayments } =
    await import("./retainers")
  const retainer =
    row.kind === "CONTINUATION"
      ? await getActiveMaintenanceSubscription(row.id)
      : null
  const retainerPayments = retainer
    ? (await listMaintenanceSubscriptionPayments(retainer.id)).map((p) => ({
        id: p.id,
        amountCents: p.amountCents,
        platformFeeCents: p.platformFeeCents,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
      }))
    : []

  return {
    id: row.id,
    status: row.status,
    kind: row.kind,
    parentContractId: row.parentContractId,
    websiteLabel: row.websiteLabel,
    jobTitle: row.job.title,
    jobSlug: row.job.slug,
    clientId: row.clientId,
    workerId: row.workerId,
    clientName: row.client.name,
    workerName: row.worker.name,
    milestones: row.milestones.map((m) => ({
      id: m.id,
      title: m.title,
      amountCents: m.amountCents,
      status: m.status,
      paymentStatus: m.payment?.status ?? null,
    })),
    activeContinuationId,
    rootContractId,
    tasks: row.maintenanceTasks.map(mapMaintenanceTask),
    retainer,
    retainerPayments,
    maintenancePlans: listMaintenancePlans(),
    lineagePayments: payments.map((p) => ({
      id: p.id,
      contractId: p.contractId,
      amountCents: p.amountCents,
      platformFeeCents: p.platformFeeCents,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
      milestoneTitle: p.milestone?.title ?? null,
    })),
  }
}

export async function getWorkMarketplaceLiveStats() {
  const metrics = await getMarketplaceMetrics()
  return {
    activeJobs: metrics.openJobs,
    companiesHiring: metrics.activeClients,
    freelancers: metrics.activeCreators,
    projectsCompleted: metrics.completedContracts,
  }
}

export async function addContractMilestone(input: {
  contractId: string
  clientId: string
  title: string
  amountCents: number
}) {
  if (input.amountCents <= 0) throw new Error("Milestone amount must be positive.")
  const contract = await db().contract.findFirst({
    where: {
      id: input.contractId,
      clientId: input.clientId,
      status: "ACTIVE",
    },
  })
  if (!contract) throw new Error("Contract not found.")
  return db().milestone.create({
    data: {
      contractId: contract.id,
      title: input.title.trim(),
      amountCents: Math.round(input.amountCents),
    },
  })
}

/**
 * MES-053 — mark delivery accepted. Does not reopen later; continuations are new contracts.
 */
export async function completeContract(input: {
  contractId: string
  clientId: string
}): Promise<ContractRecord> {
  const contract = await db().contract.findFirst({
    where: {
      id: input.contractId,
      clientId: input.clientId,
      status: "ACTIVE",
    },
    include: { job: { select: { title: true } } },
  })
  if (!contract) throw new Error("Contract not found or not active.")

  const openEscrow = await db().milestone.count({
    where: {
      contractId: contract.id,
      status: { in: ["PENDING", "FUNDED"] },
    },
  })
  if (openEscrow > 0) {
    throw new Error(
      "Release or clear pending/funded milestones before completing this contract.",
    )
  }

  const updated = await db().contract.update({
    where: { id: contract.id },
    data: { status: "COMPLETED", completedAt: new Date() },
  })

  await dispatchNotification({
    channel: "in_app",
    template: "system.info",
    userId: contract.workerId,
    type: "SUCCESS",
    title: "Project completed",
    body: `“${contract.job.title}” was marked complete by the client.`,
    link: `/account/work/contracts/${contract.id}`,
    payload: { contractId: contract.id },
  }).catch(() => undefined)

  return {
    id: updated.id,
    jobId: updated.jobId,
    clientId: updated.clientId,
    workerId: updated.workerId,
    status: updated.status,
    kind: updated.kind,
    parentContractId: updated.parentContractId,
    websiteLabel: updated.websiteLabel,
    disputeNote: updated.disputeNote,
    createdAt: updated.createdAt.toISOString(),
  }
}

/**
 * MES-053 Phase A — Continue Working / Hire Again from a completed (or prior) contract.
 */
export async function startContinuationContract(input: {
  sourceContractId: string
  clientId: string
  websiteLabel?: string | null
  openingNote?: string | null
}): Promise<ContractRecord> {
  const source = await db().contract.findFirst({
    where: {
      id: input.sourceContractId,
      clientId: input.clientId,
    },
    include: { job: { select: { title: true, organizationId: true } } },
  })
  if (!source) throw new Error("Contract not found.")
  if (source.status !== "COMPLETED") {
    throw new Error("Complete the project before starting ongoing maintenance.")
  }

  const rootId = await resolveRootContractId(source.id)
  const candidates = await db().contract.findMany({
    where: {
      kind: "CONTINUATION",
      status: "ACTIVE",
      clientId: source.clientId,
      workerId: source.workerId,
    },
    select: { id: true },
    take: 10,
  })
  for (const c of candidates) {
    if ((await resolveRootContractId(c.id)) === rootId) {
      throw new Error(
        "An active maintenance contract already exists for this project.",
      )
    }
  }

  const label =
    (input.websiteLabel?.trim() ||
      source.websiteLabel?.trim() ||
      source.job.title).slice(0, 120)
  const title = `Maintenance — ${label}`
  const note = input.openingNote?.trim()
  const description = [
    `Ongoing maintenance for “${label}”.`,
    `Continuation of contract ${source.id} (root ${rootId}).`,
    note ? `Client note: ${note}` : null,
  ]
    .filter(Boolean)
    .join("\n\n")

  const slug = await uniqueJobSlug(title)

  const contract = await db().$transaction(async (tx) => {
    const job = await tx.jobPosting.create({
      data: {
        clientId: source.clientId,
        organizationId: source.job.organizationId,
        title,
        slug,
        description,
        jobType: "maintenance",
        status: "FILLED",
        publishedAt: null,
        skills: [],
      },
    })
    const application = await tx.jobApplication.create({
      data: {
        jobId: job.id,
        publicUserId: source.workerId,
        coverLetter: "Auto-accepted continuation for ongoing maintenance.",
        status: "ACCEPTED",
      },
    })
    return tx.contract.create({
      data: {
        jobId: job.id,
        applicationId: application.id,
        clientId: source.clientId,
        workerId: source.workerId,
        kind: "CONTINUATION",
        parentContractId: source.id,
        websiteLabel: label,
        status: "ACTIVE",
      },
    })
  })

  await dispatchNotification({
    channel: "in_app",
    template: "system.info",
    userId: source.workerId,
    type: "SUCCESS",
    title: "Maintenance started",
    body: `Client wants to continue working on “${label}”.`,
    link: `/account/work/contracts/${contract.id}`,
    payload: { contractId: contract.id, parentContractId: source.id },
  }).catch(() => undefined)

  return {
    id: contract.id,
    jobId: contract.jobId,
    clientId: contract.clientId,
    workerId: contract.workerId,
    status: contract.status,
    kind: contract.kind,
    parentContractId: contract.parentContractId,
    websiteLabel: contract.websiteLabel,
    disputeNote: contract.disputeNote,
    createdAt: contract.createdAt.toISOString(),
  }
}

export async function cancelContinuationContract(input: {
  contractId: string
  actorId: string
}): Promise<ContractRecord> {
  const contract = await db().contract.findFirst({
    where: {
      id: input.contractId,
      kind: "CONTINUATION",
      status: "ACTIVE",
      OR: [{ clientId: input.actorId }, { workerId: input.actorId }],
    },
    include: { job: { select: { title: true } } },
  })
  if (!contract) throw new Error("Maintenance contract not found.")

  const openEscrow = await db().milestone.count({
    where: {
      contractId: contract.id,
      status: { in: ["PENDING", "FUNDED"] },
    },
  })
  if (openEscrow > 0) {
    throw new Error(
      "Clear pending or funded milestones before ending maintenance.",
    )
  }

  const updated = await db().contract.update({
    where: { id: contract.id },
    data: { status: "CANCELLED" },
  })

  const notifyId =
    input.actorId === contract.clientId ? contract.workerId : contract.clientId
  await dispatchNotification({
    channel: "in_app",
    template: "system.info",
    userId: notifyId,
    type: "INFO",
    title: "Maintenance ended",
    body: `Maintenance for “${contract.websiteLabel ?? contract.job.title}” was ended.`,
    link: `/account/work/contracts/${contract.id}`,
    payload: { contractId: contract.id },
  }).catch(() => undefined)

  return {
    id: updated.id,
    jobId: updated.jobId,
    clientId: updated.clientId,
    workerId: updated.workerId,
    status: updated.status,
    kind: updated.kind,
    parentContractId: updated.parentContractId,
    websiteLabel: updated.websiteLabel,
    disputeNote: updated.disputeNote,
    createdAt: updated.createdAt.toISOString(),
  }
}

export async function createMaintenanceTask(input: {
  contractId: string
  clientId: string
  title: string
  description: string
  type?: MaintenanceTaskType
  priority?: MaintenanceTaskPriority
  amountCents?: number | null
  coveredByRetainer?: boolean
}): Promise<MaintenanceTaskRecord> {
  const contract = await db().contract.findFirst({
    where: {
      id: input.contractId,
      clientId: input.clientId,
      status: "ACTIVE",
    },
  })
  if (!contract) throw new Error("Active contract not found.")
  if (contract.kind !== "CONTINUATION") {
    throw new Error("Tasks are only available on an active maintenance contract.")
  }
  const title = input.title.trim()
  const description = input.description.trim()
  if (!title || !description) throw new Error("Title and description are required.")

  const { getActiveMaintenanceSubscription } = await import("./retainers")
  const retainer = await getActiveMaintenanceSubscription(contract.id)
  const coveredByRetainer = Boolean(
    input.coveredByRetainer &&
      retainer &&
      (retainer.status === "ACTIVE" || retainer.status === "TRIALING"),
  )

  const amount =
    !coveredByRetainer &&
    input.amountCents != null &&
    Number.isFinite(input.amountCents)
      ? Math.round(input.amountCents)
      : null
  if (amount != null && amount <= 0) throw new Error("Amount must be positive.")

  const task = await db().$transaction(async (tx) => {
    let milestoneId: string | null = null
    if (amount != null) {
      const milestone = await tx.milestone.create({
        data: {
          contractId: contract.id,
          title: `Task: ${title}`.slice(0, 120),
          amountCents: amount,
        },
      })
      milestoneId = milestone.id
    }
    return tx.maintenanceTask.create({
      data: {
        contractId: contract.id,
        createdById: input.clientId,
        assigneeId: contract.workerId,
        title,
        description,
        type: input.type ?? "OTHER",
        priority: input.priority ?? "NORMAL",
        milestoneId,
        coveredByRetainer,
      },
      include: { milestone: { select: { amountCents: true, status: true } } },
    })
  })

  await dispatchNotification({
    channel: "in_app",
    template: "system.info",
    userId: contract.workerId,
    type: "INFO",
    title: "New maintenance task",
    body: title,
    link: `/account/work/contracts/${contract.id}`,
    payload: { contractId: contract.id, taskId: task.id },
  }).catch(() => undefined)

  return mapMaintenanceTask(task)
}

export async function updateMaintenanceTaskStatus(input: {
  taskId: string
  actorId: string
  status: MaintenanceTaskStatus
}): Promise<MaintenanceTaskRecord> {
  const task = await db().maintenanceTask.findUnique({
    where: { id: input.taskId },
    include: {
      contract: true,
      milestone: { select: { amountCents: true, status: true } },
    },
  })
  if (!task) throw new Error("Task not found.")
  const isClient = task.contract.clientId === input.actorId
  const isWorker = task.contract.workerId === input.actorId
  if (!isClient && !isWorker) throw new Error("Not allowed.")

  const next = input.status
  if (isWorker) {
    const allowed: MaintenanceTaskStatus[] = [
      "ACCEPTED",
      "DECLINED",
      "IN_PROGRESS",
      "SUBMITTED",
      "DONE",
    ]
    if (!allowed.includes(next)) throw new Error("Invalid status for worker.")
  }
  if (isClient && !isWorker) {
    const allowed: MaintenanceTaskStatus[] = ["CANCELLED", "DONE"]
    if (!allowed.includes(next)) throw new Error("Invalid status for client.")
  }

  const updated = await db().maintenanceTask.update({
    where: { id: task.id },
    data: {
      status: next,
      completedAt: next === "DONE" ? new Date() : task.completedAt,
    },
    include: { milestone: { select: { amountCents: true, status: true } } },
  })

  const notifyId = isWorker ? task.contract.clientId : task.contract.workerId
  await dispatchNotification({
    channel: "in_app",
    template: "system.info",
    userId: notifyId,
    type: "INFO",
    title: "Task updated",
    body: `“${task.title}” is now ${next.toLowerCase().replace("_", " ")}.`,
    link: `/account/work/contracts/${task.contractId}`,
    payload: { taskId: task.id, status: next },
  }).catch(() => undefined)

  return mapMaintenanceTask(updated)
}

export async function setJobFeatured(input: {
  jobId: string
  featured: boolean
  adminId: string
}) {
  const row = await db().jobPosting.update({
    where: { id: input.jobId },
    data: { featured: input.featured },
  })
  await recordAudit({
    actorId: input.adminId,
    action: "set_job_featured",
    entityType: "job_posting",
    entityId: row.id,
    summary: `${input.featured ? "Featured" : "Unfeatured"} job “${row.title}”`,
  }).catch(() => undefined)
  return row
}

export async function setListingFeatured(input: {
  listingId: string
  featured: boolean
  adminId: string
}) {
  const row = await db().marketplaceListing.update({
    where: { id: input.listingId },
    data: { featured: input.featured },
    include: { creator: { select: { name: true } } },
  })
  await recordAudit({
    actorId: input.adminId,
    action: "set_listing_featured",
    entityType: "marketplace_listing",
    entityId: row.id,
    summary: `${input.featured ? "Featured" : "Unfeatured"} listing “${row.title}”`,
  }).catch(() => undefined)
  return mapListing(row)
}

export type MarketplaceLicenseRecord = {
  id: string
  listingId: string
  listingTitle: string
  licenseType: MarketplaceLicenseType
  status: string
  createdAt: string
}

export async function listLicensesForOwner(
  ownerId: string,
): Promise<MarketplaceLicenseRecord[]> {
  if (!isDatabaseConfigured()) return []
  const rows = await db().marketplaceLicense.findMany({
    where: { ownerId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    include: { listing: { select: { title: true } } },
    take: 50,
  })
  return rows.map((r) => ({
    id: r.id,
    listingId: r.listingId,
    listingTitle: r.listing.title,
    licenseType: r.licenseType,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }))
}

export async function transferLicense(input: {
  licenseId: string
  fromOwnerId: string
  recipientEmail: string
}) {
  const email = input.recipientEmail.trim().toLowerCase()
  if (!email) throw new Error("Recipient email is required.")
  const license = await db().marketplaceLicense.findFirst({
    where: {
      id: input.licenseId,
      ownerId: input.fromOwnerId,
      status: "ACTIVE",
    },
    include: { listing: true },
  })
  if (!license) throw new Error("License not found.")
  if (license.licenseType === "STANDARD") {
    throw new Error("This license is not transferable.")
  }
  const recipient = await db().publicUser.findUnique({ where: { email } })
  if (!recipient) throw new Error("Recipient must have a Mendanize account.")
  if (recipient.id === input.fromOwnerId) {
    throw new Error("You already own this license.")
  }

  await db().marketplaceLicense.update({
    where: { id: license.id },
    data: {
      ownerId: recipient.id,
      previousOwnerId: input.fromOwnerId,
      transferredAt: new Date(),
    },
  })

  await dispatchNotification({
    channel: "in_app",
    template: "system.info",
    userId: recipient.id,
    type: "SUCCESS",
    title: "License transferred to you",
    body: `You now own the license for “${license.listing.title}”.`,
    link: "/account/tools-marketplace",
    payload: { listingId: license.listingId },
  }).catch(() => undefined)

  return { ok: true as const }
}

export async function listContractsForUser(publicUserId: string) {
  if (!isDatabaseConfigured()) return []
  return db().contract.findMany({
    where: {
      OR: [{ clientId: publicUserId }, { workerId: publicUserId }],
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      job: { select: { title: true } },
    },
  })
}
