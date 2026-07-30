/**
 * Affiliate & Referral Tracking — MES-046.
 * Primary reward: manual Admin payout flag (no Stripe Connect / third processor).
 */

import "server-only"

import { createHash, randomBytes } from "crypto"
import {
  ReferralRewardStatus,
  ReferralConversionStatus,
} from "@prisma/client"

import {
  assertDatabaseForProductionWrites,
  getPrisma,
  isDatabaseConfigured,
} from "@/lib/db/prisma"
import { ValidationError } from "@/lib/api/errors"
import { recordAudit } from "@/services/admin/audit"
import {
  DEFAULT_ATTRIBUTION_WINDOW_DAYS,
  PRIMARY_REWARD_MECHANISM,
  REFERRAL_CODE_PATTERN,
} from "./constants"
import type {
  AdminReferralOverview,
  LearnerReferralDashboard,
  ReferralCodeRecord,
  ReferralSettingRecord,
} from "./types"

function db() {
  return getPrisma()
}

function sharePath(code: string) {
  return `/?ref=${encodeURIComponent(code)}`
}

function mapSettings(row: {
  enabled: boolean
  attributionWindowDays: number
  rewardMechanism: string
}): ReferralSettingRecord {
  return {
    enabled: row.enabled,
    attributionWindowDays: row.attributionWindowDays,
    rewardMechanism: row.rewardMechanism,
  }
}

function mapCode(row: {
  id: string
  publicUserId: string
  code: string
  enabled: boolean
  disabledReason: string | null
  createdAt: Date
}): ReferralCodeRecord {
  return {
    id: row.id,
    publicUserId: row.publicUserId,
    code: row.code,
    enabled: row.enabled,
    disabledReason: row.disabledReason,
    sharePath: sharePath(row.code),
    createdAt: row.createdAt.toISOString(),
  }
}

function generateCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const bytes = randomBytes(8)
  let out = ""
  for (let i = 0; i < 8; i++) {
    out += alphabet[bytes[i]! % alphabet.length]
  }
  return out
}

function normalizeCode(raw: string): string | null {
  const code = raw.trim().toUpperCase()
  if (!REFERRAL_CODE_PATTERN.test(code)) return null
  return code
}

export async function getReferralSettings(): Promise<ReferralSettingRecord> {
  if (!isDatabaseConfigured()) {
    return {
      enabled: true,
      attributionWindowDays: DEFAULT_ATTRIBUTION_WINDOW_DAYS,
      rewardMechanism: PRIMARY_REWARD_MECHANISM,
    }
  }
  const existing = await db().referralSetting.findUnique({
    where: { key: "main" },
  })
  if (existing) return mapSettings(existing)
  const created = await db().referralSetting.create({
    data: {
      key: "main",
      enabled: true,
      attributionWindowDays: DEFAULT_ATTRIBUTION_WINDOW_DAYS,
      rewardMechanism: PRIMARY_REWARD_MECHANISM,
    },
  })
  return mapSettings(created)
}

export async function updateReferralSettings(input: {
  enabled?: boolean
  attributionWindowDays?: number
  adminId?: string | null
  adminEmail?: string | null
}): Promise<ReferralSettingRecord> {
  assertDatabaseForProductionWrites("services/referrals")
  const current = await getReferralSettings()
  const windowDays =
    input.attributionWindowDays ?? current.attributionWindowDays
  if (windowDays < 1 || windowDays > 365) {
    throw new ValidationError("Attribution window must be 1–365 days.")
  }
  const row = await db().referralSetting.upsert({
    where: { key: "main" },
    create: {
      key: "main",
      enabled: input.enabled ?? true,
      attributionWindowDays: windowDays,
      rewardMechanism: PRIMARY_REWARD_MECHANISM,
    },
    update: {
      ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
      attributionWindowDays: windowDays,
      rewardMechanism: PRIMARY_REWARD_MECHANISM,
    },
  })
  await recordAudit({
    actorId: input.adminId,
    actorEmail: input.adminEmail,
    action: "update",
    entityType: "referral_setting",
    entityId: row.id,
    summary: `Updated referral settings (enabled=${row.enabled}, window=${row.attributionWindowDays}d)`,
    metadata: { rewardMechanism: row.rewardMechanism },
  })
  return mapSettings(row)
}

