import "server-only";

import type {
  ActivityItem,
  ContentSlice,
  DashboardStat,
  NotificationPreview,
  RankedCategory,
  RecentArticleRow,
  SystemMetric,
} from "../types/types";
import { computeArticleSeoScore } from "../utils/seo-score";
import {
  formatBytes,
  formatRelativeTime,
  formatShortDate,
  formatTrend,
  formatViewCount,
  mapArticleStatus,
} from "../utils/format-dashboard";
import { listArticlesAdmin } from "@/services/content/articles";
import { listCategoriesAdmin } from "@/services/content/taxonomy";
import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";

const STORAGE_QUOTA_BYTES = 500 * 1024 ** 3;

function weekRanges() {
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const twoWeeksAgo = new Date(Date.now() - 14 * 86400000);
  return { weekAgo, twoWeeksAgo };
}

export async function loadRecentArticles(): Promise<RecentArticleRow[]> {
  const result = await listArticlesAdmin({
    pageSize: 6,
    sort: "updatedAt",
    sortDir: "desc",
  });

  return result.items.map((article) => ({
    id: article.id,
    title: article.title,
    status: mapArticleStatus(article.status),
    author: article.authorName ?? "—",
    seoScore: computeArticleSeoScore(article),
    views:
      article.viewCount > 0 ? formatViewCount(article.viewCount) : "—",
    date: formatShortDate(article.publishedAt ?? article.updatedAt),
    href: `/dashboard/articles/${article.id}`,
  }));
}

export async function loadTopCategories(): Promise<RankedCategory[]> {
  const result = await listCategoriesAdmin({
    pageSize: 50,
    status: "ACTIVE",
  });

  const ranked = [...result.items]
    .sort((a, b) => b.articleCount - a.articleCount)
    .slice(0, 8)
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      count: cat.articleCount,
    }));

  // Keep empty until categories have article counts — never invent rankings.
  if (ranked.length === 0 || ranked.every((c) => c.count === 0)) return [];

  return ranked;
}

export async function loadRecentActivity(): Promise<ActivityItem[]> {
  if (!isDatabaseConfigured()) return [];

  const db = getPrisma();
  const [articles, media, guides, subscribers] = await Promise.all([
    db.article.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, status: true, updatedAt: true },
    }),
    db.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        originalName: true,
        filename: true,
        createdAt: true,
      },
    }),
    db.guide.findMany({
      orderBy: { updatedAt: "desc" },
      take: 3,
      select: { id: true, title: true, updatedAt: true },
    }),
    db.subscriber.findMany({
      orderBy: { createdAt: "desc" },
      take: 2,
      select: { id: true, email: true, createdAt: true },
    }),
  ]);

  type RawActivity = {
    id: string;
    title: string;
    meta: string;
    at: Date;
  };

  const raw: RawActivity[] = [
    ...articles.map((a) => ({
      id: `art-${a.id}`,
      title:
        a.status === "PUBLISHED"
          ? `Article published: ${a.title}`
          : `Article updated: ${a.title}`,
      meta: "Articles",
      at: a.updatedAt,
    })),
    ...media.map((m) => ({
      id: `media-${m.id}`,
      title: `Media uploaded: ${m.originalName ?? m.filename}`,
      meta: "Media Library",
      at: m.createdAt,
    })),
    ...guides.map((g) => ({
      id: `guide-${g.id}`,
      title: `Guide updated: ${g.title}`,
      meta: "Guides",
      at: g.updatedAt,
    })),
    ...subscribers.map((s) => ({
      id: `sub-${s.id}`,
      title: `New subscriber: ${s.email}`,
      meta: "Newsletter",
      at: s.createdAt,
    })),
  ];

  return raw
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 8)
    .map((item) => ({
      id: item.id,
      title: item.title,
      meta: item.meta,
      time: formatRelativeTime(item.at),
    }));
}

