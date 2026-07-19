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
 * Idempotently seeds analytics placeholder rows.
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

  await db().contentAnalytics.upsert({
    where: { periodKey: PERIOD },
    update: {},
    create: {
      periodKey: PERIOD,
      articleViews: 12450,
      guideViews: 3820,
      toolViews: 2910,
      topContentJson: JSON.stringify([
        {
          id: "1",
          label: "How transformers actually work",
          value: "1.2K",
          meta: "article",
        },
        {
          id: "2",
          label: "Prompt engineering basics",
          value: "980",
          meta: "article",
        },
        {
          id: "3",
          label: "AI literacy path",
          value: "760",
          meta: "guide",
        },
      ]),
    },
  });

  await db().learningAnalytics.upsert({
    where: { periodKey: PERIOD },
    update: {},
    create: {
      periodKey: PERIOD,
      guideStarts: 640,
      lessonsCompleted: 210,
      activeLearners: 420,
      topGuidesJson: JSON.stringify([
        {
          id: "g1",
          label: "AI literacy path",
          value: "180 starts",
          meta: "placeholder progress",
        },
        {
          id: "g2",
          label: "React fundamentals",
          value: "142 starts",
          meta: "placeholder progress",
        },
      ]),
    },
  });

  await db().aIAnalytics.upsert({
    where: { periodKey: PERIOD },
    update: {},
    create: {
      periodKey: PERIOD,
      conversations: 890,
      messages: 4120,
      avgMessagesPerConvo: 4.6,
      topTopicsJson: JSON.stringify([
        { id: "t1", label: "Explain this article", value: "32%", meta: "Ask" },
        { id: "t2", label: "Compare AI tools", value: "21%", meta: "Ask" },
        { id: "t3", label: "Quiz me", value: "14%", meta: "Ask" },
      ]),
    },
  });

  await db().searchAnalytics.upsert({
    where: { periodKey: PERIOD },
    update: {},
    create: {
      periodKey: PERIOD,
      queryCount: 5600,
      zeroResultCount: 180,
      topQueriesJson: JSON.stringify([
        { id: "s1", label: "Prompt engineering", value: "420", meta: "top" },
        {
          id: "s2",
          label: "React Server Components",
          value: "310",
          meta: "top",
        },
        {
          id: "s3",
          label: "AI tools for beginners",
          value: "275",
          meta: "top",
        },
      ]),
      zeroResultJson: JSON.stringify([
        {
          id: "z1",
          label: "kubernetes helm charts ai",
          value: "12",
          meta: "zero-result",
        },
        {
          id: "z2",
          label: "fortran tutorials",
          value: "8",
          meta: "zero-result",
        },
      ]),
    },
  });

  await db().trafficAnalytics.upsert({
    where: { periodKey: PERIOD },
    update: {},
    create: {
      periodKey: PERIOD,
      visitors: 18200,
      sessions: 24100,
      pageViews: 91300,
      returningUsers: 6400,
      avgSessionSec: 192,
      devicesJson: JSON.stringify([
        { id: "d1", label: "Desktop", value: "58%", meta: "device" },
        { id: "d2", label: "Mobile", value: "36%", meta: "device" },
        { id: "d3", label: "Tablet", value: "6%", meta: "device" },
      ]),
      browsersJson: JSON.stringify([
        { id: "b1", label: "Chrome", value: "61%", meta: "browser" },
        { id: "b2", label: "Safari", value: "22%", meta: "browser" },
        { id: "b3", label: "Firefox", value: "9%", meta: "browser" },
        { id: "b4", label: "Edge", value: "8%", meta: "browser" },
      ]),
    },
  });

  const reportCount = await db().analyticsReport.count();
  if (reportCount === 0) {
    await db().analyticsReport.createMany({
      data: [
        {
          name: "Monthly content engagement",
          reportType: "content",
          status: "ready",
          exportNote: "Export placeholder — CSV/PDF arrives later.",
          scheduleNote: "Scheduled reports placeholder.",
          dateFrom: new Date(Date.now() - 30 * 86400000),
          dateTo: new Date(),
        },
        {
          name: "Search quality snapshot",
          reportType: "search",
          status: "ready",
          exportNote: "Export placeholder.",
          scheduleNote: null,
          dateFrom: new Date(Date.now() - 7 * 86400000),
          dateTo: new Date(),
        },
      ],
    });
  }
}

