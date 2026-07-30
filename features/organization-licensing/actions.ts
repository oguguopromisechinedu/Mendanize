"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import {
  requirePublicUser,
  requireEditor,
} from "@/features/authentication/server"
import {
  adminAdjustOrgSeats,
  createOrganizationCheckoutSession,
  createOrganizationPortalSession,
  upsertOrganizationPlan,
} from "@/services/organization-licensing"
import { getOrganizationForUser } from "@/services/organization"

type ActionResult<T = undefined> = {
  ok: boolean
  message: string
  data?: T
}

export async function startOrgPlanCheckoutAction(
  formData: FormData,
): Promise<void> {
  const session = await requirePublicUser()
  if (!session?.user?.id || !session.user.email) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent("/account/company/billing")}`)
  }
  const organizationId = String(formData.get("organizationId") ?? "")
  const planId = String(formData.get("planId") ?? "")
  const result = await createOrganizationCheckoutSession({
    organizationId,
    planId,
    actorUserId: session.user.id,
    actorEmail: session.user.email,
  })
  redirect(result.url)
}

export async function openOrgBillingPortalAction(
  formData: FormData,
): Promise<void> {
  const session = await requirePublicUser()
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent("/account/company/billing")}`)
  }
  const organizationId = String(formData.get("organizationId") ?? "")
  const result = await createOrganizationPortalSession({
    organizationId,
    actorUserId: session.user.id,
  })
  redirect(result.url)
}

export async function upsertOrganizationPlanAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session?.admin?.id) return { ok: false, message: "Admin required" }
  const parsed = z
    .object({
      id: z.string().optional(),
      key: z.string().min(2).max(64),
      name: z.string().min(2).max(120),
      description: z.string().max(2000).optional().nullable(),
      seatLimit: z.number().int().min(1).max(10000),
      askVolumeLimit: z.number().int().min(0).max(1_000_000).optional().nullable(),
      marketplaceJobLimit: z
        .number()
        .int()
        .min(0)
        .max(10000)
        .optional()
        .nullable(),
      learningSeatLimit: z.number().int().min(1).max(10000).optional().nullable(),
      stripePriceId: z.string().max(200).optional().nullable(),
      requiresVerification: z.boolean().optional(),
      active: z.boolean().optional(),
      sortOrder: z.number().int().optional(),
    })
    .safeParse(input)
  if (!parsed.success) return { ok: false, message: "Invalid plan data" }
  try {
    await upsertOrganizationPlan({
      ...parsed.data,
      adminId: session.admin.id,
      adminEmail: session.admin.email,
    })
    revalidatePath("/dashboard/organization-plans")
    return { ok: true, message: "Plan saved" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function adjustOrgSeatsAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session?.admin?.id) return { ok: false, message: "Admin required" }
  const parsed = z
    .object({
      organizationId: z.string().min(1),
      seatLimitOverride: z.number().int().min(1).max(10000).nullable(),
    })
    .safeParse(input)
  if (!parsed.success) return { ok: false, message: "Invalid seat adjust" }
  try {
    await adminAdjustOrgSeats({
      ...parsed.data,
      adminId: session.admin.id,
      adminEmail: session.admin.email,
    })
    revalidatePath("/dashboard/organization-plans")
    return { ok: true, message: "Seats updated" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function resolveCompanyForBilling() {
  const session = await requirePublicUser()
  if (!session?.user?.id) return null
  return getOrganizationForUser(session.user.id)
}
