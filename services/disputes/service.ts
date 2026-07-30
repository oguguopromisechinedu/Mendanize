/**
 * Marketplace Dispute Resolution — MES-048.
 * Human-reviewed workflow. Money movement only via MES-039 Connect helpers.
 */

import "server-only"

import type {
  DisputeReason,
  DisputeResolutionAction,
  DisputeStatus,
} from "@prisma/client"

import {
  assertDatabaseForProductionWrites,
  getPrisma,
  isDatabaseConfigured,
} from "@/lib/db/prisma"
import { ValidationError } from "@/lib/api/errors"
import { recordAudit } from "@/services/admin/audit"
import { dispatch as dispatchNotification } from "@/services/notification"
import {
  refundMilestone,
  releaseMilestone,
} from "@/services/marketplace/service"

export type DisputeListItem = {
  id: string
  contractId: string
  milestoneId: string | null
  reason: DisputeReason
  summary: string
  status: DisputeStatus
  openedByPublicUserId: string
  openerEmail: string | null
  clientId: string
  workerId: string
  jobTitle: string | null
  resolutionAction: DisputeResolutionAction | null
  resolutionNote: string | null
  createdAt: string
  updatedAt: string
}

export type DisputeDetail = DisputeListItem & {
  partialRefundCents: number | null
  resolvedAt: string | null
  statements: Array<{
    id: string
    authorId: string
    authorEmail: string | null
    body: string
    createdAt: string
  }>
  attachments: Array<{
    id: string
    url: string
    label: string | null
    mediaAssetId: string | null
    createdAt: string
  }>
  milestones: Array<{
    id: string
    title: string
    amountCents: number
    status: string
  }>
}

function db() {
  return getPrisma()
}

