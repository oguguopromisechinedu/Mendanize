"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import {
  requirePublicUser,
  requireEditor,
} from "@/features/authentication/server"
import {
  ensureReferralCode,
  resolveReferralReward,
  setReferralCodeEnabled,
  updateReferralSettings,
} from "@/services/referrals"

type ActionResult<T = undefined> = {
  ok: boolean
  message: string
  data?: T
}

export async function ensureMyReferralCodeAction(): Promise<
  ActionResult<{ code: string; sharePath: string }>
> {
  const session = await requirePublicUser()
  if (!session?.user?.id) return { ok: false, message: "Sign in required" }
  try {
    const code = await ensureReferralCode(session.user.id)
    revalidatePath("/account/referrals")
    return {
      ok: true,
      message: "Referral code ready",
      data: { code: code.code, sharePath: code.sharePath },
    }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function updateReferralSettingsAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session?.admin?.id) return { ok: false, message: "Admin required" }
  const parsed = z
    .object({
      enabled: z.boolean().optional(),
      attributionWindowDays: z.number().int().min(1).max(365).optional(),
    })
    .safeParse(input)
  if (!parsed.success) return { ok: false, message: "Invalid settings" }
  try {
    await updateReferralSettings({
      ...parsed.data,
      adminId: session.admin.id,
      adminEmail: session.admin.email,
    })
    revalidatePath("/dashboard/referrals")
    return { ok: true, message: "Settings saved" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function setReferralCodeEnabledAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session?.admin?.id) return { ok: false, message: "Admin required" }
  const parsed = z
    .object({
      codeId: z.string().min(1),
      enabled: z.boolean(),
      reason: z.string().max(500).optional().nullable(),
    })
    .safeParse(input)
  if (!parsed.success) return { ok: false, message: "Invalid request" }
  try {
    await setReferralCodeEnabled({
      ...parsed.data,
      adminId: session.admin.id,
      adminEmail: session.admin.email,
    })
    revalidatePath("/dashboard/referrals")
    return {
      ok: true,
      message: parsed.data.enabled ? "Code enabled" : "Code disabled",
    }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function resolveReferralRewardAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session?.admin?.id) return { ok: false, message: "Admin required" }
  const parsed = z
    .object({
      rewardId: z.string().min(1),
      status: z.enum(["GRANTED", "DENIED"]),
      note: z.string().max(1000).optional().nullable(),
    })
    .safeParse(input)
  if (!parsed.success) return { ok: false, message: "Invalid request" }
  try {
    await resolveReferralReward({
      ...parsed.data,
      adminId: session.admin.id,
      adminEmail: session.admin.email,
    })
    revalidatePath("/dashboard/referrals")
    return { ok: true, message: `Reward ${parsed.data.status.toLowerCase()}` }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}
