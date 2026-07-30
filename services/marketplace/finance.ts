/**
 * MES-052 — commission rules + marketplace finance aggregates.
 * Super Admin configures fee bps without code deploy; Connect rail unchanged.
 */

import "server-only"

import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma"
import { isMissingSchemaError } from "@/lib/db/safe-query"
import { getMarketplaceFeeBps } from "./connect"

export type CommissionScope = "TOOLS" | "WORK"
export type SellerTier = "STANDARD" | "PRO" | "ENTERPRISE"

export type CommissionRuleRecord = {
  id: string
  scope: CommissionScope
  sellerTier: SellerTier
  feeBps: number
  label: string | null
  active: boolean
  updatedAt: string
}

export type MarketplaceFinanceOverview = {
  toolsGrossCents: number
  toolsPlatformFeeCents: number
  toolsPurchaseCount: number
  workGrossCents: number
  workPlatformFeeCents: number
  workPaymentCount: number
  pendingEscrowCents: number
  activeLicenses: number
  subscriptionActive: number
  /** MES-053 Phase B retainer invoice fees (Connect rail) */
  retainerGrossCents: number
  retainerPlatformFeeCents: number
  retainerPaymentCount: number
  retainerActiveCount: number
  retainerPastDueCount: number
  commissionRules: CommissionRuleRecord[]
}

function db() {
  return getPrisma()
}

export async function resolveFeeBps(input: {
  scope: CommissionScope
  sellerTier?: SellerTier
}): Promise<number> {
  const tier = input.sellerTier ?? "STANDARD"
  if (!isDatabaseConfigured()) return getMarketplaceFeeBps()
  try {
    const rule = await db().marketplaceCommissionRule.findFirst({
      where: { scope: input.scope, sellerTier: tier, active: true },
    })
    if (rule && rule.feeBps >= 0 && rule.feeBps <= 5000) return rule.feeBps
  } catch (error) {
    if (!isMissingSchemaError(error)) throw error
  }
  return getMarketplaceFeeBps()
}

export async function feeCentsFor(
  amountCents: number,
  scope: CommissionScope,
  sellerTier: SellerTier = "STANDARD",
): Promise<number> {
  const bps = await resolveFeeBps({ scope, sellerTier })
  return Math.round((amountCents * bps) / 10000)
}

export async function listCommissionRules(): Promise<CommissionRuleRecord[]> {
  if (!isDatabaseConfigured()) return []
  try {
    const rows = await db().marketplaceCommissionRule.findMany({
      orderBy: [{ scope: "asc" }, { sellerTier: "asc" }],
    })
    return rows.map((r) => ({
      id: r.id,
      scope: r.scope,
      sellerTier: r.sellerTier,
      feeBps: r.feeBps,
      label: r.label,
      active: r.active,
      updatedAt: r.updatedAt.toISOString(),
    }))
  } catch (error) {
    if (isMissingSchemaError(error)) return []
    throw error
  }
}

export async function upsertCommissionRule(input: {
  scope: CommissionScope
  sellerTier: SellerTier
  feeBps: number
  label?: string
  active?: boolean
  adminId: string
}): Promise<CommissionRuleRecord> {
  if (input.feeBps < 0 || input.feeBps > 5000) {
    throw new Error("Fee bps must be between 0 and 5000.")
  }
  const row = await db().marketplaceCommissionRule.upsert({
    where: {
      scope_sellerTier: {
        scope: input.scope,
        sellerTier: input.sellerTier,
      },
    },
    create: {
      scope: input.scope,
      sellerTier: input.sellerTier,
      feeBps: input.feeBps,
      label: input.label ?? null,
      active: input.active ?? true,
    },
    update: {
      feeBps: input.feeBps,
      label: input.label ?? undefined,
      active: input.active ?? true,
    },
  })
  const { recordAudit } = await import("@/services/admin/audit")
  await recordAudit({
    actorId: input.adminId,
    action: "upsert_commission_rule",
    entityType: "marketplace_commission_rule",
    entityId: row.id,
    summary: `Set ${row.scope}/${row.sellerTier} commission to ${row.feeBps} bps`,
  }).catch(() => undefined)
  return {
    id: row.id,
    scope: row.scope,
    sellerTier: row.sellerTier,
    feeBps: row.feeBps,
    label: row.label,
    active: row.active,
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function getMarketplaceFinanceOverview(): Promise<MarketplaceFinanceOverview> {
  const empty: MarketplaceFinanceOverview = {
    toolsGrossCents: 0,
    toolsPlatformFeeCents: 0,
    toolsPurchaseCount: 0,
    workGrossCents: 0,
    workPlatformFeeCents: 0,
    workPaymentCount: 0,
    pendingEscrowCents: 0,
    activeLicenses: 0,
    subscriptionActive: 0,
    retainerGrossCents: 0,
    retainerPlatformFeeCents: 0,
    retainerPaymentCount: 0,
    retainerActiveCount: 0,
    retainerPastDueCount: 0,
    commissionRules: [],
  }
  if (!isDatabaseConfigured()) return empty
  try {
    const [
      toolAgg,
      workAgg,
      pendingEscrow,
      activeLicenses,
      subscriptionActive,
      commissionRules,
      retainerAgg,
      retainerActiveCount,
      retainerPastDueCount,
    ] = await Promise.all([
      db().marketplacePurchase.aggregate({
        _sum: { amountCents: true, platformFeeCents: true },
        _count: true,
        where: {
          status: { in: ["requires_payment", "succeeded", "completed", "pending_connect_config"] },
        },
      }),
      db().contractPayment.aggregate({
        _sum: { amountCents: true, platformFeeCents: true },
        _count: true,
      }),
      db().milestone.aggregate({
        _sum: { amountCents: true },
        where: { status: "FUNDED" },
      }),
      db().marketplaceLicense.count({ where: { status: "ACTIVE" } }),
      db().subscription.count({ where: { status: "active" } }),
      listCommissionRules(),
      db().maintenanceSubscriptionPayment.aggregate({
        _sum: { amountCents: true, platformFeeCents: true },
        _count: true,
        where: { status: "paid" },
      }),
      db().maintenanceSubscription.count({
        where: { status: { in: ["ACTIVE", "TRIALING"] } },
      }),
      db().maintenanceSubscription.count({ where: { status: "PAST_DUE" } }),
    ])
    return {
      toolsGrossCents: toolAgg._sum.amountCents ?? 0,
      toolsPlatformFeeCents: toolAgg._sum.platformFeeCents ?? 0,
      toolsPurchaseCount: toolAgg._count,
      workGrossCents: workAgg._sum.amountCents ?? 0,
      workPlatformFeeCents: workAgg._sum.platformFeeCents ?? 0,
      workPaymentCount: workAgg._count,
      pendingEscrowCents: pendingEscrow._sum.amountCents ?? 0,
      activeLicenses,
      subscriptionActive,
      retainerGrossCents: retainerAgg._sum.amountCents ?? 0,
      retainerPlatformFeeCents: retainerAgg._sum.platformFeeCents ?? 0,
      retainerPaymentCount: retainerAgg._count,
      retainerActiveCount,
      retainerPastDueCount,
      commissionRules,
    }
  } catch (error) {
    if (isMissingSchemaError(error)) return empty
    throw error
  }
}