function mapListItem(row: {
  id: string
  contractId: string
  milestoneId: string | null
  reason: DisputeReason
  summary: string
  status: DisputeStatus
  openedByPublicUserId: string
  resolutionAction: DisputeResolutionAction | null
  resolutionNote: string | null
  createdAt: Date
  updatedAt: Date
  openedBy?: { email: string | null }
  contract: {
    clientId: string
    workerId: string
    job?: { title: string } | null
  }
}): DisputeListItem {
  return {
    id: row.id,
    contractId: row.contractId,
    milestoneId: row.milestoneId,
    reason: row.reason,
    summary: row.summary,
    status: row.status,
    openedByPublicUserId: row.openedByPublicUserId,
    openerEmail: row.openedBy?.email ?? null,
    clientId: row.contract.clientId,
    workerId: row.contract.workerId,
    jobTitle: row.contract.job?.title ?? null,
    resolutionAction: row.resolutionAction,
    resolutionNote: row.resolutionNote,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function openDispute(input: {
  contractId: string
  actorId: string
  reason: DisputeReason
  summary: string
  milestoneId?: string | null
  attachmentUrl?: string | null
  attachmentLabel?: string | null
  mediaAssetId?: string | null
}): Promise<DisputeDetail> {
  assertDatabaseForProductionWrites("services/disputes")
  const summary = input.summary.trim()
  if (summary.length < 10) {
    throw new ValidationError("Provide a clearer dispute summary (10+ characters).")
  }

  const contract = await db().contract.findUnique({
    where: { id: input.contractId },
    include: {
      job: { select: { title: true } },
      milestones: true,
      disputes: { where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } },
    },
  })
  if (!contract) throw new ValidationError("Contract not found.")
  if (
    contract.clientId !== input.actorId &&
    contract.workerId !== input.actorId
  ) {
    throw new ValidationError("Only contract parties can open a dispute.")
  }
  if (contract.status === "CANCELLED" || contract.status === "COMPLETED") {
    throw new ValidationError("This contract is not eligible for a new dispute.")
  }
  if (contract.disputes.length > 0) {
    throw new ValidationError("An open dispute already exists for this contract.")
  }

  if (input.milestoneId) {
    const ms = contract.milestones.find((m) => m.id === input.milestoneId)
    if (!ms) throw new ValidationError("Milestone not on this contract.")
  }

  const dispute = await db().$transaction(async (tx) => {
    const d = await tx.marketplaceDispute.create({
      data: {
        contractId: contract.id,
        milestoneId: input.milestoneId ?? null,
        openedByPublicUserId: input.actorId,
        reason: input.reason,
        summary,
        status: "OPEN",
        statements: {
          create: {
            authorId: input.actorId,
            body: summary,
          },
        },
        ...(input.attachmentUrl?.trim()
          ? {
              attachments: {
                create: {
                  url: input.attachmentUrl.trim(),
                  label: input.attachmentLabel?.trim() || null,
                  mediaAssetId: input.mediaAssetId?.trim() || null,
                  uploadedById: input.actorId,
                },
              },
            }
          : {}),
      },
    })
    await tx.contract.update({
      where: { id: contract.id },
      data: {
        status: "DISPUTED",
        disputeNote: summary.slice(0, 500),
      },
    })
    return d
  })

  const otherPartyId =
    contract.clientId === input.actorId ? contract.workerId : contract.clientId

  await Promise.all([
    dispatchNotification({
      channel: "in_app",
      template: "system.info",
      userId: otherPartyId,
      type: "WARNING",
      title: "Contract dispute opened",
      body: `A dispute was opened on “${contract.job.title}”.`,
      link: "/account/work/disputes",
      payload: { disputeId: dispute.id },
    }).catch(() => undefined),
    recordAudit({
      actorId: input.actorId,
      action: "open",
      entityType: "marketplace_dispute",
      entityId: dispute.id,
      summary: `Opened dispute (${input.reason}) on contract ${contract.id}`,
    }),
  ])

  return getDisputeDetail(dispute.id, input.actorId)
}

export async function addDisputeStatement(input: {
  disputeId: string
  actorId: string
  body: string
  attachmentUrl?: string | null
  attachmentLabel?: string | null
  mediaAssetId?: string | null
}): Promise<void> {
  assertDatabaseForProductionWrites("services/disputes")
  const body = input.body.trim()
  if (body.length < 3) throw new ValidationError("Statement is too short.")

  const dispute = await db().marketplaceDispute.findUnique({
    where: { id: input.disputeId },
    include: { contract: true },
  })
  if (!dispute) throw new ValidationError("Dispute not found.")
  if (
    dispute.contract.clientId !== input.actorId &&
    dispute.contract.workerId !== input.actorId
  ) {
    throw new ValidationError("Only contract parties can submit statements.")
  }
  if (
    dispute.status !== "OPEN" &&
    dispute.status !== "UNDER_REVIEW"
  ) {
    throw new ValidationError("This dispute is closed.")
  }

  await db().disputeStatement.create({
    data: {
      disputeId: dispute.id,
      authorId: input.actorId,
      body,
    },
  })
  if (input.attachmentUrl?.trim()) {
    await db().disputeAttachment.create({
      data: {
        disputeId: dispute.id,
        url: input.attachmentUrl.trim(),
        label: input.attachmentLabel?.trim() || null,
        mediaAssetId: input.mediaAssetId?.trim() || null,
        uploadedById: input.actorId,
      },
    })
  }
  if (dispute.status === "OPEN") {
    await db().marketplaceDispute.update({
      where: { id: dispute.id },
      data: { status: "UNDER_REVIEW" },
    })
  }
}

export async function withdrawDispute(input: {
  disputeId: string
  actorId: string
}): Promise<void> {
  assertDatabaseForProductionWrites("services/disputes")
  const dispute = await db().marketplaceDispute.findUnique({
    where: { id: input.disputeId },
    include: { contract: true },
  })
  if (!dispute) throw new ValidationError("Dispute not found.")
  if (dispute.openedByPublicUserId !== input.actorId) {
    throw new ValidationError("Only the opener can withdraw.")
  }
  if (dispute.status !== "OPEN" && dispute.status !== "UNDER_REVIEW") {
    throw new ValidationError("Dispute cannot be withdrawn.")
  }

  await db().$transaction([
    db().marketplaceDispute.update({
      where: { id: dispute.id },
      data: { status: "WITHDRAWN" },
    }),
    db().contract.update({
      where: { id: dispute.contractId },
      data: { status: "ACTIVE", disputeNote: null },
    }),
  ])

  await recordAudit({
    actorId: input.actorId,
    action: "withdraw",
    entityType: "marketplace_dispute",
    entityId: dispute.id,
    summary: `Withdrew dispute ${dispute.id}`,
  })
}

export async function listDisputesForUser(
  publicUserId: string,
): Promise<DisputeListItem[]> {
  if (!isDatabaseConfigured()) return []
  const rows = await db().marketplaceDispute.findMany({
    where: {
      OR: [
        { openedByPublicUserId: publicUserId },
        { contract: { clientId: publicUserId } },
        { contract: { workerId: publicUserId } },
      ],
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: {
      openedBy: { select: { email: true } },
      contract: {
        include: { job: { select: { title: true } } },
      },
    },
  })
  return rows.map(mapListItem)
}

export async function listDisputesAdmin(opts?: {
  status?: DisputeStatus
}): Promise<DisputeListItem[]> {
  if (!isDatabaseConfigured()) return []
  const rows = await db().marketplaceDispute.findMany({
    where: opts?.status ? { status: opts.status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      openedBy: { select: { email: true } },
      contract: {
        include: { job: { select: { title: true } } },
      },
    },
  })
  return rows.map(mapListItem)
}

export async function getDisputeDetail(
  disputeId: string,
  viewerId?: string | null,
): Promise<DisputeDetail> {
  if (!isDatabaseConfigured()) {
    throw new ValidationError("Database not configured.")
  }
  const row = await db().marketplaceDispute.findUnique({
    where: { id: disputeId },
    include: {
      openedBy: { select: { email: true } },
      contract: {
        include: {
          job: { select: { title: true } },
          milestones: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              title: true,
              amountCents: true,
              status: true,
            },
          },
        },
      },
      statements: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { email: true } } },
      },
      attachments: { orderBy: { createdAt: "asc" } },
    },
  })
  if (!row) throw new ValidationError("Dispute not found.")
  if (
    viewerId &&
    row.contract.clientId !== viewerId &&
    row.contract.workerId !== viewerId
  ) {
    // Admin callers pass null/undefined viewer
  }

  return {
    ...mapListItem(row),
    partialRefundCents: row.partialRefundCents,
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
    statements: row.statements.map((s) => ({
      id: s.id,
      authorId: s.authorId,
      authorEmail: s.author.email,
      body: s.body,
      createdAt: s.createdAt.toISOString(),
    })),
    attachments: row.attachments.map((a) => ({
      id: a.id,
      url: a.url,
      label: a.label,
      mediaAssetId: a.mediaAssetId,
      createdAt: a.createdAt.toISOString(),
    })),
    milestones: row.contract.milestones.map((m) => ({
      id: m.id,
      title: m.title,
      amountCents: m.amountCents,
      status: m.status,
    })),
  }
}