export async function loadContentOverview(): Promise<ContentSlice[] | null> {
  if (!isDatabaseConfigured()) return null;

  const db = getPrisma();
  const [articles, guides, tools, images, videos] = await Promise.all([
    db.article.count({ where: { status: "PUBLISHED" } }),
    db.guide.count({ where: { status: "PUBLISHED" } }),
    db.tool.count({ where: { status: "PUBLISHED" } }),
    db.mediaAsset.count({ where: { mimeType: { startsWith: "image/" } } }),
    db.mediaAsset.count({ where: { mimeType: { startsWith: "video/" } } }),
  ]);

  // Empty overview when there is nothing to visualize.
  if (articles + guides + tools + images + videos === 0) return null;

  return [
    { id: "c1", label: "Articles", value: articles, color: "#8B5CF6" },
    { id: "c2", label: "Guides", value: guides, color: "#6366F1" },
    { id: "c3", label: "Tools", value: tools, color: "#22D3EE" },
    { id: "c4", label: "Videos", value: videos, color: "#A855F7" },
    { id: "c5", label: "Images", value: images, color: "#EC4899" },
  ];
}

export async function loadOpsStats(input: {
  visitorsLabel: string;
  pageViewsLabel: string;
  aiConnected: number;
  aiTotal: number;
  unreadNotifications: number;
}): Promise<Partial<DashboardStat>[]> {
  if (!isDatabaseConfigured()) {
    return [
      { id: "visitors", value: input.visitorsLabel, hint: "from Analytics" },
      { id: "pageViews", value: input.pageViewsLabel, hint: "from Analytics" },
      {
        id: "aiProviders",
        value: `${input.aiConnected}/${input.aiTotal}`,
        hint: "configured providers",
      },
      {
        id: "notifications",
        value: String(input.unreadNotifications),
        hint: "unread",
      },
    ];
  }

  const db = getPrisma();
  const { weekAgo, twoWeeksAgo } = weekRanges();

  const [subscribers, recentSubs, priorSubs, mediaAgg] = await Promise.all([
    db.subscriber.count({ where: { status: "active" } }).catch(() =>
      db.subscriber.count(),
    ),
    db.subscriber.count({ where: { createdAt: { gte: weekAgo } } }),
    db.subscriber.count({
      where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } },
    }),
    db.mediaAsset.aggregate({ _sum: { sizeBytes: true } }),
  ]);

  const storageBytes = mediaAgg._sum.sizeBytes ?? 0;
  const storagePct = Math.min(
    99,
    Math.round((storageBytes / STORAGE_QUOTA_BYTES) * 100),
  );

  return [
    {
      id: "visitors",
      value: input.visitorsLabel,
      hint: "from Analytics",
    },
    {
      id: "pageViews",
      value: input.pageViewsLabel,
      hint: "from Analytics",
    },
    {
      id: "subscribers",
      value: String(subscribers),
      hint: "live",
      trend: formatTrend(recentSubs, priorSubs),
    },
    {
      id: "notifications",
      value: String(input.unreadNotifications),
      hint: "unread platform-wide",
    },
    {
      id: "aiProviders",
      value: `${input.aiConnected}/${input.aiTotal}`,
      hint: "configured providers",
    },
    {
      id: "storage",
      value: storageBytes > 0 ? `${storagePct}%` : "—",
      hint: storageBytes > 0 ? formatBytes(storageBytes) : "No media yet",
    },
  ];
}

