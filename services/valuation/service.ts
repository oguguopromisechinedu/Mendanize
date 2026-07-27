/**
 * Founder valuation engine — MES-037.
 * Aggregates reads from MES-021 / MES-023 / MES-039; does not duplicate analytics ownership.
 */

import "server-only"

import { PlanTier } from "@prisma/client"
import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma"
import {
  FOUNDER_DASHBOARD_MIGRATION_HINT,
  isMissingSchemaError,
  safeDbQuery,
} from "@/lib/db/safe-query"
import { recordAudit } from "@/services/admin/audit"
import { generateText } from "@/services/ai"
import { getMarketplaceMetrics } from "@/services/marketplace"

export type PlatformMetricsAggregate = {
  totalUsers: number
  activeUsers30d: number
  premiumSubscribers: number
  guideStarts: number
  certificatesIssued: number
  publishedArticles: number
  aiGeneratedArticles: number
  marketplaceListings: number
  marketplacePurchases: number
  creators: number
  jobPostings: number
  contractsCompleted: number
  clients: number
  mrrEstimate: number
  arrEstimate: number
  pageViews30d: number
  searchEvents30d: number
}

export type ValuationSnapshotRecord = {
  id: string
  estimatedValue: number
  growthPercent: number | null
  confidenceLevel: "LOW" | "MEDIUM" | "HIGH"
  notes: string | null
  computedAt: string
  factors: Array<{ factorName: string; factorValue: number }>
}

export type FounderDashboardPayload = {
  metrics: PlatformMetricsAggregate
  latest: ValuationSnapshotRecord | null
  history: ValuationSnapshotRecord[]
  insightText: string | null
  schemaReady: boolean
  schemaMessage: string | null
}

const EMPTY_METRICS: PlatformMetricsAggregate = {
  totalUsers: 0,
  activeUsers30d: 0,
  premiumSubscribers: 0,
  guideStarts: 0,
  certificatesIssued: 0,
  publishedArticles: 0,
  aiGeneratedArticles: 0,
  marketplaceListings: 0,
  marketplacePurchases: 0,
  creators: 0,
  jobPostings: 0,
  contractsCompleted: 0,
  clients: 0,
  mrrEstimate: 0,
  arrEstimate: 0,
  pageViews30d: 0,
  searchEvents30d: 0,
}

function db() {
  return getPrisma()
}

async function safeCount(
  surface: string,
  run: () => Promise<number>,
): Promise<number> {
  return safeDbQuery(surface, 0, run)
}

/** Heuristic ARR multiple — labeled estimate only, not an audit valuation. */
const BASE_ARR_MULTIPLE = 6

export async function collectPlatformMetrics(): Promise<PlatformMetricsAggregate> {
  if (!isDatabaseConfigured()) {
    return { ...EMPTY_METRICS }
  }

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const marketplace = await getMarketplaceMetrics()

  const [
    totalUsers,
    activeUsers30d,
    premiumSubscribers,
    guideStarts,
    certificatesIssued,
    publishedArticles,
    aiGeneratedArticles,
    jobPostings,
    pageViews30d,
    searchEvents30d,
    proCount,
    teamCount,
  ] = await Promise.all([
    safeCount("valuation.publicUser.count", () => db().publicUser.count()),
    safeCount("valuation.publicUser.active30d", () =>
      db().publicUser.count({ where: { updatedAt: { gte: since } } }),
    ),
    safeCount("valuation.subscription.premium", () =>
      db().subscription.count({
        where: { plan: { in: [PlanTier.PRO, PlanTier.TEAM] }, status: "active" },
      }),
    ),
    safeCount("valuation.guideProgress.count", () => db().guideProgress.count()),
    safeCount("valuation.certificate.count", () => db().certificate.count()),
    safeCount("valuation.article.published", () =>
      db().article.count({ where: { status: "PUBLISHED" } }),
    ),
    safeCount("valuation.aIGeneration.count", () => db().aIGeneration.count()),
    safeCount("valuation.jobPosting.count", () => db().jobPosting.count()),
    safeCount("valuation.analytics.pageViews", () =>
      db().analyticsEvent.count({
        where: { kind: "PAGE_VIEW", occurredAt: { gte: since } },
      }),
    ),
    safeCount("valuation.analytics.search", () =>
      db().analyticsEvent.count({
        where: { kind: "SEARCH_QUERY", occurredAt: { gte: since } },
      }),
    ),
    safeCount("valuation.subscription.pro", () =>
      db().subscription.count({
        where: { plan: PlanTier.PRO, status: "active" },
      }),
    ),
    safeCount("valuation.subscription.team", () =>
      db().subscription.count({
        where: { plan: PlanTier.TEAM, status: "active" },
      }),
    ),
  ])

  // Placeholder unit economics until catalog prices are joined — heuristic only.
  const mrrEstimate = proCount * 19 + teamCount * 49
  const arrEstimate = mrrEstimate * 12

  return {
    totalUsers,
    activeUsers30d,
    premiumSubscribers,
    guideStarts,
    certificatesIssued,
    publishedArticles,
    aiGeneratedArticles,
    marketplaceListings: marketplace.approvedListings,
    marketplacePurchases: marketplace.purchasesCompleted,
    creators: marketplace.activeCreators,
    jobPostings,
    contractsCompleted: marketplace.completedContracts,
    clients: marketplace.activeClients,
    mrrEstimate,
    arrEstimate,
    pageViews30d,
    searchEvents30d,
  }
}

