/**
 * Analytics Shared Service — MES-023.
 * Event capture interface + placeholder-backed domain aggregates.
 * Production instrumentation is explicitly out of scope.
 */

import "server-only";

import { cache } from "react";
import { AnalyticsEventKind } from "@prisma/client";

import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import type {
  AnalyticsChartPoint,
  AnalyticsConfigRecord,
  AnalyticsOverview,
  AnalyticsReportRecord,
  AnalyticsStat,
  AnalyticsTableRow,
  CaptureAnalyticsEventInput,
  DashboardAnalyticsChart,
  DashboardAnalyticsSlice,
  DomainAnalyticsPayload,
  PublicFacingStats,
} from "./types";

export type * from "./types";

const PERIOD = "rolling-30d";
const KEY = "main";

function db() {
  return getPrisma();
}

function parseJsonArray(raw: string | null | undefined): AnalyticsTableRow[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

let seedPromise: Promise<void> | null = null;

/**
 * Idempotently seeds analytics configuration only.
 *
 * NOTE: This intentionally uses sequential `upsert`s rather than an interactive
 * `$transaction`. Interactive transactions are not supported over the Supabase
 * transaction pooler (pgbouncer) and fail with "Unable to start a transaction
 * in the given time". Each row here is independent and idempotent, so a
 * transaction is unnecessary. Results are memoized per process to avoid
 * repeating the work on every request.
 */
async function ensureSeeded(): Promise<void> {
  if (!isDatabaseConfigured()) return;
  if (seedPromise) return seedPromise;

  seedPromise = seedAnalytics().catch((error) => {
    // Reset so a transient failure can be retried on a later request.
    seedPromise = null;
    throw error;
  });
  return seedPromise;
}

async function seedAnalytics(): Promise<void> {
  // Bootstrap config only — never invent traffic/content KPI rows.
  await db().analyticsConfiguration.upsert({
    where: { key: KEY },
    update: {},
    create: {
      key: KEY,
      retentionDays: 90,
      privacyMode: true,
      instrumentationEnabled: false,
      auditLoggingNote:
        "Audit logging integrates with platform Security settings (MES-020).",
      allowedRolesJson: JSON.stringify(["EDITOR", "ADMIN", "SUPER_ADMIN"]),
    },
  });
}

/**
 * Event capture — writes when DB is configured and instrumentation is enabled
 * (or `force` is true for trusted server callers).
 */
export async function captureAnalyticsEvent(
  input: CaptureAnalyticsEventInput & { force?: boolean },
): Promise<{ id: string } | null> {
  if (!isDatabaseConfigured()) return null;
  await ensureSeeded();
  if (!input.force) {
    const config = await getAnalyticsConfiguration();
    if (!config.instrumentationEnabled) return null;
  }
  const row = await db().analyticsEvent.create({
    data: {
      kind: input.kind as AnalyticsEventKind,
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
      userId: input.userId ?? null,
      sessionKey: input.sessionKey ?? null,
      path: input.path ?? null,
      query: input.query ?? null,
      metadataJson: input.metadata ? JSON.stringify(input.metadata) : null,
      occurredAt: input.occurredAt ?? new Date(),
    },
  });
  return { id: row.id };
}

export async function getAnalyticsConfiguration(): Promise<AnalyticsConfigRecord> {
  if (!isDatabaseConfigured()) {
    return {
      retentionDays: 90,
      privacyMode: true,
      auditLoggingNote: "Placeholder",
      allowedRoles: ["EDITOR", "ADMIN", "SUPER_ADMIN"],
      instrumentationEnabled: false,
    };
  }
  await ensureSeeded();
  const row = await db().analyticsConfiguration.findUniqueOrThrow({
    where: { key: KEY },
  });
  let allowedRoles: string[] = ["EDITOR", "ADMIN", "SUPER_ADMIN"];
  try {
    const parsed = row.allowedRolesJson
      ? JSON.parse(row.allowedRolesJson)
      : allowedRoles;
    if (Array.isArray(parsed)) allowedRoles = parsed.map(String);
  } catch {
    /* keep default */
  }
  return {
    retentionDays: row.retentionDays,
    privacyMode: row.privacyMode,
    auditLoggingNote: row.auditLoggingNote,
    allowedRoles,
    instrumentationEnabled: row.instrumentationEnabled,
  };
}

export async function updateAnalyticsConfiguration(
  input: Partial<AnalyticsConfigRecord>,
): Promise<AnalyticsConfigRecord> {
  if (!isDatabaseConfigured()) {
    return getAnalyticsConfiguration();
  }
  await ensureSeeded();
  await db().analyticsConfiguration.update({
    where: { key: KEY },
    data: {
      ...(input.retentionDays !== undefined
        ? { retentionDays: input.retentionDays }
        : {}),
      ...(input.privacyMode !== undefined
        ? { privacyMode: input.privacyMode }
        : {}),
      ...(input.auditLoggingNote !== undefined
        ? { auditLoggingNote: input.auditLoggingNote }
        : {}),
      ...(input.instrumentationEnabled !== undefined
        ? { instrumentationEnabled: input.instrumentationEnabled }
        : {}),
      ...(input.allowedRoles !== undefined
        ? { allowedRolesJson: JSON.stringify(input.allowedRoles) }
        : {}),
    },
  });
  return getAnalyticsConfiguration();
}

async function liveContentCounts(): Promise<{
  articles: number;
  guides: number;
  tools: number;
  categories: number;
  conversations: number;
  searchHistory: number;
  articleViewSum: number;
}> {
  if (!isDatabaseConfigured()) {
    return {
      articles: 128,
      guides: 24,
      tools: 80,
      categories: 18,
      conversations: 0,
      searchHistory: 0,
      articleViewSum: 0,
    };
  }
  const [
    articles,
    guides,
    tools,
    categories,
    conversations,
    searchHistory,
    articleAgg,
  ] = await Promise.all([
    db().article.count({ where: { status: "PUBLISHED" } }),
    db().guide.count({ where: { status: "PUBLISHED" } }),
    db().tool.count({ where: { status: "PUBLISHED" } }),
    db().category.count({ where: { status: "ACTIVE" } }),
    db().conversation.count().catch(() => 0),
    db().searchHistory.count().catch(() => 0),
    db().article.aggregate({ _sum: { viewCount: true } }),
  ]);
  return {
    articles,
    guides,
    tools,
    categories,
    conversations,
    searchHistory,
    articleViewSum: articleAgg._sum.viewCount ?? 0,
  };
}

/**
 * Request-scoped memoization: the dashboard renders both an analytics slice and
 * sparkline charts, each of which needs the overview. `cache()` ensures the
 * ~12 underlying queries run once per render instead of twice.
 */
export const getAnalyticsOverview = cache(
  async (): Promise<AnalyticsOverview> => {
    return computeAnalyticsOverview();
  },
);

async function computeAnalyticsOverview(): Promise<AnalyticsOverview> {
  await ensureSeeded();
  const [config, live, traffic, content, ai, search] = await Promise.all([
    getAnalyticsConfiguration(),
    liveContentCounts(),
    isDatabaseConfigured()
      ? db().trafficAnalytics.findUnique({ where: { periodKey: PERIOD } })
      : null,
    isDatabaseConfigured()
      ? db().contentAnalytics.findUnique({ where: { periodKey: PERIOD } })
      : null,
    isDatabaseConfigured()
      ? db().aIAnalytics.findUnique({ where: { periodKey: PERIOD } })
      : null,
    isDatabaseConfigured()
      ? db().searchAnalytics.findUnique({ where: { periodKey: PERIOD } })
      : null,
  ]);

  const avgSessionSec = traffic?.avgSessionSec ?? 0;
  const stats: AnalyticsStat[] = [
    {
      id: "visitors",
      label: "Total Visitors",
      value: formatCount(traffic?.visitors ?? 0),
      hint: traffic ? "recorded" : "no traffic data yet",
    },
    {
      id: "active",
      label: "Active Users",
      value: formatCount(traffic?.returningUsers ?? 0),
      hint: "returning users",
    },
    {
      id: "articles",
      label: "Published Articles",
      value: formatCount(live.articles),
      hint: "live count",
    },
    {
      id: "guide-views",
      label: "Guide Views",
      value: formatCount(content?.guideViews ?? 0),
      hint: "event stream rollup",
    },
    {
      id: "tool-views",
      label: "Tool Views",
      value: formatCount(content?.toolViews ?? 0),
      hint: "event stream rollup",
    },
    {
      id: "ask",
      label: "Ask Conversations",
      value: formatCount(live.conversations || (ai?.conversations ?? 0)),
      hint: live.conversations > 0 ? "live" : "recorded",
    },
    {
      id: "search",
      label: "Search Queries",
      value: formatCount(live.searchHistory || (search?.queryCount ?? 0)),
      hint: live.searchHistory > 0 ? "live history" : "recorded",
    },
    {
      id: "session",
      label: "Session Duration",
      value:
        avgSessionSec > 0
          ? `${Math.round(avgSessionSec / 60)}m ${avgSessionSec % 60}s`
          : "—",
      hint: avgSessionSec > 0 ? "recorded" : "not instrumented",
    },
  ];

  const engagement: AnalyticsStat[] = [
    {
      id: "returning",
      label: "Returning Users",
      value: formatCount(traffic?.returningUsers ?? 0),
    },
    {
      id: "page-views",
      label: "Page Views",
      value: formatCount(traffic?.pageViews ?? 0),
    },
    {
      id: "article-views",
      label: "Article Views",
      value: formatCount(
        live.articleViewSum > 0
          ? live.articleViewSum
          : (content?.articleViews ?? 0),
      ),
    },
    {
      id: "engagement",
      label: "Content Engagement",
      value: "—",
      hint: "not instrumented",
    },
  ];

  return {
    stats,
    engagement,
    periodKey: PERIOD,
    instrumentationEnabled: config.instrumentationEnabled,
    sourceNote: config.instrumentationEnabled
      ? "Live content counts plus recorded analytics rollups."
      : "Showing live content counts. Traffic instrumentation is off until enabled in Analytics settings.",
  };
}

export async function getContentAnalyticsDomain(): Promise<DomainAnalyticsPayload> {
  await ensureSeeded();
  const row = isDatabaseConfigured()
    ? await db().contentAnalytics.findUnique({ where: { periodKey: PERIOD } })
    : null;
  const live = await liveContentCounts();
  return {
    title: "Content analytics",
    description: "Top articles and content views from the shared event stream.",
    stats: [
      {
        id: "av",
        label: "Article views",
        value: formatCount(
          row?.articleViews ?? live.articleViewSum,
        ),
      },
      {
        id: "gv",
        label: "Guide views",
        value: formatCount(row?.guideViews ?? 0),
      },
      {
        id: "tv",
        label: "Tool views",
        value: formatCount(row?.toolViews ?? 0),
      },
    ],
    rows: parseJsonArray(row?.topContentJson),
    chartPlaceholder: "Content trend chart placeholder — real-time charts later.",
  };
}

export async function getLearningAnalyticsDomain(): Promise<DomainAnalyticsPayload> {
  await ensureSeeded();
  const row = isDatabaseConfigured()
    ? await db().learningAnalytics.findUnique({ where: { periodKey: PERIOD } })
    : null;
  return {
    title: "Learning analytics",
    description: "Guide starts and learner activity (placeholder until lesson completion).",
    stats: [
      {
        id: "starts",
        label: "Guide starts",
        value: formatCount(row?.guideStarts ?? 0),
      },
      {
        id: "lessons",
        label: "Lessons completed",
        value: formatCount(row?.lessonsCompleted ?? 0),
      },
      {
        id: "learners",
        label: "Active learners",
        value: formatCount(row?.activeLearners ?? 0),
      },
    ],
    rows: parseJsonArray(row?.topGuidesJson),
    chartPlaceholder: "Learning funnel chart placeholder.",
  };
}

export async function getAIAnalyticsDomain(): Promise<DomainAnalyticsPayload> {
  await ensureSeeded();
  const row = isDatabaseConfigured()
    ? await db().aIAnalytics.findUnique({ where: { periodKey: PERIOD } })
    : null;
  const live = await liveContentCounts();
  return {
    title: "AI analytics",
    description: "Ask Mendanize conversations and topics.",
    stats: [
      {
        id: "convos",
        label: "Conversations",
        value: formatCount(
          live.conversations > 0
            ? live.conversations
            : (row?.conversations ?? 0),
        ),
      },
      {
        id: "msgs",
        label: "Messages",
        value: formatCount(row?.messages ?? 0),
      },
      {
        id: "avg",
        label: "Avg msgs / convo",
        value: row?.avgMessagesPerConvo != null
          ? String(row.avgMessagesPerConvo)
          : "—",
      },
    ],
    rows: parseJsonArray(row?.topTopicsJson),
    chartPlaceholder: "AI usage chart placeholder.",
  };
}

export async function getSearchAnalyticsDomain(): Promise<DomainAnalyticsPayload> {
  await ensureSeeded();
  const row = isDatabaseConfigured()
    ? await db().searchAnalytics.findUnique({ where: { periodKey: PERIOD } })
    : null;
  const live = await liveContentCounts();
  const top = parseJsonArray(row?.topQueriesJson);
  const zero = parseJsonArray(row?.zeroResultJson);
  return {
    title: "Search analytics",
    description: "Top and zero-result queries — feeds Trending Searches (MES-017).",
    stats: [
      {
        id: "q",
        label: "Queries",
        value: formatCount(
          live.searchHistory > 0
            ? live.searchHistory
            : (row?.queryCount ?? 0),
        ),
      },
      {
        id: "zero",
        label: "Zero-result",
        value: formatCount(row?.zeroResultCount ?? 0),
      },
    ],
    rows: [...top, ...zero],
    chartPlaceholder: "Search volume chart placeholder.",
  };
}

export async function getUserAnalyticsDomain(): Promise<DomainAnalyticsPayload> {
  await ensureSeeded();
  const traffic = isDatabaseConfigured()
    ? await db().trafficAnalytics.findUnique({ where: { periodKey: PERIOD } })
    : null;
  let userCount = 0;
  if (isDatabaseConfigured()) {
    userCount = await db().publicUser.count();
  }
  return {
    title: "User analytics",
    description: "New vs returning learners and account growth.",
    stats: [
      {
        id: "users",
        label: "Registered users",
        value: formatCount(userCount),
        hint: "live",
      },
      {
        id: "new",
        label: "New users (30d)",
        value: "—",
        hint: "not instrumented",
      },
      {
        id: "returning",
        label: "Returning users",
        value: formatCount(traffic?.returningUsers ?? 0),
      },
    ],
    rows: [],
    chartPlaceholder: "Cohort chart available once user analytics events are recorded.",
  };
}

export async function getTrafficAnalyticsDomain(): Promise<DomainAnalyticsPayload> {
  await ensureSeeded();
  const row = isDatabaseConfigured()
    ? await db().trafficAnalytics.findUnique({ where: { periodKey: PERIOD } })
    : null;
  const devices = parseJsonArray(row?.devicesJson);
  const browsers = parseJsonArray(row?.browsersJson);
  return {
    title: "Traffic analytics",
    description: "Visitors, sessions, and device/browser breakdown.",
    stats: [
      {
        id: "visitors",
        label: "Visitors",
        value: formatCount(row?.visitors ?? 0),
      },
      {
        id: "sessions",
        label: "Sessions",
        value: formatCount(row?.sessions ?? 0),
      },
      {
        id: "pv",
        label: "Page views",
        value: formatCount(row?.pageViews ?? 0),
      },
    ],
    rows: [...devices, ...browsers],
    chartPlaceholder: "Traffic timeseries placeholder.",
  };
}

export async function listAnalyticsReports(): Promise<AnalyticsReportRecord[]> {
  await ensureSeeded();
  if (!isDatabaseConfigured()) {
    return [];
  }
  const rows = await db().analyticsReport.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    reportType: r.reportType,
    dateFrom: r.dateFrom?.toISOString() ?? null,
    dateTo: r.dateTo?.toISOString() ?? null,
    status: r.status,
    exportNote: r.exportNote,
    scheduleNote: r.scheduleNote,
    createdAt: r.createdAt.toISOString(),
  }));
}

