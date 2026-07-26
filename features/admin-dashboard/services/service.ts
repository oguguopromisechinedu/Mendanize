import type { DashboardHomeData } from "../types/types";
import { SEEDED_DASHBOARD_HOME } from "../constants/seed";
import { getAdminNavigationConfig } from "@/services/settings/admin-navigation";
import {
  getDashboardAnalyticsCharts,
  getDashboardAnalyticsSlice,
} from "@/services/analytics";
import { getProviderStatuses } from "@/services/ai";
import {
  computeAverageSeoScore,
  loadContentOverview,
  loadLiveStats,
  loadRecentActivity,
  loadRecentArticles,
  loadSystemMetrics,
  loadTopCategories,
} from "./live-data";
import { loadPublishingWorkflowSteps } from "@/services/admin/workflow";

const PROVIDER_LABELS: Record<string, string> = {
  openai: "OpenAI",
  dalle: "OpenAI",
  claude: "Claude / Anthropic",
  gemini: "Gemini",
  grok: "Grok",
};

function mergeStats(
  base: DashboardHomeData["stats"],
  patches: Partial<DashboardHomeData["stats"][number]>[],
): DashboardHomeData["stats"] {
  const byId = Object.fromEntries(patches.map((p) => [p.id, p]));
  return base.map((stat) => {
    const patch = byId[stat.id];
    return patch ? { ...stat, ...patch } : stat;
  });
}

/**
 * Runs a data source in isolation so one failing/slow source never blanks the
 * whole dashboard. Returns `undefined` on error (caller keeps the seed value).
 */
async function safeSource<T>(
  label: string,
  fn: () => Promise<T>,
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    console.error(
      `[dashboard] source "${label}" failed:`,
      error instanceof Error ? error.message : error,
    );
    return undefined;
  }
}

// Short-lived process cache. Dashboard aggregates are global (not per-user) and
// tolerate slight staleness, so caching avoids re-running ~100 pooled queries on
// every navigation. TTL is intentionally small so new content shows quickly.
const HOME_CACHE_TTL_MS = Number(process.env.DASHBOARD_HOME_TTL_MS ?? 45_000);
let homeCache: { data: DashboardHomeData; expires: number } | null = null;

export async function loadDashboardHome(): Promise<DashboardHomeData> {
  if (homeCache && homeCache.expires > Date.now()) {
    return structuredClone(homeCache.data);
  }
  const data = await computeDashboardHome();
  homeCache = { data: structuredClone(data), expires: Date.now() + HOME_CACHE_TTL_MS };
  return data;
}

/** Force the next loadDashboardHome() to recompute (call after content writes). */
export function invalidateDashboardHome(): void {
  homeCache = null;
}

async function computeDashboardHome(): Promise<DashboardHomeData> {
  const home = structuredClone(SEEDED_DASHBOARD_HOME);

  const [
    providers,
    slice,
    avgSeo,
    contentOverview,
    recentArticles,
    topCategories,
    activity,
    system,
    workflow,
  ] = await Promise.all([
    safeSource("providers", () => getProviderStatuses()),
    safeSource("analyticsSlice", () => getDashboardAnalyticsSlice()),
    safeSource("avgSeoScore", () => computeAverageSeoScore()),
    safeSource("contentOverview", () => loadContentOverview()),
    safeSource("recentArticles", () => loadRecentArticles()),
    safeSource("topCategories", () => loadTopCategories()),
    safeSource("recentActivity", () => loadRecentActivity()),
    safeSource("systemMetrics", () => loadSystemMetrics()),
    safeSource("workflow", () => loadPublishingWorkflowSteps()),
  ]);

  if (providers) {
    home.aiStatus = providers.map((p) => ({
      id: p.provider,
      name: PROVIDER_LABELS[p.provider] ?? p.provider,
      connected: p.connected,
      detail: p.message ?? (p.connected ? "Connected" : "Not connected"),
    }));
  }

  const visitorsLabel = slice?.visitors ?? "0";

  const liveStats = await safeSource("liveStats", () =>
    loadLiveStats(visitorsLabel),
  );
  if (liveStats) {
    home.stats = mergeStats(home.stats, liveStats);
  } else if (slice) {
    home.stats = mergeStats(home.stats, [
      { id: "visitors", value: slice.visitors, hint: "from Analytics" },
    ]);
  }

  if (avgSeo != null) {
    home.stats = mergeStats(home.stats, [
      {
        id: "seo",
        value: String(avgSeo),
        hint: "avg of recent articles",
        trend: "live",
      },
    ]);
  }

  const charts = await safeSource("analyticsCharts", () =>
    getDashboardAnalyticsCharts({ avgSeoScore: avgSeo ?? null }),
  );
  if (charts) {
    home.analytics = charts.map((c) => ({
      id: c.id,
      label: c.label,
      value: c.value,
      delta: c.delta,
    }));
    home.analyticsCharts = charts;
  }

  if (contentOverview) home.contentOverview = contentOverview;
  home.recentArticles = recentArticles ?? [];
  home.topCategories = topCategories ?? [];
  home.activity = activity ?? [];
  if (system) home.system = system;
  if (workflow) home.workflow = workflow;

  return home;
}

export async function loadAdminShell() {
  const [nav, home] = await Promise.all([
    getAdminNavigationConfig(),
    loadDashboardHome(),
  ]);
  return { nav, home };
}
