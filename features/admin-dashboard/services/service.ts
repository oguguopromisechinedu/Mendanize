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

const PROVIDER_LABELS: Record<string, string> = {
  openai: "OpenAI",
  dalle: "DALL·E (via OpenAI)",
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

export async function loadDashboardHome(): Promise<DashboardHomeData> {
  const home = structuredClone(SEEDED_DASHBOARD_HOME);

  try {
    const providers = await getProviderStatuses();
    home.aiStatus = providers.map((p) => ({
      id: p.provider,
      name: PROVIDER_LABELS[p.provider] ?? p.provider,
      connected: p.connected,
      detail: p.message ?? (p.connected ? "Connected" : "Not connected"),
    }));
  } catch {
    /* keep seed aiStatus */
  }

  try {
    const slice = await getDashboardAnalyticsSlice();
    const avgSeo = await computeAverageSeoScore();

    const [liveStats, contentOverview, recentArticles, topCategories, activity, system, charts] =
      await Promise.all([
        loadLiveStats(slice.visitors),
        loadContentOverview(),
        loadRecentArticles(),
        loadTopCategories(),
        loadRecentActivity(),
        loadSystemMetrics(),
        getDashboardAnalyticsCharts({ avgSeoScore: avgSeo }),
      ]);

    if (liveStats.length > 0) {
      home.stats = mergeStats(home.stats, liveStats);
    } else {
      home.stats = mergeStats(home.stats, [
        { id: "visitors", value: slice.visitors, hint: "from Analytics" },
      ]);
    }

    if (contentOverview) home.contentOverview = contentOverview;
    if (recentArticles.length > 0) home.recentArticles = recentArticles;
    if (topCategories.length > 0) home.topCategories = topCategories;
    if (activity.length > 0) home.activity = activity;
    if (system) home.system = system;

    home.analytics = charts.map((c) => ({
      id: c.id,
      label: c.label,
      value: c.value,
      delta: c.delta,
    }));
    home.analyticsCharts = charts;
  } catch {
    /* keep seed */
  }

  return home;
}

export async function loadAdminShell() {
  const [nav, home] = await Promise.all([
    getAdminNavigationConfig(),
    loadDashboardHome(),
  ]);
  return { nav, home };
}