export async function ensureReferralCode(
  publicUserId: string,
): Promise<ReferralCodeRecord> {
  assertDatabaseForProductionWrites("services/referrals")
  if (!isDatabaseConfigured()) {
    throw new ValidationError("Database not configured.")
  }
  const existing = await db().referralCode.findUnique({
    where: { publicUserId },
  })
  if (existing) return mapCode(existing)

  for (let attempt = 0; attempt < 8; attempt++) {
    const code = generateCode()
    try {
      const created = await db().referralCode.create({
        data: { publicUserId, code },
      })
      return mapCode(created)
    } catch {
      /* unique collision — retry */
    }
  }
  throw new ValidationError("Could not allocate a referral code.")
}

export async function getLearnerReferralDashboard(
  publicUserId: string,
): Promise<LearnerReferralDashboard> {
  const [settings, code] = await Promise.all([
    getReferralSettings(),
    ensureReferralCode(publicUserId),
  ])

  if (!isDatabaseConfigured()) {
    return {
      code,
      settings,
      attributionCount: 0,
      conversionCount: 0,
      pendingRewards: 0,
      grantedRewards: 0,
      recentAttributions: [],
      recentConversions: [],
    }
  }

  const row = await db().referralCode.findUnique({
    where: { publicUserId },
    include: {
      attributions: {
        orderBy: { attributedAt: "desc" },
        take: 20,
        include: {
          conversion: { include: { reward: true } },
        },
      },
    },
  })

  const attributions = row?.attributions ?? []
  const conversions = attributions
    .map((a) => a.conversion)
    .filter((c): c is NonNullable<typeof c> => Boolean(c))

  return {
    code,
    settings,
    attributionCount: attributions.length,
    conversionCount: conversions.length,
    pendingRewards: conversions.filter(
      (c) => c.reward?.status === ReferralRewardStatus.PENDING_PAYOUT,
    ).length,
    grantedRewards: conversions.filter(
      (c) => c.reward?.status === ReferralRewardStatus.GRANTED,
    ).length,
    recentAttributions: attributions.map((a) => ({
      id: a.id,
      attributedAt: a.attributedAt.toISOString(),
      converted: Boolean(a.conversion),
      abuseFlagged: a.abuseFlagged,
    })),
    recentConversions: conversions.map((c) => ({
      id: c.id,
      planTier: c.planTier,
      convertedAt: c.convertedAt.toISOString(),
      rewardStatus: c.reward?.status ?? null,
    })),
  }
}

/**
 * Record first-touch attribution after PublicUser signup.
 * Safe to call with null code — no-ops.
 */
export async function attributeSignup(input: {
  referredUserId: string
  referralCode: string | null | undefined
  landingPath?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  cookieCapturedAt?: Date | null
}): Promise<{ attributed: boolean; reason?: string }> {
  if (!isDatabaseConfigured()) return { attributed: false, reason: "no_db" }
  const settings = await getReferralSettings()
  if (!settings.enabled) return { attributed: false, reason: "disabled" }

  const code = input.referralCode ? normalizeCode(input.referralCode) : null
  if (!code) return { attributed: false, reason: "no_code" }

  const existing = await db().referralAttribution.findUnique({
    where: { referredUserId: input.referredUserId },
  })
  if (existing) return { attributed: false, reason: "already_attributed" }

  const referral = await db().referralCode.findUnique({ where: { code } })
  if (!referral || !referral.enabled) {
    return { attributed: false, reason: "invalid_or_disabled" }
  }

  if (referral.publicUserId === input.referredUserId) {
    await db().referralAttribution.create({
      data: {
        referralCodeId: referral.id,
        referredUserId: input.referredUserId,
        codeSnapshot: code,
        landingPath: input.landingPath ?? null,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
        cookieCapturedAt: input.cookieCapturedAt ?? null,
        expiresAt: new Date(),
        selfReferralBlocked: true,
        abuseFlagged: true,
        abuseReason: "self_referral",
      },
    })
    return { attributed: false, reason: "self_referral" }
  }

  const now = new Date()
  const captured = input.cookieCapturedAt ?? now
  const expiresAt = new Date(
    captured.getTime() + settings.attributionWindowDays * 86_400_000,
  )
  if (expiresAt.getTime() < now.getTime()) {
    return { attributed: false, reason: "expired" }
  }

  let abuseFlagged = false
  let abuseReason: string | null = null
  if (input.ipAddress) {
    const referrer = await db().publicUser.findUnique({
      where: { id: referral.publicUserId },
      select: { email: true },
    })
    const referred = await db().publicUser.findUnique({
      where: { id: input.referredUserId },
      select: { email: true },
    })
    if (
      referrer?.email &&
      referred?.email &&
      emailLocalPart(referrer.email) === emailLocalPart(referred.email)
    ) {
      abuseFlagged = true
      abuseReason = "similar_email_local_part"
    }

    const recentSameIp = await db().referralAttribution.count({
      where: {
        referralCodeId: referral.id,
        ipAddress: input.ipAddress,
        attributedAt: { gte: new Date(now.getTime() - 24 * 86_400_000) },
      },
    })
    if (recentSameIp >= 3) {
      abuseFlagged = true
      abuseReason = abuseReason
        ? `${abuseReason};same_ip_burst`
        : "same_ip_burst"
    }
  }

  assertDatabaseForProductionWrites("services/referrals")
  await db().referralAttribution.create({
    data: {
      referralCodeId: referral.id,
      referredUserId: input.referredUserId,
      codeSnapshot: code,
      landingPath: input.landingPath ?? null,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent
        ? input.userAgent.slice(0, 500)
        : null,
      cookieCapturedAt: input.cookieCapturedAt ?? null,
      expiresAt,
      abuseFlagged,
      abuseReason,
    },
  })

  return { attributed: true }
}