/**
 * Event capture interface — modules call this later.
 * No production instrumentation in this phase; writes when DB is configured.
 */
export async function captureAnalyticsEvent(
  input: CaptureAnalyticsEventInput,
): Promise<{ id: string } | null> {
  if (!isDatabaseConfigured()) return null;
  await ensureSeeded();
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

  const stats: AnalyticsStat[] = [
    {
      id: "visitors",
      label: "Total Visitors",
      value: formatCount(traffic?.visitors ?? 18200),
      hint: "placeholder rollup",
    },
    {
      id: "active",
      label: "Active Users",
      value: formatCount(traffic?.returningUsers ?? 6400),
      hint: "returning proxy",
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
      value: formatCount(content?.guideViews ?? 3820),
      hint: "event stream rollup",
    },
    {
      id: "tool-views",
      label: "Tool Views",
      value: formatCount(content?.toolViews ?? 2910),
      hint: "event stream rollup",
    },
    {
      id: "ask",
      label: "Ask Conversations",
      value: formatCount(
        live.conversations > 0 ? live.conversations : (ai?.conversations ?? 890),
      ),
      hint: live.conversations > 0 ? "live" : "placeholder",
    },
    {
      id: "search",
      label: "Search Queries",
      value: formatCount(
        live.searchHistory > 0
          ? live.searchHistory
          : (search?.queryCount ?? 5600),
      ),
      hint: live.searchHistory > 0 ? "live history" : "placeholder",
    },
    {
      id: "session",
      label: "Session Duration",
      value: `${Math.round((traffic?.avgSessionSec ?? 192) / 60)}m ${
        (traffic?.avgSessionSec ?? 192) % 60
      }s`,
      hint: "placeholder",
    },
  ];

  const engagement: AnalyticsStat[] = [
    {
      id: "returning",
      label: "Returning Users",
      value: formatCount(traffic?.returningUsers ?? 6400),
      delta: "+9%",
    },
    {
      id: "page-views",
      label: "Page Views",
      value: formatCount(traffic?.pageViews ?? 91300),
      delta: "+8%",
    },
    {
      id: "article-views",
      label: "Article Views",
      value: formatCount(
        live.articleViewSum > 0
          ? live.articleViewSum
          : (content?.articleViews ?? 12450),
      ),
      delta: "+5%",
    },
    {
      id: "engagement",
      label: "Content Engagement",
      value: "62%",
      hint: "placeholder score",
    },
  ];

  return {
    stats,
    engagement,
    periodKey: PERIOD,
    instrumentationEnabled: config.instrumentationEnabled,
    sourceNote:
      "Widgets blend live content/Ask/search counts with AnalyticsEvent rollup placeholders. Production instrumentation is off.",
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
          row?.articleViews ?? (live.articleViewSum || 12450),
        ),
      },
      {
        id: "gv",
        label: "Guide views",
        value: formatCount(row?.guideViews ?? 3820),
      },
      {
        id: "tv",
        label: "Tool views",
        value: formatCount(row?.toolViews ?? 2910),
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
        value: formatCount(row?.guideStarts ?? 640),
      },
      {
        id: "lessons",
        label: "Lessons completed",
        value: formatCount(row?.lessonsCompleted ?? 210),
        hint: "placeholder",
      },
      {
        id: "learners",
        label: "Active learners",
        value: formatCount(row?.activeLearners ?? 420),
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
            : (row?.conversations ?? 890),
        ),
      },
      {
        id: "msgs",
        label: "Messages",
        value: formatCount(row?.messages ?? 4120),
      },
      {
        id: "avg",
        label: "Avg msgs / convo",
        value: String(row?.avgMessagesPerConvo ?? 4.6),
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
            : (row?.queryCount ?? 5600),
        ),
      },
      {
        id: "zero",
        label: "Zero-result",
        value: formatCount(row?.zeroResultCount ?? 180),
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
    userCount = await db().user.count();
  }
  return {
    title: "User analytics",
    description: "New vs returning learners and account growth.",
    stats: [
      {
        id: "users",
        label: "Registered users",
        value: formatCount(userCount || 1280),
        hint: userCount ? "live" : "placeholder",
      },
      {
        id: "new",
        label: "New users (30d)",
        value: formatCount(320),
        hint: "placeholder",
      },
      {
        id: "returning",
        label: "Returning users",
        value: formatCount(traffic?.returningUsers ?? 6400),
      },
    ],
    rows: [
      { id: "u1", label: "Learners", value: "74%", meta: "role mix placeholder" },
      { id: "u2", label: "Editors", value: "18%", meta: "role mix placeholder" },
      { id: "u3", label: "Admins", value: "8%", meta: "role mix placeholder" },
    ],
    chartPlaceholder: "Cohort chart placeholder.",
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
        value: formatCount(row?.visitors ?? 18200),
      },
      {
        id: "sessions",
        label: "Sessions",
        value: formatCount(row?.sessions ?? 24100),
      },
      {
        id: "pv",
        label: "Page views",
        value: formatCount(row?.pageViews ?? 91300),
      },
    ],
    rows: [...devices, ...browsers],
    chartPlaceholder: "Traffic timeseries placeholder.",
  };
}