/** Slice for MES-007 dashboard home widgets. */
export async function getDashboardAnalyticsSlice(): Promise<DashboardAnalyticsSlice> {
  const overview = await getAnalyticsOverview();
  const byId = Object.fromEntries(overview.stats.map((s) => [s.id, s.value]));
  const eng = Object.fromEntries(overview.engagement.map((s) => [s.id, s.value]));
  return {
    visitors: byId.visitors ?? "—",
    pageViews: eng["page-views"] ?? "—",
    avgSession: byId.session ?? "—",
    returningUsers: eng.returning ?? "—",
    publishedArticles: byId.articles ?? "—",
    guideViews: byId["guide-views"] ?? "—",
    toolViews: byId["tool-views"] ?? "—",
    searchQueries: byId.search ?? "—",
    askConversations: byId.ask ?? "—",
  };
}

/** Public homepage / marketing stats. */
export async function getPublicFacingStats(): Promise<PublicFacingStats> {
  const live = await liveContentCounts();
  const traffic = isDatabaseConfigured()
    ? await db().trafficAnalytics.findUnique({ where: { periodKey: PERIOD } })
    : null;
  await ensureSeeded();
  return {
    articles: formatCount(live.articles),
    guides: formatCount(live.guides),
    tools: formatCount(live.tools),
    categories: formatCount(live.categories),
    readers: formatCount(traffic?.visitors ?? 0),
  };
}