export async function resolveDispute(input: {
  disputeId: string
  adminId: string
  adminEmail?: string | null
  outcome: "RESOLVED" | "REJECTED"
  resolutionAction: DisputeResolutionAction
  resolutionNote: string
  milestoneId?: string | null
  partialRefundCents?: number | null
}): Promise<DisputeDetail> {
  assertDatabaseForProductionWrites("services/disputes")
  const note = input.resolutionNote.trim()
  if (note.length < 5) {
    throw new ValidationError("Resolution note is required.")
  }

  const dispute = await db().marketplaceDispute.findUnique({
    where: { id: input.disputeId },
    include: { contract: true },
  })
  if (!dispute) throw new ValidationError("Dispute not found.")
  if (dispute.status !== "OPEN" && dispute.status !== "UNDER_REVIEW") {
    throw new ValidationError("Dispute is already closed.")
  }

  const milestoneId =
    input.milestoneId || dispute.milestoneId || null

  if (
    input.resolutionAction === "RELEASE_MILESTONE" ||
    input.resolutionAction === "PARTIAL_REFUND"
  ) {
    if (!milestoneId) {
      throw new ValidationError("Select a milestone for this money action.")
    }
  }

  if (input.resolutionAction === "RELEASE_MILESTONE" && milestoneId) {
    await releaseMilestone({ milestoneId })
  }
  if (input.resolutionAction === "PARTIAL_REFUND" && milestoneId) {
    await refundMilestone({
      milestoneId,
      partialRefundCents: input.partialRefundCents ?? null,
    })
  }

  let contractStatus: "ACTIVE" | "CANCELLED" | "COMPLETED" = "ACTIVE"
  if (input.resolutionAction === "CANCEL_CONTRACT") {
    contractStatus = "CANCELLED"
  } else if (input.outcome === "RESOLVED") {
    contractStatus = "ACTIVE"
  }

  await db().$transaction([
    db().marketplaceDispute.update({
      where: { id: dispute.id },
      data: {
        status: input.outcome,
        resolutionAction: input.resolutionAction,
        resolutionNote: note,
        partialRefundCents: input.partialRefundCents ?? null,
        resolvedByAdminId: input.adminId,
        resolvedAt: new Date(),
        milestoneId: milestoneId,
      },
    }),
    db().contract.update({
      where: { id: dispute.contractId },
      data: {
        status: contractStatus,
        disputeNote: note.slice(0, 500),
        ...(contractStatus === "CANCELLED"
          ? { completedAt: new Date() }
          : {}),
      },
    }),
  ])

  await recordAudit({
    actorId: input.adminId,
    actorEmail: input.adminEmail,
    action: input.outcome === "RESOLVED" ? "resolve" : "reject",
    entityType: "marketplace_dispute",
    entityId: dispute.id,
    summary: `${input.outcome} dispute via ${input.resolutionAction}`,
    metadata: {
      milestoneId,
      partialRefundCents: input.partialRefundCents ?? null,
    },
  })

  for (const uid of [dispute.contract.clientId, dispute.contract.workerId]) {
    await dispatchNotification({
      channel: "in_app",
      template: "system.info",
      userId: uid,
      type: input.outcome === "RESOLVED" ? "SUCCESS" : "WARNING",
      title: `Dispute ${input.outcome.toLowerCase()}`,
      body: note.slice(0, 200),
      link:
        uid === dispute.contract.clientId
          ? "/account/hiring/disputes"
          : "/account/work/disputes",
      payload: { disputeId: dispute.id },
    }).catch(() => undefined)
  }

  return getDisputeDetail(dispute.id)
}