export async function computeValuation(input: {
  adminId: string
  adminEmail?: string | null
}): Promise<ValuationSnapshotRecord> {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is required to store valuation snapshots.")
  }

  try {
    await db().valuationSnapshot.findFirst({ select: { id: true } })
  } catch (error) {
    if (isMissingSchemaError(error)) {
      throw new Error(FOUNDER_DASHBOARD_MIGRATION_HINT)
    }
    throw error
  }

  const metrics = await collectPlatformMetrics()
  const previous = await db().valuationSnapshot.findFirst({
    orderBy: { computedAt: "desc" },
  })

  const growthModifier =
    metrics.activeUsers30d > 0 && metrics.totalUsers > 0
      ? Math.min(1.4, 1 + metrics.activeUsers30d / Math.max(metrics.totalUsers, 1))
      : 1
  const retentionProxy =
    metrics.premiumSubscribers > 0
      ? Math.min(1.25, 1 + metrics.premiumSubscribers / Math.max(metrics.totalUsers, 1))
      : 1
  const marketplaceModifier =
    1 +
    Math.min(
      0.3,
      (metrics.marketplacePurchases + metrics.contractsCompleted) / 100,
    )

  const estimatedValue =
    metrics.arrEstimate * BASE_ARR_MULTIPLE * growthModifier * retentionProxy * marketplaceModifier

  const growthPercent = previous
    ? previous.estimatedValue === 0
      ? null
      : ((estimatedValue - previous.estimatedValue) / previous.estimatedValue) * 100
    : null

  const confidenceLevel =
    metrics.arrEstimate >= 10000 && metrics.totalUsers >= 100
      ? "HIGH"
      : metrics.arrEstimate >= 1000 || metrics.totalUsers >= 25
        ? "MEDIUM"
        : "LOW"

  const factors = [
    { factorName: "arr_estimate", factorValue: metrics.arrEstimate },
    { factorName: "base_multiple", factorValue: BASE_ARR_MULTIPLE },
    { factorName: "growth_modifier", factorValue: growthModifier },
    { factorName: "retention_modifier", factorValue: retentionProxy },
    { factorName: "marketplace_modifier", factorValue: marketplaceModifier },
    { factorName: "total_users", factorValue: metrics.totalUsers },
    { factorName: "premium_subscribers", factorValue: metrics.premiumSubscribers },
  ]

  const snapshot = await db().valuationSnapshot.create({
    data: {
      estimatedValue,
      growthPercent,
      confidenceLevel,
      notes:
        "Internal heuristic estimate only — not an accounting or investor valuation.",
      computedByAdminId: input.adminId,
      factors: { create: factors },
    },
    include: { factors: true },
  })

  await safeDbQuery("valuation.growthSnapshot.compute", undefined, () =>
    db().growthSnapshot.create({
      data: {
        rangeStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        rangeEnd: new Date(),
        metricsJson: JSON.stringify(metrics),
      },
    }),
  )

  await recordAudit({
    actorId: input.adminId,
    actorEmail: input.adminEmail,
    action: "compute_valuation",
    entityType: "valuation_snapshot",
    entityId: snapshot.id,
    summary: `Computed founder valuation estimate $${Math.round(estimatedValue).toLocaleString()}`,
    metadata: { confidenceLevel },
  })

  return {
    id: snapshot.id,
    estimatedValue: snapshot.estimatedValue,
    growthPercent: snapshot.growthPercent,
    confidenceLevel: snapshot.confidenceLevel,
    notes: snapshot.notes,
    computedAt: snapshot.computedAt.toISOString(),
    factors: snapshot.factors.map((f) => ({
      factorName: f.factorName,
      factorValue: f.factorValue,
    })),
  }
}