/** Top search queries for MES-017 trending when SearchAnalytics has real rows. */
export async function getTopSearchQueriesFromAnalytics(
  limit = 6,
): Promise<Array<{ query: string; score: number }>> {
  await ensureSeeded();
  if (!isDatabaseConfigured()) return [];
  const row = await db().searchAnalytics.findUnique({
    where: { periodKey: PERIOD },
  });
  const top = parseJsonArray(row?.topQueriesJson);
  return top.slice(0, limit).map((r, i) => ({
    query: r.label,
    score: Number.parseInt(r.value.replace(/\D/g, ""), 10) || Math.max(1, 100 - i * 10),
  }));
}

const CHART_DAYS = 7;

function dayLabels(): string[] {
  return Array.from({ length: CHART_DAYS }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (CHART_DAYS - 1 - i));
    return d.toLocaleDateString("en-US", { weekday: "short" });
  });
}

function hashSeed(input: string, index: number): number {
  let h = 0;
  const s = `${input}:${index}`;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return (h % 1000) / 1000;
}

function distributeTotal(total: number, seed: string): number[] {
  if (total <= 0) {
    return Array.from({ length: CHART_DAYS }, () => 0);
  }
  const weights = Array.from({ length: CHART_DAYS }, (_, i) => {
    const t = i / Math.max(1, CHART_DAYS - 1);
    return 0.75 + 0.35 * Math.sin(t * Math.PI) + hashSeed(seed, i) * 0.25;
  });
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => Math.max(0, Math.round((w / sum) * total)));
}