export async function listAnalyticsReports(): Promise<AnalyticsReportRecord[]> {
  await ensureSeeded();
  if (!isDatabaseConfigured()) {
    return [
      {
        id: "local-1",
        name: "Monthly content engagement",
        reportType: "content",
        dateFrom: new Date(Date.now() - 30 * 86400000).toISOString(),
        dateTo: new Date().toISOString(),
        status: "ready",
        exportNote: "Export placeholder",
        scheduleNote: "Scheduled reports placeholder",
        createdAt: new Date().toISOString(),
      },
    ];
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
    articles: formatCount(live.articles || 120),
    guides: formatCount(live.guides || 35),
    tools: formatCount(live.tools || 80),
    categories: formatCount(live.categories || 18),
    readers: formatCount(traffic?.visitors ?? 10000),
  };
}

/** Top search queries for MES-017 trending when SearchAnalytics is seeded. */
export async function getTopSearchQueriesFromAnalytics(
  limit = 6,
): Promise<Array<{ query: string; score: number }>> {
  await ensureSeeded();
  if (!isDatabaseConfigured()) {
    return [
      { query: "Prompt engineering", score: 100 },
      { query: "React Server Components", score: 80 },
      { query: "AI tools for beginners", score: 60 },
    ];
  }
  const row = await db().searchAnalytics.findUnique({
    where: { periodKey: PERIOD },
  });
  const top = parseJsonArray(row?.topQueriesJson);
  return top.slice(0, limit).map((r, i) => ({
    query: r.label,
    score: Number.parseInt(r.value.replace(/\D/g, ""), 10) || 100 - i * 10,
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
    return Array.from({ length: CHART_DAYS }, (_, i) =>
      Math.round(10 + hashSeed(seed, i) * 40),
    );
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

  const visitorsTotal = traffic?.visitors ?? 4800;
  const pageViewsTotal = traffic?.pageViews ?? 21300;
  const avgSessionSec = traffic?.avgSessionSec ?? 192;
  const bounceBase = 41;
  const seoScore = options?.avgSeoScore ?? 78;

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

  const readTimeSeries = distributeTotal(avgSessionSec * CHART_DAYS, "read-time").map(
    (v) => Math.max(60, Math.round(v / CHART_DAYS)),
  );

  const bounceSeries = Array.from({ length: CHART_DAYS }, (_, i) =>
    Math.max(
      25,
      Math.min(
        65,
        bounceBase + Math.round((hashSeed("bounce", i) - 0.5) * 8),
      ),
    ),
  );

  const seoSeries = Array.from({ length: CHART_DAYS }, (_, i) =>
    Math.max(
      40,
      Math.min(
        100,
        seoScore + Math.round((hashSeed("seo", i) - 0.5) * 6),
      ),
    ),
  );

  const subscriberSeries =
    subscriberBuckets.some((v) => v > 0)
      ? subscriberBuckets
      : distributeTotal(126, "subscribers");

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
      value: formatDuration(avgSessionSec),
      delta: computeDelta(readTimeSeries),
      points: toPoints(readTimeSeries),
    },
    {
      id: "an4",
      label: "Bounce Rate",
      value: `${bounceBase}%`,
      delta: computeDelta(bounceSeries.map((v) => 100 - v)),
      points: toPoints(bounceSeries),
    },
    {
      id: "an5",
      label: "SEO Score",
      value: String(seoScore),
      delta: computeDelta(seoSeries, ""),
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
