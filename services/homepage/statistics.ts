import "server-only";

import { unstable_cache } from "next/cache";

import { CONTENT_CACHE_TAGS } from "@/lib/cache/content";
import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { safeDbQuery } from "@/lib/db/safe-query";
import { SEEDED_HOMEPAGE_CONTENT } from "@/features/homepage-public/constants/seed";
import type { StatItem } from "@/features/homepage-public/types/types";

export type HomepageStatisticKey =
  | "articles"
  | "tools"
  | "learners"
  | "subscribers"
  | "content"
  | "hub"
  | "guides"
  | "categories"
  | "readers"
  | "courses"
  | "workProjects"
  | "developers"
  | "certificates"
  | "marketplaceDownloads"
  | "communityMembers";

export type HomepageStatisticsSnapshot = {
  available: boolean;
  generatedAt: string;
  raw: Record<HomepageStatisticKey, number>;
  values: Record<string, string>;
};

const PERIOD = "rolling-30d";

function db() {
  return getPrisma();
}

export function formatHomepageCount(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "—";
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (n >= 10_000) {
    return `${Math.round(n / 1000)}K`;
  }
  if (n >= 1_000) {
    return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(n);
}

function weekAgo(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d;
}

function emptyRaw(): Record<HomepageStatisticKey, number> {
  return {
    articles: 0,
    tools: 0,
    learners: 0,
    subscribers: 0,
    content: 0,
    hub: 0,
    guides: 0,
    categories: 0,
    readers: 0,
    courses: 0,
    workProjects: 0,
    developers: 0,
    certificates: 0,
    marketplaceDownloads: 0,
    communityMembers: 0,
  };
}

async function computeHomepageStatistics(): Promise<HomepageStatisticsSnapshot> {
  const generatedAt = new Date().toISOString();
  const raw = emptyRaw();

  if (!isDatabaseConfigured()) {
    return {
      available: false,
      generatedAt,
      raw,
      values: buildDisplayValues(raw, false),
    };
  }

  try {
    const since = weekAgo();
    const [
      articles,
      tools,
      guides,
      categories,
      learners,
      subscribers,
      weeklyArticles,
      weeklyGuides,
      traffic,
      workProjects,
      certificates,
      marketplaceDownloads,
      communityMembers,
    ] = await Promise.all([
      safeDbQuery("homepage.articles", 0, () =>
        db().article.count({ where: { status: "PUBLISHED" } }),
      ),
      safeDbQuery("homepage.tools", 0, () =>
        db().tool.count({ where: { status: "PUBLISHED" } }),
      ),
      safeDbQuery("homepage.guides", 0, () =>
        db().guide.count({ where: { status: "PUBLISHED" } }),
      ),
      safeDbQuery("homepage.categories", 0, () =>
        db().category.count({ where: { status: "ACTIVE" } }),
      ),
      safeDbQuery("homepage.learners", 0, () => db().publicUser.count()),
      safeDbQuery("homepage.subscribers", 0, () =>
        db().subscriber.count({
          where: { status: { equals: "active", mode: "insensitive" } },
        }),
      ),
      safeDbQuery("homepage.weeklyArticles", 0, () =>
        db().article.count({
          where: { status: "PUBLISHED", publishedAt: { gte: since } },
        }),
      ),
      safeDbQuery("homepage.weeklyGuides", 0, () =>
        db().guide.count({
          where: { status: "PUBLISHED", publishedAt: { gte: since } },
        }),
      ),
      safeDbQuery("homepage.traffic", null, () =>
        db().trafficAnalytics.findUnique({ where: { periodKey: PERIOD } }),
      ),
      safeDbQuery("homepage.workProjects", 0, () =>
        db().jobPosting.count({
          where: { status: { in: ["OPEN", "FILLED", "CLOSED"] } },
        }),
      ),
      safeDbQuery("homepage.certificates", 0, () => db().certificate.count()),
      safeDbQuery("homepage.marketplaceDownloads", 0, () =>
        db().marketplacePurchase.count({
          where: {
            status: {
              in: ["succeeded", "completed", "paid", "released"],
            },
          },
        }),
      ),
      safeDbQuery("homepage.communityMembers", 0, () =>
        db().communityProfile.count(),
      ),
    ]);

    const weeklyNewContent = weeklyArticles + weeklyGuides;
    const readers = traffic?.visitors ?? learners;

    Object.assign(raw, {
      articles,
      tools,
      learners,
      subscribers,
      content: weeklyNewContent,
      hub: guides > 0 || articles > 0 ? 1 : 0,
      guides,
      categories,
      readers,
      courses: guides,
      workProjects,
      developers: learners,
      certificates,
      marketplaceDownloads,
      communityMembers,
    } satisfies Record<HomepageStatisticKey, number>);

    return {
      available: true,
      generatedAt,
      raw,
      values: buildDisplayValues(raw, true),
    };
  } catch {
    return {
      available: false,
      generatedAt,
      raw: emptyRaw(),
      values: buildDisplayValues(emptyRaw(), false),
    };
  }
}

function buildDisplayValues(
  raw: Record<HomepageStatisticKey, number>,
  available: boolean,
): Record<string, string> {
  const fallback = (n: number) =>
    available
      ? formatHomepageCount(n)
      : n > 0
        ? formatHomepageCount(n)
        : "—";

  return {
    articles: fallback(raw.articles),
    tools: fallback(raw.tools),
    learners: fallback(raw.learners),
    subscribers: fallback(raw.subscribers),
    content:
      available && raw.content > 0
        ? formatHomepageCount(raw.content)
        : available
          ? "0"
          : "—",
    hub: available && raw.hub > 0 ? "Live" : available ? "Soon" : "—",
    guides: fallback(raw.guides),
    categories: fallback(raw.categories),
    readers: fallback(raw.readers),
    courses: fallback(raw.courses),
    workProjects: fallback(raw.workProjects),
    developers: fallback(raw.developers),
    certificates: fallback(raw.certificates),
    marketplaceDownloads: fallback(raw.marketplaceDownloads),
    communityMembers: fallback(raw.communityMembers),
  };
}

const getCachedHomepageStatistics = unstable_cache(
  async () => computeHomepageStatistics(),
  ["homepage-statistics-v2"],
  {
    revalidate: 60,
    tags: [CONTENT_CACHE_TAGS.homepageStatistics],
  },
);

export async function getHomepageStatistics(): Promise<HomepageStatisticsSnapshot> {
  return getCachedHomepageStatistics();
}

/** Ensure CMS/seed cards include every live default key, then overlay live values. */
export function ensureHomepageStatItems(items: StatItem[]): StatItem[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  for (const seed of SEEDED_HOMEPAGE_CONTENT.stats) {
    if (!byId.has(seed.id)) {
      byId.set(seed.id, { ...seed });
    }
  }
  const order = SEEDED_HOMEPAGE_CONTENT.stats.map((s) => s.id);
  const ordered: StatItem[] = [];
  for (const id of order) {
    const item = byId.get(id);
    if (item) ordered.push(item);
  }
  for (const [id, item] of byId) {
    if (!order.includes(id)) ordered.push(item);
  }
  return ordered;
}

/** Merge live counts into CMS/seed stat cards (labels + icons preserved). */
export async function applyLiveHomepageStatistics(
  items: StatItem[],
): Promise<StatItem[]> {
  const snapshot = await getHomepageStatistics();
  return mergeHomepageStatistics(ensureHomepageStatItems(items), snapshot);
}

export function mergeHomepageStatistics(
  items: StatItem[],
  snapshot: HomepageStatisticsSnapshot,
): StatItem[] {
  return items.map((item) => {
    const live = snapshot.values[item.id];
    if (!live) return item;
    return { ...item, value: live };
  });
}

export function snapshotToStatItems(
  items: StatItem[],
  snapshot: HomepageStatisticsSnapshot,
): StatItem[] {
  return mergeHomepageStatistics(ensureHomepageStatItems(items), snapshot);
}