function toPoints(values: number[]): AnalyticsChartPoint[] {
  const labels = dayLabels();
  return values.map((value, i) => ({ label: labels[i] ?? "", value }));
}

function computeDelta(values: number[], suffix = "%"): string {
  if (values.length < 4) return "—";
  const recent = values.slice(-3);
  const prior = values.slice(0, 4);
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const priorAvg = prior.reduce((a, b) => a + b, 0) / prior.length;
  if (priorAvg === 0) return recentAvg > 0 ? `+${suffix === "%" ? "100%" : "100"}` : "—";
  const pct = Math.round(((recentAvg - priorAvg) / priorAvg) * 100);
  if (pct === 0) return "0%";
  return `${pct > 0 ? "+" : ""}${pct}${suffix === "%" ? "%" : ""}`;
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

async function bucketEventCounts(): Promise<{
  pageViews: number[];
  sessions: number[];
}> {
  const empty = Array.from({ length: CHART_DAYS }, () => 0);
  if (!isDatabaseConfigured()) {
    return { pageViews: empty, sessions: empty };
  }

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (CHART_DAYS - 1));

  const events = await db().analyticsEvent.findMany({
    where: { occurredAt: { gte: start } },
    select: { kind: true, occurredAt: true },
  });

  const pageViews = [...empty];
  const sessions = [...empty];

  for (const event of events) {
    const dayIndex = Math.floor(
      (event.occurredAt.getTime() - start.getTime()) / 86400000,
    );
    if (dayIndex < 0 || dayIndex >= CHART_DAYS) continue;
    if (event.kind === AnalyticsEventKind.PAGE_VIEW) pageViews[dayIndex]!++;
    if (event.kind === AnalyticsEventKind.SESSION_START) sessions[dayIndex]!++;
  }

  return { pageViews, sessions };
}