export async function markDisputeUnderReview(input: {
  disputeId: string
  adminId: string
  adminEmail?: string | null
}): Promise<void> {
  assertDatabaseForProductionWrites("services/disputes")
  await db().marketplaceDispute.update({
    where: { id: input.disputeId },
    data: { status: "UNDER_REVIEW" },
  })
  await recordAudit({
    actorId: input.adminId,
    actorEmail: input.adminEmail,
    action: "under_review",
    entityType: "marketplace_dispute",
    entityId: input.disputeId,
    summary: `Marked dispute ${input.disputeId} under review`,
  })
}

export async function listEligibleContractsForDispute(
  publicUserId: string,
  role: "client" | "worker",
): Promise<
  Array<{
    id: string
    label: string
    milestones: Array<{ id: string; title: string; status: string }>
  }>
> {
  if (!isDatabaseConfigured()) return []
  const rows = await db().contract.findMany({
    where: {
      status: "ACTIVE",
      ...(role === "client"
        ? { clientId: publicUserId }
        : { workerId: publicUserId }),
      disputes: { none: { status: { in: ["OPEN", "UNDER_REVIEW"] } } },
    },
    include: {
      job: { select: { title: true } },
      milestones: {
        select: { id: true, title: true, status: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 40,
  })
  return rows.map((c) => ({
    id: c.id,
    label: c.job.title,
    milestones: c.milestones.map((m) => ({
      id: m.id,
      title: m.title,
      status: m.status,
    })),
  }))
}