export async function listValuationHistory(limit = 30): Promise<ValuationSnapshotRecord[]> {
  if (!isDatabaseConfigured()) return []
  return safeDbQuery("valuation.history", [], async () => {
    const rows = await db().valuationSnapshot.findMany({
      orderBy: { computedAt: "desc" },
      take: limit,
      include: { factors: true },
    })
    return rows.map((s) => ({
      id: s.id,
      estimatedValue: s.estimatedValue,
      growthPercent: s.growthPercent,
      confidenceLevel: s.confidenceLevel,
      notes: s.notes,
      computedAt: s.computedAt.toISOString(),
      factors: s.factors.map((f) => ({
        factorName: f.factorName,
        factorValue: f.factorValue,
      })),
    }))
  })
}

export async function getLatestValuation(): Promise<ValuationSnapshotRecord | null> {
  const rows = await listValuationHistory(1)
  return rows[0] ?? null
}

export async function generateGrowthInsights(input: {
  adminId: string
  adminEmail?: string | null
}): Promise<string> {
  const metrics = await collectPlatformMetrics()
  const latest = await getLatestValuation()
  const prompt = `You are summarizing internal platform metrics for a founder. Be factual and cautious. Never claim this is a real company valuation. Metrics JSON: ${JSON.stringify(metrics)}. Latest estimate: ${latest ? latest.estimatedValue : "none"}. Write 3 short bullet insights.`

  let insightText: string
  try {
    const result = await generateText({
      prompt,
      meta: { purpose: "founder_valuation_insights" },
    })
    insightText = result.content?.trim() || "No insight text returned."
  } catch {
    insightText = [
      `• ${metrics.totalUsers} total users; ${metrics.activeUsers30d} active in 30 days.`,
      `• Estimated ARR proxy $${metrics.arrEstimate.toLocaleString()} (subscription heuristic).`,
      `• Marketplace: ${metrics.marketplaceListings} listings, ${metrics.contractsCompleted} contracts completed.`,
    ].join("\n")
  }

  await safeDbQuery("valuation.growthSnapshot.create", undefined, () =>
    db().growthSnapshot.create({
      data: {
        rangeStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        rangeEnd: new Date(),
        metricsJson: JSON.stringify(metrics),
        insightText,
      },
    }),
  )

  await recordAudit({
    actorId: input.adminId,
    actorEmail: input.adminEmail,
    action: "generate_valuation_insights",
    entityType: "growth_snapshot",
    entityId: null,
    summary: "Generated founder growth insights via AI Service",
  })

  return insightText
}

export async function probeFounderDashboardSchema(): Promise<{
  schemaReady: boolean
  schemaMessage: string | null
}> {
  if (!isDatabaseConfigured()) {
    return {
      schemaReady: false,
      schemaMessage: "DATABASE_URL is not configured. Founder metrics use zero defaults.",
    }
  }

  try {
    await db().valuationSnapshot.findFirst({ select: { id: true } })
    await db().jobPosting.findFirst({ select: { id: true } })
    return { schemaReady: true, schemaMessage: null }
  } catch (error) {
    if (isMissingSchemaError(error)) {
      return {
        schemaReady: false,
        schemaMessage: FOUNDER_DASHBOARD_MIGRATION_HINT,
      }
    }
    throw error
  }
}

export async function getLatestGrowthInsightText(): Promise<string | null> {
  if (!isDatabaseConfigured()) return null
  const growth = await safeDbQuery("valuation.growthInsight", null, () =>
    db().growthSnapshot.findFirst({
      where: { insightText: { not: null } },
      orderBy: { createdAt: "desc" },
      select: { insightText: true },
    }),
  )
  return growth?.insightText ?? null
}

export async function loadFounderDashboardPayload(): Promise<FounderDashboardPayload> {
  const [{ schemaReady, schemaMessage }, metrics, latest, history, insightText] =
    await Promise.all([
      probeFounderDashboardSchema(),
      collectPlatformMetrics(),
      getLatestValuation(),
      listValuationHistory(12),
      getLatestGrowthInsightText(),
    ])

  return {
    metrics,
    latest,
    history,
    insightText,
    schemaReady,
    schemaMessage,
  }
}