async function bucketSubscriberCounts(): Promise<number[]> {
  const empty = Array.from({ length: CHART_DAYS }, () => 0);
  if (!isDatabaseConfigured()) return empty;

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (CHART_DAYS - 1));

  const rows = await db().subscriber.findMany({
    where: { createdAt: { gte: start } },
    select: { createdAt: true },
  });

  const counts = [...empty];
  for (const row of rows) {
    const dayIndex = Math.floor(
      (row.createdAt.getTime() - start.getTime()) / 86400000,
    );
    if (dayIndex >= 0 && dayIndex < CHART_DAYS) counts[dayIndex]!++;
  }
  return counts;
}

/** Seven-day sparkline cards for MES-007 dashboard home. */
export async function getDashboardAnalyticsCharts(options?: {
  avgSeoScore?: number | null;
}): Promise<DashboardAnalyticsChart[]> {
  await ensureSeeded();
  const overview = await getAnalyticsOverview();
  const byId = Object.fromEntries(overview.stats.map((s) => [s.id, s.value]));
  const eng = Object.fromEntries(overview.engagement.map((s) => [s.id, s.value]));

  const traffic = isDatabaseConfigured()
    ? await db().trafficAnalytics.findUnique({ where: { periodKey: PERIOD } })
    : null;

  const visitorsTotal = traffic?.visitors ?? 0;
  const pageViewsTotal = traffic?.pageViews ?? 0;
  const avgSessionSec = traffic?.avgSessionSec ?? 0;
  const seoScore = options?.avgSeoScore ?? null;
  const emptySeries = Array.from({ length: CHART_DAYS }, () => 0);

  const { pageViews: eventPageViews, sessions: eventSessions } =
    await bucketEventCounts();
  const subscriberBuckets = await bucketSubscriberCounts();

  const hasEvents =
    eventPageViews.some((v) => v > 0) || eventSessions.some((v) => v > 0);

  const visitorSeries = hasEvents
    ? eventSessions
    : distributeTotal(visitorsTotal, "visitors");
  const pageViewSeries = hasEvents
    ? eventPageViews
    : distributeTotal(pageViewsTotal, "page-views");

  const readTimeSeries =
    avgSessionSec > 0
      ? distributeTotal(avgSessionSec * CHART_DAYS, "read-time").map((v) =>
          Math.max(0, Math.round(v / CHART_DAYS)),
        )
      : emptySeries;

  const seoSeries =
    seoScore != null
      ? Array.from({ length: CHART_DAYS }, () => seoScore)
      : emptySeries;

  const subscriberSeries = subscriberBuckets;
  const subscriberTotal = subscriberSeries.reduce((a, b) => a + b, 0);

  return [
    {
      id: "an1",
      label: "Visitors",
      value: byId.visitors ?? formatCount(visitorsTotal),
      delta: computeDelta(visitorSeries),
      points: toPoints(visitorSeries),
    },
    {
      id: "an2",
      label: "Page Views",
      value: eng["page-views"] ?? formatCount(pageViewsTotal),
      delta: computeDelta(pageViewSeries),
      points: toPoints(pageViewSeries),
    },
    {
      id: "an3",
      label: "Avg Read Time",
      value: avgSessionSec > 0 ? formatDuration(avgSessionSec) : "—",
      delta: avgSessionSec > 0 ? computeDelta(readTimeSeries) : "—",
      points: toPoints(readTimeSeries),
    },
    {
      id: "an4",
      label: "Bounce Rate",
      value: "—",
      delta: "—",
      points: toPoints(emptySeries),
    },
    {
      id: "an5",
      label: "SEO Score",
      value: seoScore != null ? String(seoScore) : "—",
      delta: seoScore != null ? computeDelta(seoSeries, "") : "—",
      points: toPoints(seoSeries),
    },
    {
      id: "an6",
      label: "New Subscribers",
      value: String(subscriberTotal),
      delta: computeDelta(subscriberSeries),
      points: toPoints(subscriberSeries),
    },
  ];
}

