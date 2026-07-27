/**
 * Marketplace service — MES-039 Work + AI Tools marketplaces (Stripe Connect rail).
 */

import "server-only"

import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma"
import { recordAudit } from "@/services/admin/audit"
import { dispatch as dispatchNotification, notifyStaff } from "@/services/notification"
import {
  feeCents,
  getMarketplaceAppBaseUrl,
  getStripeConnect,
  isStripeConnectConfigured,
} from "./connect"
import type {
  ContractRecord,
  JobApplicationRecord,
  JobPostingRecord,
  MarketplaceListingKind,
  MarketplaceListingRecord,
  MarketplaceListingSource,
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
  status: JobPostingRecord["status"]
  reviewNote: string | null
  publishedAt: Date | null
  createdAt: Date
  client?: { name: string | null } | null
  organization?: { name: string } | null
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
    status: row.status,
    reviewNote: row.reviewNote,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    clientName: row.client?.name ?? null,
    organizationName: row.organization?.name ?? null,
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
  status: MarketplaceListingRecord["status"]
  reviewNote: string | null
  publishedAt: Date | null
  createdAt: Date
  creator?: { name: string | null } | null
}): MarketplaceListingRecord {
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
    status: row.status,
    reviewNote: row.reviewNote,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    creatorName: row.creator?.name ?? null,
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

export async function listOpenJobs(): Promise<JobPostingRecord[]> {
  if (!isDatabaseConfigured()) return []
  const { safeDbQuery } = await import("@/lib/db/safe-query")
  return safeDbQuery("marketplace.listOpenJobs", [], async () => {
    const rows = await db().jobPosting.findMany({
      where: { status: "OPEN" },
      orderBy: { publishedAt: "desc" },
      include: {
        client: { select: { name: true } },
        organization: { select: { name: true } },
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
      where: { clientId },
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
    input.milestoneAmountCents ?? app.job.budgetCents ?? 10000

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
    link: "/account/work",
    payload: { contractId: contract.id },
  }).catch(() => undefined)

  return {
    id: contract.id,
    jobId: contract.jobId,
    clientId: contract.clientId,
    workerId: contract.workerId,
    status: contract.status,
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
  const platformFee = feeCents(milestone.amountCents)
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

export async function listApprovedListings(): Promise<MarketplaceListingRecord[]> {
  if (!isDatabaseConfigured()) return []
  const { safeDbQuery } = await import("@/lib/db/safe-query")
  return safeDbQuery("marketplace.listApprovedListings", [], async () => {
    const rows = await db().marketplaceListing.findMany({
      where: { status: "APPROVED" },
      orderBy: { publishedAt: "desc" },
      include: { creator: { select: { name: true } } },
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
  submitForReview?: boolean
}): Promise<MarketplaceListingRecord> {
  await ensureCreatorFlag(input.creatorId)
  if (input.priceCents < 0) throw new Error("Price must be non-negative.")
  const slug = await uniqueListingSlug(input.title)
  const source =
    input.source === "OFFICIAL"
      ? "BUILT_ON_MENDANIZE"
      : (input.source ?? "BUILT_ON_MENDANIZE")
  const row = await db().marketplaceListing.create({
    data: {
      creatorId: input.creatorId,
      title: input.title.trim(),
      slug,
      description: input.description.trim(),
      kind: input.kind,
      source,
      pricingModel: input.pricingModel ?? "ONE_TIME",
      priceCents: input.priceCents,
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

  const platformFee = feeCents(listing.priceCents)
  const connectConfigured = isStripeConnectConfigured()
  let stripePaymentIntentId: string | null = null

  if (connectConfigured) {
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
      status: connectConfigured ? "requires_payment" : "pending_connect_config",
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