function emailLocalPart(email: string): string {
  return email.split("@")[0]?.toLowerCase() ?? email.toLowerCase()
}

/**
 * Convert attribution → paid subscription conversion + pending payout flag.
 * Idempotent per referred user attribution.
 */
export async function recordPaidConversion(input: {
  publicUserId: string
  subscriptionId?: string | null
  stripeSubscriptionId?: string | null
  planTier: string
}): Promise<{ converted: boolean; reason?: string }> {
  if (!isDatabaseConfigured()) return { converted: false, reason: "no_db" }
  if (!input.planTier || input.planTier === "FREE") {
    return { converted: false, reason: "not_paid" }
  }

  const attribution = await db().referralAttribution.findUnique({
    where: { referredUserId: input.publicUserId },
    include: { referralCode: true, conversion: true },
  })
  if (!attribution) return { converted: false, reason: "no_attribution" }
  if (attribution.selfReferralBlocked) {
    return { converted: false, reason: "self_referral" }
  }
  if (attribution.conversion) {
    return { converted: false, reason: "already_converted" }
  }
  if (!attribution.referralCode.enabled) {
    return { converted: false, reason: "code_disabled" }
  }
  if (attribution.expiresAt.getTime() < Date.now()) {
    return { converted: false, reason: "expired" }
  }

  assertDatabaseForProductionWrites("services/referrals")

  const rewardStatus = attribution.abuseFlagged
    ? ReferralRewardStatus.BLOCKED_FRAUD
    : ReferralRewardStatus.PENDING_PAYOUT

  const conversion = await db().referralConversion.create({
    data: {
      attributionId: attribution.id,
      referredUserId: attribution.referredUserId,
      referrerUserId: attribution.referralCode.publicUserId,
      subscriptionId: input.subscriptionId ?? null,
      stripeSubscriptionId: input.stripeSubscriptionId ?? null,
      planTier: input.planTier,
      status: attribution.abuseFlagged
        ? ReferralConversionStatus.VOID
        : ReferralConversionStatus.QUALIFIED,
      reward: {
        create: {
          status: rewardStatus,
          note: attribution.abuseFlagged
            ? attribution.abuseReason
            : "Awaiting manual Admin payout",
        },
      },
    },
    include: { reward: true },
  })

  await recordAudit({
    actorId: null,
    actorEmail: null,
    action: "create",
    entityType: "referral_conversion",
    entityId: conversion.id,
    summary: `Referral conversion ${input.planTier} for user ${input.publicUserId}`,
    metadata: {
      rewardStatus,
      stripeSubscriptionId: input.stripeSubscriptionId,
      abuseFlagged: attribution.abuseFlagged,
    },
  })

  return { converted: true }
}

export async function setReferralCodeEnabled(input: {
  codeId: string
  enabled: boolean
  reason?: string | null
  adminId: string
  adminEmail?: string | null
}): Promise<ReferralCodeRecord> {
  assertDatabaseForProductionWrites("services/referrals")
  const row = await db().referralCode.update({
    where: { id: input.codeId },
    data: input.enabled
      ? {
          enabled: true,
          disabledReason: null,
          disabledAt: null,
          disabledByAdminId: null,
        }
      : {
          enabled: false,
          disabledReason: input.reason?.trim() || "Disabled by Admin",
          disabledAt: new Date(),
          disabledByAdminId: input.adminId,
        },
  })
  await recordAudit({
    actorId: input.adminId,
    actorEmail: input.adminEmail,
    action: input.enabled ? "enable" : "disable",
    entityType: "referral_code",
    entityId: row.id,
    summary: input.enabled
      ? `Enabled referral code ${row.code}`
      : `Disabled referral code ${row.code}`,
    metadata: { reason: input.reason ?? null },
  })
  return mapCode(row)
}

