/**
 * MES-035 — PublicUser privacy: export + delete + consent.
 */
import "server-only"

import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma"
import { recordAudit } from "@/services/admin/audit"
import { logger } from "@/lib/logger"

export async function exportPublicUserData(publicUserId: string) {
  if (!isDatabaseConfigured()) {
    return { exportedAt: new Date().toISOString(), user: null, note: "DB unavailable" }
  }
  const prisma = getPrisma()
  const user = await prisma.publicUser.findUnique({
    where: { id: publicUserId },
    include: {
      profile: true,
      subscription: true,
      savedContents: true,
      learningHistory: true,
      learningGoals: true,
      learningProgress: true,
      guideProgress: true,
      userInterests: true,
      userPreference: true,
      notificationPreference: true,
      conversations: { select: { id: true, title: true, createdAt: true, updatedAt: true } },
    },
  })

  await recordAudit({
    actorId: publicUserId,
    actorEmail: user?.email ?? null,
    action: "privacy_data_export",
    entityType: "public_user",
    entityId: publicUserId,
    summary: "PublicUser requested account data export",
  }).catch(() => undefined)

  return {
    exportedAt: new Date().toISOString(),
    user,
  }
}

export async function deletePublicUserAccount(publicUserId: string) {
  if (!isDatabaseConfigured()) {
    throw new Error("Database is not configured")
  }
  const prisma = getPrisma()
  const user = await prisma.publicUser.findUnique({
    where: { id: publicUserId },
    include: { subscription: true },
  })
  if (!user) throw new Error("Account not found")

  // Cancel Stripe subscription first when present (MES-021 / MES-035 order)
  if (user.subscription?.stripeSubscriptionId) {
    try {
      const { getStripe, isStripeConfigured } = await import(
        "@/services/billing/stripe"
      )
      if (isStripeConfigured()) {
        const stripe = getStripe()
        await stripe.subscriptions.cancel(user.subscription.stripeSubscriptionId)
      }
    } catch (error) {
      logger.warn("MES-035 Stripe cancel before delete failed", {
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }

  await recordAudit({
    actorId: publicUserId,
    actorEmail: user.email,
    action: "privacy_account_delete",
    entityType: "public_user",
    entityId: publicUserId,
    summary: "PublicUser deleted their account (cascade)",
  }).catch(() => undefined)

  await prisma.publicUser.delete({ where: { id: publicUserId } })
}

export async function saveCookieConsent(input: {
  publicUserId?: string | null
  analytics: boolean
  marketing: boolean
}) {
  if (!input.publicUserId || !isDatabaseConfigured()) return
  await getPrisma().publicUser.update({
    where: { id: input.publicUserId },
    data: {
      cookieConsentAt: new Date(),
      analyticsConsent: input.analytics,
      marketingConsent: input.marketing,
    },
  })
}
