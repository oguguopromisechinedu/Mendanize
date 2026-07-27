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
  loadNotificationPreview,
  loadOpsStats,
  loadRecentActivity,
  loadSystemMetrics,
} from "./live-data";

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

// Short-lived process cache. Most dashboard aggregates are global, but
// notification previews are Admin-scoped (MES-030), so the cache key includes adminId.
const HOME_CACHE_TTL_MS = Number(process.env.DASHBOARD_HOME_TTL_MS ?? 45_000);
const homeCache = new Map<string, { data: DashboardHomeData; expires: number }>();

export async function loadDashboardHome(
  adminId?: string,
): Promise<DashboardHomeData> {
  const cacheKey = adminId?.trim() || "anon";
  const cached = homeCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return structuredClone(cached.data);
  }
  const data = await computeDashboardHome(adminId);
  homeCache.set(cacheKey, {
    data: structuredClone(data),
    expires: Date.now() + HOME_CACHE_TTL_MS,
  });
  return data;
}

/** Force the next loadDashboardHome() to recompute (call after content writes). */
export function invalidateDashboardHome(): void {
  homeCache.clear();
}

async function computeDashboardHome(
  adminId?: string,
): Promise<DashboardHomeData> {
  const home = structuredClone(SEEDED_DASHBOARD_HOME);

  const [providers, slice, avgSeo, activity, system, notifications] =
    await Promise.all([
      safeSource("providers", () => getProviderStatuses()),
      safeSource("analyticsSlice", () => getDashboardAnalyticsSlice()),
      safeSource("avgSeoScore", () => computeAverageSeoScore()),
      safeSource("recentActivity", () => loadRecentActivity()),
      safeSource("systemMetrics", () => loadSystemMetrics()),
      adminId
        ? safeSource("notifications", () => loadNotificationPreview(adminId))
        : Promise.resolve({ unreadCount: 0, items: [] }),
    ]);

  if (providers) {
    home.aiStatus = providers.map((p) => ({
      id: p.provider,
      name: PROVIDER_LABELS[p.provider] ?? p.provider,
      connected: p.connected,
      detail: p.message ?? (p.connected ? "Connected" : "Not connected"),
    }));
  }

  if (notifications) {
    home.notifications = notifications;
  }

  const visitorsLabel = slice?.visitors ?? "0";
  const pageViewsLabel = slice?.pageViews ?? "0";
  const aiConnected = home.aiStatus.filter((p) => p.connected).length;
  const aiTotal = home.aiStatus.length;

  const opsStats = await safeSource("opsStats", () =>
    loadOpsStats({
      visitorsLabel,
      pageViewsLabel,
      aiConnected,
      aiTotal,
      unreadNotifications: home.notifications.unreadCount,
    }),
  );
  if (opsStats) {
    home.stats = mergeStats(home.stats, opsStats);
  } else if (slice) {
    home.stats = mergeStats(home.stats, [
      { id: "visitors", value: slice.visitors, hint: "from Analytics" },
      { id: "pageViews", value: slice.pageViews, hint: "from Analytics" },
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

  home.activity = activity ?? [];
  if (system) home.system = system;

  return home;
}

export async function loadAdminShell(adminId?: string) {
  const [nav, home] = await Promise.all([
    getAdminNavigationConfig(),
    loadDashboardHome(adminId),
  ]);
  return { nav, home };
}