export async function resolveReferralReward(input: {
  rewardId: string
  status: "GRANTED" | "DENIED"
  note?: string | null
  adminId: string
  adminEmail?: string | null
}): Promise<void> {
  assertDatabaseForProductionWrites("services/referrals")
  const reward = await db().referralReward.findUnique({
    where: { id: input.rewardId },
    include: { conversion: true },
  })
  if (!reward) throw new ValidationError("Reward not found.")
  if (reward.status === ReferralRewardStatus.BLOCKED_FRAUD) {
    throw new ValidationError("Fraud-blocked rewards cannot be granted here.")
  }

  await db().$transaction([
    db().referralReward.update({
      where: { id: input.rewardId },
      data: {
        status:
          input.status === "GRANTED"
            ? ReferralRewardStatus.GRANTED
            : ReferralRewardStatus.DENIED,
        note: input.note?.trim() || reward.note,
        resolvedByAdminId: input.adminId,
        resolvedAt: new Date(),
      },
    }),
    db().referralConversion.update({
      where: { id: reward.conversionId },
      data: {
        status:
          input.status === "GRANTED"
            ? ReferralConversionStatus.REWARDED
            : ReferralConversionStatus.VOID,
      },
    }),
  ])

  await recordAudit({
    actorId: input.adminId,
    actorEmail: input.adminEmail,
    action: input.status === "GRANTED" ? "grant_reward" : "deny_reward",
    entityType: "referral_reward",
    entityId: input.rewardId,
    summary: `${input.status} referral reward (manual payout flag)`,
    metadata: { note: input.note ?? null, conversionId: reward.conversionId },
  })
}

export async function getAdminReferralOverview(): Promise<AdminReferralOverview> {
  const settings = await getReferralSettings()
  if (!isDatabaseConfigured()) {
    return {
      settings,
      codes: [],
      attributions: [],
      conversions: [],
      rewards: [],
    }
  }

  const [codes, attributions, conversions, rewards] = await Promise.all([
    db().referralCode.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        publicUser: { select: { email: true } },
        _count: { select: { attributions: true } },
        attributions: {
          select: { conversion: { select: { id: true } } },
        },
      },
    }),
    db().referralAttribution.findMany({
      orderBy: { attributedAt: "desc" },
      take: 100,
      include: {
        referralCode: { select: { code: true } },
        referredUser: { select: { email: true } },
        conversion: { select: { id: true } },
      },
    }),
    db().referralConversion.findMany({
      orderBy: { convertedAt: "desc" },
      take: 100,
      include: {
        referrerUser: { select: { email: true } },
        referredUser: { select: { email: true } },
        reward: { select: { id: true, status: true } },
      },
    }),
    db().referralReward.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        conversion: {
          include: {
            referrerUser: { select: { email: true } },
          },
        },
      },
    }),
  ])

  return {
    settings,
    codes: codes.map((c) => ({
      id: c.id,
      code: c.code,
      enabled: c.enabled,
      publicUserId: c.publicUserId,
      ownerEmail: c.publicUser.email,
      attributionCount: c._count.attributions,
      conversionCount: c.attributions.filter((a) => a.conversion).length,
      createdAt: c.createdAt.toISOString(),
    })),
    attributions: attributions.map((a) => ({
      id: a.id,
      code: a.referralCode.code,
      referredEmail: a.referredUser.email,
      attributedAt: a.attributedAt.toISOString(),
      abuseFlagged: a.abuseFlagged,
      abuseReason: a.abuseReason,
      selfReferralBlocked: a.selfReferralBlocked,
      converted: Boolean(a.conversion),
    })),
    conversions: conversions.map((c) => ({
      id: c.id,
      planTier: c.planTier,
      convertedAt: c.convertedAt.toISOString(),
      status: c.status,
      referrerEmail: c.referrerUser.email,
      referredEmail: c.referredUser.email,
      rewardId: c.reward?.id ?? null,
      rewardStatus: c.reward?.status ?? null,
    })),
    rewards: rewards.map((r) => ({
      id: r.id,
      status: r.status,
      note: r.note,
      createdAt: r.createdAt.toISOString(),
      conversionId: r.conversionId,
      referrerEmail: r.conversion.referrerUser.email,
      planTier: r.conversion.planTier,
    })),
  }
}

/** Hash helper for optional device fingerprint storage (not PII). */
export function hashDeviceHint(parts: string[]): string {
  return createHash("sha256").update(parts.filter(Boolean).join("|")).digest("hex").slice(0, 32)
}

export { normalizeCode, sharePath }