/** Aggregate AnalyticsEvent rows into domain rollup tables for rolling-30d. */
export async function rollupAnalyticsFromEvents(): Promise<{
  events: number;
  pageViews: number;
  sessions: number;
  searches: number;
  askMessages: number;
}> {
  if (!isDatabaseConfigured()) {
    return {
      events: 0,
      pageViews: 0,
      sessions: 0,
      searches: 0,
      askMessages: 0,
    };
  }
  await ensureSeeded();
  const since = new Date(Date.now() - 30 * 86400000);
  const events = await db().analyticsEvent.findMany({
    where: { occurredAt: { gte: since } },
    select: {
      kind: true,
      entityType: true,
      query: true,
      path: true,
      sessionKey: true,
    },
  });

  let pageViews = 0;
  let sessions = 0;
  let searches = 0;
  let askMessages = 0;
  let articleViews = 0;
  let guideViews = 0;
  let toolViews = 0;
  let guideStarts = 0;
  const queryCounts = new Map<string, number>();
  const sessionKeys = new Set<string>();

  for (const event of events) {
    if (event.kind === AnalyticsEventKind.PAGE_VIEW) pageViews++;
    if (event.kind === AnalyticsEventKind.SESSION_START) {
      sessions++;
      if (event.sessionKey) sessionKeys.add(event.sessionKey);
    }
    if (event.kind === AnalyticsEventKind.SEARCH_QUERY) {
      searches++;
      const q = (event.query ?? "").trim().toLowerCase();
      if (q) queryCounts.set(q, (queryCounts.get(q) ?? 0) + 1);
    }
    if (event.kind === AnalyticsEventKind.ASK_MESSAGE) askMessages++;
    if (event.kind === AnalyticsEventKind.CONTENT_VIEW) {
      const t = (event.entityType ?? "").toLowerCase();
      if (t === "article") articleViews++;
      else if (t === "guide") guideViews++;
      else if (t === "tool" || t === "ai_tool") toolViews++;
    }
    if (event.kind === AnalyticsEventKind.GUIDE_START) guideStarts++;
    if (event.kind === AnalyticsEventKind.TOOL_VIEW) toolViews++;
  }

  const visitors = Math.max(sessionKeys.size, sessions, Math.ceil(pageViews * 0.6));
  const topQueries = [...queryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([label, value], i) => ({
      id: `q${i}`,
      label,
      value: String(value),
      meta: "top",
    }));

  await db().trafficAnalytics.upsert({
    where: { periodKey: PERIOD },
    create: {
      periodKey: PERIOD,
      visitors,
      sessions: Math.max(sessions, sessionKeys.size),
      pageViews,
      returningUsers: 0,
      avgSessionSec: 0,
    },
    update: {
      visitors,
      sessions: Math.max(sessions, sessionKeys.size),
      pageViews,
    },
  });

  await db().contentAnalytics.upsert({
    where: { periodKey: PERIOD },
    create: {
      periodKey: PERIOD,
      articleViews,
      guideViews,
      toolViews,
    },
    update: { articleViews, guideViews, toolViews },
  });

  await db().searchAnalytics.upsert({
    where: { periodKey: PERIOD },
    create: {
      periodKey: PERIOD,
      queryCount: searches,
      zeroResultCount: 0,
      topQueriesJson: JSON.stringify(topQueries),
    },
    update: {
      queryCount: searches,
      topQueriesJson: JSON.stringify(topQueries),
    },
  });

  await db().aIAnalytics.upsert({
    where: { periodKey: PERIOD },
    create: {
      periodKey: PERIOD,
      conversations: 0,
      messages: askMessages,
      avgMessagesPerConvo: 0,
    },
    update: { messages: askMessages },
  });

  await db().learningAnalytics.upsert({
    where: { periodKey: PERIOD },
    create: {
      periodKey: PERIOD,
      guideStarts,
      lessonsCompleted: 0,
      activeLearners: 0,
    },
    update: { guideStarts },
  });

  return {
    events: events.length,
    pageViews,
    sessions: Math.max(sessions, sessionKeys.size),
    searches,
    askMessages,
  };
}