/** @deprecated Content CMS stats — kept for any legacy callers; prefer loadOpsStats. */
export async function loadLiveStats(
  visitorsLabel: string,
): Promise<Partial<DashboardStat>[]> {
  if (!isDatabaseConfigured()) return [];

  const db = getPrisma();
  const { weekAgo, twoWeeksAgo } = weekRanges();

  const [
    articles,
    guides,
    images,
    videos,
    recentArticles,
    priorArticles,
    recentImages,
    priorImages,
    recentVideos,
    priorVideos,
    recentGuides,
    priorGuides,
  ] = await Promise.all([
    db.article.count({ where: { status: "PUBLISHED" } }),
    db.guide.count({ where: { status: "PUBLISHED" } }),
    db.mediaAsset.count({ where: { mimeType: { startsWith: "image/" } } }),
    db.mediaAsset.count({ where: { mimeType: { startsWith: "video/" } } }),
    db.article.count({ where: { createdAt: { gte: weekAgo } } }),
    db.article.count({
      where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } },
    }),
    db.mediaAsset.count({
      where: {
        mimeType: { startsWith: "image/" },
        createdAt: { gte: weekAgo },
      },
    }),
    db.mediaAsset.count({
      where: {
        mimeType: { startsWith: "image/" },
        createdAt: { gte: twoWeeksAgo, lt: weekAgo },
      },
    }),
    db.mediaAsset.count({
      where: {
        mimeType: { startsWith: "video/" },
        createdAt: { gte: weekAgo },
      },
    }),
    db.mediaAsset.count({
      where: {
        mimeType: { startsWith: "video/" },
        createdAt: { gte: twoWeeksAgo, lt: weekAgo },
      },
    }),
    db.guide.count({ where: { createdAt: { gte: weekAgo } } }),
    db.guide.count({
      where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } },
    }),
  ]);

  return [
    {
      id: "articles",
      value: String(articles),
      hint: "live",
      trend: formatTrend(recentArticles, priorArticles),
    },
    {
      id: "images",
      value: String(images),
      hint: "live",
      trend: formatTrend(recentImages, priorImages),
    },
    {
      id: "videos",
      value: String(videos),
      hint: "live",
      trend: formatTrend(recentVideos, priorVideos),
    },
    {
      id: "guides",
      value: String(guides),
      hint: "live",
      trend: formatTrend(recentGuides, priorGuides),
    },
    { id: "visitors", value: visitorsLabel, hint: "from Analytics" },
  ];
}

export async function loadSystemMetrics(): Promise<SystemMetric[] | null> {
  if (!isDatabaseConfigured()) return null;

  const db = getPrisma();
  const mediaAgg = await db.mediaAsset.aggregate({ _sum: { sizeBytes: true } });

  const storageBytes = mediaAgg._sum.sizeBytes ?? 0;
  const storagePct = Math.min(
    99,
    Math.round((storageBytes / STORAGE_QUOTA_BYTES) * 100),
  );

  return [
    {
      id: "s1",
      label: "Storage Usage",
      value: `${storagePct}%`,
      detail: `${formatBytes(storageBytes)} / ${formatBytes(STORAGE_QUOTA_BYTES)}`,
    },
    {
      id: "s2",
      label: "Bandwidth Usage",
      value: "—",
      detail: "Not tracked yet",
    },
    {
      id: "s3",
      label: "AI Credits Remaining",
      value: "—",
      detail: "Not tracked yet",
    },
  ];
}

export async function computeAverageSeoScore(): Promise<number | null> {
  const result = await listArticlesAdmin({
    pageSize: 20,
    sort: "updatedAt",
    sortDir: "desc",
  });
  if (result.items.length === 0) return null;
  const total = result.items.reduce(
    (sum, a) => sum + computeArticleSeoScore(a),
    0,
  );
  return Math.round(total / result.items.length);
}

export async function loadNotificationPreview(adminId: string): Promise<{
  unreadCount: number;
  items: NotificationPreview[];
}> {
  if (!isDatabaseConfigured() || !adminId) {
    return { unreadCount: 0, items: [] };
  }

  const { resolveNotificationLink } = await import("@/services/notification/links");
  const db = getPrisma();
  const where = { adminId, archived: false as const };
  const [unreadCount, rows] = await Promise.all([
    db.notification.count({
      where: { adminId, read: false, archived: false },
    }),
    db.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        type: true,
        read: true,
        createdAt: true,
        link: true,
      },
    }),
  ]);

  return {
    unreadCount,
    items: rows.map((n) => ({
      id: n.id,
      title: n.title,
      meta: n.read ? String(n.type) : `Unread · ${n.type}`,
      time: formatRelativeTime(n.createdAt),
      href: resolveNotificationLink(n.link, "admin"),
    })),
  };
}
