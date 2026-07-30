"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import {
  requirePublicUser,
  requireEditor,
} from "@/features/authentication/server"
import {
  addDisputeStatement,
  markDisputeUnderReview,
  openDispute,
  resolveDispute,
  withdrawDispute,
} from "@/services/disputes"

type ActionResult<T = undefined> = {
  ok: boolean
  message: string
  data?: T
}

const reasonSchema = z.enum(["NON_PAYMENT", "SCOPE", "QUALITY", "OTHER"])

export async function openDisputeAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const session = await requirePublicUser()
  if (!session?.user?.id) return { ok: false, message: "Sign in required" }
  const parsed = z
    .object({
      contractId: z.string().min(1),
      reason: reasonSchema,
      summary: z.string().min(10).max(5000),
      milestoneId: z.string().optional().nullable(),
      attachmentUrl: z.string().url().optional().nullable().or(z.literal("")),
      attachmentLabel: z.string().max(200).optional().nullable(),
    })
    .safeParse(input)
  if (!parsed.success) return { ok: false, message: "Invalid dispute data" }
  try {
    const dispute = await openDispute({
      ...parsed.data,
      attachmentUrl: parsed.data.attachmentUrl || null,
      actorId: session.user.id,
    })
    revalidatePath("/account/hiring/disputes")
    revalidatePath("/account/work/disputes")
    revalidatePath("/dashboard/marketplace/disputes")
    return { ok: true, message: "Dispute opened", data: { id: dispute.id } }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function addDisputeStatementAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requirePublicUser()
  if (!session?.user?.id) return { ok: false, message: "Sign in required" }
  const parsed = z
    .object({
      disputeId: z.string().min(1),
      body: z.string().min(3).max(5000),
      attachmentUrl: z.string().url().optional().nullable().or(z.literal("")),
      attachmentLabel: z.string().max(200).optional().nullable(),
    })
    .safeParse(input)
  if (!parsed.success) return { ok: false, message: "Invalid statement" }
  try {
    await addDisputeStatement({
      ...parsed.data,
      attachmentUrl: parsed.data.attachmentUrl || null,
      actorId: session.user.id,
    })
    revalidatePath("/account/hiring/disputes")
    revalidatePath("/account/work/disputes")
    revalidatePath("/dashboard/marketplace/disputes")
    return { ok: true, message: "Statement added" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function withdrawDisputeAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requirePublicUser()
  if (!session?.user?.id) return { ok: false, message: "Sign in required" }
  const parsed = z.object({ disputeId: z.string().min(1) }).safeParse(input)
  if (!parsed.success) return { ok: false, message: "Invalid request" }
  try {
    await withdrawDispute({
      disputeId: parsed.data.disputeId,
      actorId: session.user.id,
    })
    revalidatePath("/account/hiring/disputes")
    revalidatePath("/account/work/disputes")
    revalidatePath("/dashboard/marketplace/disputes")
    return { ok: true, message: "Dispute withdrawn" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function resolveDisputeAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session?.admin?.id) return { ok: false, message: "Admin required" }
  const parsed = z
    .object({
      disputeId: z.string().min(1),
      outcome: z.enum(["RESOLVED", "REJECTED"]),
      resolutionAction: z.enum([
        "NONE",
        "RELEASE_MILESTONE",
        "PARTIAL_REFUND",
        "CANCEL_CONTRACT",
      ]),
      resolutionNote: z.string().min(5).max(5000),
      milestoneId: z.string().optional().nullable(),
      partialRefundCents: z.number().int().min(1).optional().nullable(),
    })
    .safeParse(input)
  if (!parsed.success) return { ok: false, message: "Invalid resolution" }
  try {
    await resolveDispute({
      ...parsed.data,
      adminId: session.admin.id,
      adminEmail: session.admin.email,
    })
    revalidatePath("/dashboard/marketplace/disputes")
    revalidatePath("/dashboard/marketplace")
    revalidatePath("/account/hiring/disputes")
    revalidatePath("/account/work/disputes")
    return { ok: true, message: "Dispute updated" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function markDisputeUnderReviewAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session?.admin?.id) return { ok: false, message: "Admin required" }
  const parsed = z.object({ disputeId: z.string().min(1) }).safeParse(input)
  if (!parsed.success) return { ok: false, message: "Invalid request" }
  try {
    await markDisputeUnderReview({
      disputeId: parsed.data.disputeId,
      adminId: session.admin.id,
      adminEmail: session.admin.email,
    })
    revalidatePath("/dashboard/marketplace/disputes")
    return { ok: true, message: "Marked under review" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}
