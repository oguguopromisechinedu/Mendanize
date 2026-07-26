/**
 * User Learning Shared Service — MES-022.
 * Private per-user data only. Ranking via Recommendations (MES-018).
 */

import "server-only";

import { RecommendationEntityKind } from "@prisma/client";

import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { AuthorizationError, ValidationError } from "@/lib/api/errors";
import { contentHref } from "@/lib/content-paths";
import { resolveFeaturedPublishedContent } from "@/services/content/featured-published";
import {
  getRecommendations,
  recordContentView,
  type RecommendationEntityType,
  type RecommendationItem,
} from "@/services/recommendations";
import type {
  ContinueLearningCard,
  HistoryItem,
  InterestOption,
  LearningDashboard,
  LearningEntityType,
  LearningGoalRecord,
  LearningStats,
  SavedContentItem,
  UserInterestRecord,
  UserPreferenceRecord,
} from "./types";

export type * from "./types";

function db() {
  return getPrisma();
}

function assertOwner(userId: string, rowUserId: string) {
  if (userId !== rowUserId) {
    throw new AuthorizationError("Not allowed to access this learning data.");
  }
}

const KIND_MAP: Record<LearningEntityType, RecommendationEntityKind> = {
  article: RecommendationEntityKind.ARTICLE,
  guide: RecommendationEntityKind.GUIDE,
  ai_tool: RecommendationEntityKind.AI_TOOL,
};

const KIND_FROM: Record<RecommendationEntityKind, RecommendationEntityType> = {
  ARTICLE: "article",
  GUIDE: "guide",
  AI_TOOL: "ai_tool",
  CATEGORY: "category",
  TOPIC: "topic",
};

function hrefFor(type: RecommendationEntityType, slug: string): string {
  // Learning service is account-only — keep learners inside LearnerShell.
  return contentHref(type, slug, { scope: "account" });
}

function parseJsonIds(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

async function resolveTitles(
  rows: Array<{ entityType: RecommendationEntityKind; entityId: string }>,
): Promise<Map<string, { title: string; slug: string }>> {
  const map = new Map<string, { title: string; slug: string }>();
  if (!isDatabaseConfigured() || rows.length === 0) return map;

  const articleIds = rows
    .filter((r) => r.entityType === "ARTICLE")
    .map((r) => r.entityId);
  const guideIds = rows
    .filter((r) => r.entityType === "GUIDE")
    .map((r) => r.entityId);
  const toolIds = rows
    .filter((r) => r.entityType === "AI_TOOL")
    .map((r) => r.entityId);

  const [articles, guides, tools] = await Promise.all([
    articleIds.length
      ? db().article.findMany({
          where: { id: { in: articleIds } },
          select: { id: true, title: true, slug: true },
        })
      : [],
    guideIds.length
      ? db().guide.findMany({
          where: { id: { in: guideIds } },
          select: { id: true, title: true, slug: true },
        })
      : [],
    toolIds.length
      ? db().tool.findMany({
          where: { id: { in: toolIds } },
          select: { id: true, name: true, slug: true },
        })
      : [],
  ]);

  for (const a of articles) map.set(`ARTICLE:${a.id}`, { title: a.title, slug: a.slug });
  for (const g of guides) map.set(`GUIDE:${g.id}`, { title: g.title, slug: g.slug });
  for (const t of tools)
    map.set(`AI_TOOL:${t.id}`, { title: t.name, slug: t.slug });
  return map;
}

/** Continue learning from real learner progress against Admin-published guides only. */
export async function listContinueLearning(
  userId: string,
): Promise<ContinueLearningCard[]> {
  if (!isDatabaseConfigured()) return [];

  const guideProgress = await db().guideProgress.findMany({
    where: { publicUserId: userId },
    orderBy: { updatedAt: "desc" },
    take: 12,
  });

  if (guideProgress.length > 0) {
    const guides = await db().guide.findMany({
      where: {
        id: { in: guideProgress.map((r) => r.guideId) },
        status: "PUBLISHED",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        sections: {
          select: {
            lessons: { select: { id: true, title: true, sortOrder: true } },
          },
        },
      },
    });
    const byId = new Map(guides.map((g) => [g.id, g]));

    return guideProgress
      .map((row) => {
        const g = byId.get(row.guideId);
        if (!g) return null;
        const lessons = g.sections
          .flatMap((s) => s.lessons)
          .sort((a, b) => a.sortOrder - b.sortOrder);
        const total = Math.max(1, lessons.length);
        const completed = row.completedLessonIds?.length ?? 0;
        const lastLesson =
          lessons.find((l) => l.id === row.lastLessonId)?.title ??
          (completed > 0 ? `Lesson ${completed}` : "Start learning");
        return {
          id: row.id,
          guideId: row.guideId,
          title: g.title,
          slug: g.slug,
          href: hrefFor("guide", g.slug),
          lastLessonTitle: lastLesson,
          completedLessons: completed,
          totalLessons: total,
          remainingLessons: Math.max(0, total - completed),
          estimatedMinutesLeft: Math.max(0, total - completed) * 8,
          percentComplete: row.percentComplete,
          lastOpenedAt: row.updatedAt.toISOString(),
        } satisfies ContinueLearningCard;
      })
      .filter(Boolean) as ContinueLearningCard[];
  }

  // Legacy LearningProgress rows only — never invent placeholder progress.
  const rows = await db().learningProgress.findMany({
    where: { publicUserId: userId },
    orderBy: { lastOpenedAt: "desc" },
    take: 12,
  });
  if (rows.length === 0) return [];

  const guides = await db().guide.findMany({
    where: {
      id: { in: rows.map((r) => r.guideId) },
      status: "PUBLISHED",
    },
    select: { id: true, title: true, slug: true },
  });
  const byId = new Map(guides.map((g) => [g.id, g]));

  return rows
    .map((row) => {
      const g = byId.get(row.guideId);
      if (!g) return null;
      return {
        id: row.id,
        guideId: row.guideId,
        title: g.title,
        slug: g.slug,
        href: hrefFor("guide", g.slug),
        lastLessonTitle: row.lastLessonTitle ?? "Continue where you left off",
        completedLessons: row.completedLessons,
        totalLessons: row.totalLessons,
        remainingLessons: Math.max(0, row.totalLessons - row.completedLessons),
        estimatedMinutesLeft: row.estimatedMinutesLeft,
        percentComplete: row.percentComplete,
        lastOpenedAt: row.lastOpenedAt.toISOString(),
      } satisfies ContinueLearningCard;
    })
    .filter(Boolean) as ContinueLearningCard[];
}

export async function listSavedContent(
  userId: string,
  opts?: {
    query?: string;
    entityType?: LearningEntityType | "all";
    sort?: "newest" | "oldest" | "title";
  },
): Promise<SavedContentItem[]> {
  if (!isDatabaseConfigured()) return [];

  const whereType =
    opts?.entityType && opts.entityType !== "all"
      ? KIND_MAP[opts.entityType]
      : undefined;

  const rows = await db().savedContent.findMany({
    where: {
      publicUserId: userId,
      ...(whereType
        ? { entityType: whereType }
        : {
            entityType: {
              in: [
                RecommendationEntityKind.ARTICLE,
                RecommendationEntityKind.GUIDE,
                RecommendationEntityKind.AI_TOOL,
              ],
            },
          }),
    },
    orderBy: { createdAt: opts?.sort === "oldest" ? "asc" : "desc" },
    take: 100,
  });

  const titles = await resolveTitles(rows);
  let items: SavedContentItem[] = rows.map((r) => {
    const meta = titles.get(`${r.entityType}:${r.entityId}`);
    const type = KIND_FROM[r.entityType] as LearningEntityType;
    const slug = meta?.slug ?? r.entityId;
    return {
      id: r.id,
      entityType: type,
      entityId: r.entityId,
      title: meta?.title ?? "Untitled",
      slug,
      href: hrefFor(type, slug),
      savedAt: r.createdAt.toISOString(),
    };
  });

  if (opts?.query?.trim()) {
    const q = opts.query.trim().toLowerCase();
    items = items.filter((i) => i.title.toLowerCase().includes(q));
  }
  if (opts?.sort === "title") {
    items = [...items].sort((a, b) => a.title.localeCompare(b.title));
  }
  return items;
}

export async function saveContent(input: {
  userId: string;
  entityType: LearningEntityType;
  entityId: string;
}): Promise<SavedContentItem> {
  if (!isDatabaseConfigured()) {
    throw new ValidationError("Database not configured.");
  }
  const entityType = KIND_MAP[input.entityType];
  const row = await db().savedContent.upsert({
    where: {
      publicUserId_entityType_entityId: {
        publicUserId: input.userId,
        entityType,
        entityId: input.entityId,
      },
    },
    create: {
      publicUserId: input.userId,
      entityType,
      entityId: input.entityId,
    },
    update: {},
  });
  const titles = await resolveTitles([row]);
  const meta = titles.get(`${row.entityType}:${row.entityId}`);
  const slug = meta?.slug ?? row.entityId;
  return {
    id: row.id,
    entityType: input.entityType,
    entityId: row.entityId,
    title: meta?.title ?? "Untitled",
    slug,
    href: hrefFor(input.entityType, slug),
    savedAt: row.createdAt.toISOString(),
  };
}

export async function unsaveContent(input: {
  userId: string;
  savedId?: string;
  entityType?: LearningEntityType;
  entityId?: string;
}): Promise<void> {
  if (!isDatabaseConfigured()) return;
  if (input.savedId) {
    const row = await db().savedContent.findUnique({
      where: { id: input.savedId },
    });
    if (!row) return;
    assertOwner(input.userId, row.publicUserId);
    await db().savedContent.delete({ where: { id: input.savedId } });
    return;
  }
  if (input.entityType && input.entityId) {
    await db().savedContent.deleteMany({
      where: {
        publicUserId: input.userId,
        entityType: KIND_MAP[input.entityType],
        entityId: input.entityId,
      },
    });
  }
}

export async function listLearningHistory(
  userId: string,
  opts?: { query?: string; limit?: number },
): Promise<HistoryItem[]> {
  if (!isDatabaseConfigured()) return [];
  const rows = await db().learningHistory.findMany({
    where: { publicUserId: userId },
    orderBy: { viewedAt: "desc" },
    take: opts?.limit ?? 50,
  });
  const titles = await resolveTitles(rows);
  let items: HistoryItem[] = rows.map((r) => {
    const type = KIND_FROM[r.entityType];
    const meta = titles.get(`${r.entityType}:${r.entityId}`);
    const slug = meta?.slug ?? r.entityId;
    return {
      id: r.id,
      entityType: type,
      entityId: r.entityId,
      title: meta?.title ?? "Untitled",
      slug,
      href: hrefFor(type, slug),
      viewedAt: r.viewedAt.toISOString(),
    };
  });
  if (opts?.query?.trim()) {
    const q = opts.query.trim().toLowerCase();
    items = items.filter((i) => i.title.toLowerCase().includes(q));
  }
  return items;
}

export async function trackContentView(input: {
  userId: string;
  entityType: LearningEntityType;
  entityId: string;
}): Promise<void> {
  await recordContentView(input);
}

export async function listInterestTaxonomy(): Promise<{
  categories: InterestOption[];
  topics: InterestOption[];
}> {
  if (!isDatabaseConfigured()) {
    return {
      categories: [
        {
          id: "c1",
          name: "Artificial Intelligence",
          slug: "ai",
          kind: "category",
        },
      ],
      topics: [
        {
          id: "t1",
          name: "LLMs",
          slug: "llms",
          kind: "topic",
          categoryId: "c1",
        },
      ],
    };
  }
  const [categories, topics] = await Promise.all([
    db().category.findMany({
      where: { status: "ACTIVE" },
      orderBy: { displayOrder: "asc" },
      take: 80,
      select: { id: true, name: true, slug: true },
    }),
    db().topic.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
      take: 120,
      select: { id: true, name: true, slug: true, categoryId: true },
    }),
  ]);
  return {
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      kind: "category" as const,
    })),
    topics: topics.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      kind: "topic" as const,
      categoryId: t.categoryId,
    })),
  };
}

export async function listUserInterests(
  userId: string,
): Promise<UserInterestRecord[]> {
  if (!isDatabaseConfigured()) return [];
  const rows = await db().userInterest.findMany({
    where: { publicUserId: userId },
    orderBy: { createdAt: "desc" },
  });
  const categoryIds = rows.map((r) => r.categoryId).filter(Boolean) as string[];
  const topicIds = rows.map((r) => r.topicId).filter(Boolean) as string[];
  const [categories, topics] = await Promise.all([
    categoryIds.length
      ? db().category.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, name: true },
        })
      : [],
    topicIds.length
      ? db().topic.findMany({
          where: { id: { in: topicIds } },
          select: { id: true, name: true },
        })
      : [],
  ]);
  const cMap = new Map(categories.map((c) => [c.id, c.name]));
  const tMap = new Map(topics.map((t) => [t.id, t.name]));
  return rows.map((r) => ({
    id: r.id,
    categoryId: r.categoryId,
    topicId: r.topicId,
    categoryName: r.categoryId ? cMap.get(r.categoryId) ?? null : null,
    topicName: r.topicId ? tMap.get(r.topicId) ?? null : null,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function setInterest(input: {
  userId: string;
  categoryId?: string | null;
  topicId?: string | null;
  enabled: boolean;
}): Promise<void> {
  if (!isDatabaseConfigured()) {
    throw new ValidationError("Database not configured.");
  }
  const categoryId = input.categoryId ?? null;
  const topicId = input.topicId ?? null;
  if (!categoryId && !topicId) {
    throw new ValidationError("Select a category or topic.");
  }

  const existing = await db().userInterest.findFirst({
    where: { publicUserId: input.userId, categoryId, topicId },
  });

  if (!input.enabled) {
    if (existing) {
      assertOwner(input.userId, existing.publicUserId);
      await db().userInterest.delete({ where: { id: existing.id } });
    }
    return;
  }

  if (existing) return;
  await db().userInterest.create({
    data: { publicUserId: input.userId, categoryId, topicId },
  });
}

export async function getUserPreferences(
  userId: string,
): Promise<UserPreferenceRecord> {
  if (!isDatabaseConfigured()) {
    return {
      id: "local",
      preferredDifficulty: "INTERMEDIATE",
      dailyReminderEnabled: false,
      preferredCategoryIds: [],
      preferredTopicIds: [],
      themePreference: "system",
      updatedAt: new Date().toISOString(),
    };
  }
  let row = await db().userPreference.findUnique({ where: { publicUserId: userId } });
  if (!row) {
    row = await db().userPreference.create({
      data: { publicUserId: userId },
    });
  }
  return {
    id: row.id,
    preferredDifficulty: row.preferredDifficulty,
    dailyReminderEnabled: row.dailyReminderEnabled,
    preferredCategoryIds: parseJsonIds(row.preferredCategoryIdsJson),
    preferredTopicIds: parseJsonIds(row.preferredTopicIdsJson),
    themePreference: row.themePreference,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function updateUserPreferences(
  userId: string,
  input: {
    preferredDifficulty?: string;
    dailyReminderEnabled?: boolean;
    preferredCategoryIds?: string[];
    preferredTopicIds?: string[];
    themePreference?: string;
  },
): Promise<UserPreferenceRecord> {
  await getUserPreferences(userId);
  if (!isDatabaseConfigured()) {
    return getUserPreferences(userId);
  }
  const row = await db().userPreference.update({
    where: { publicUserId: userId },
    data: {
      ...(input.preferredDifficulty !== undefined
        ? { preferredDifficulty: input.preferredDifficulty }
        : {}),
      ...(input.dailyReminderEnabled !== undefined
        ? { dailyReminderEnabled: input.dailyReminderEnabled }
        : {}),
      ...(input.preferredCategoryIds !== undefined
        ? {
            preferredCategoryIdsJson: JSON.stringify(input.preferredCategoryIds),
          }
        : {}),
      ...(input.preferredTopicIds !== undefined
        ? { preferredTopicIdsJson: JSON.stringify(input.preferredTopicIds) }
        : {}),
      ...(input.themePreference !== undefined
        ? { themePreference: input.themePreference }
        : {}),
    },
  });

  // Keep legacy UserSettings.theme loosely in sync when present
  if (input.themePreference && input.themePreference !== "system") {
    await db().userSettings.upsert({
      where: { publicUserId: userId },
      create: { publicUserId: userId, theme: input.themePreference },
      update: { theme: input.themePreference },
    });
  }

  return {
    id: row.id,
    preferredDifficulty: row.preferredDifficulty,
    dailyReminderEnabled: row.dailyReminderEnabled,
    preferredCategoryIds: parseJsonIds(row.preferredCategoryIdsJson),
    preferredTopicIds: parseJsonIds(row.preferredTopicIdsJson),
    themePreference: row.themePreference,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listLearningGoals(
  userId: string,
): Promise<LearningGoalRecord[]> {
  if (!isDatabaseConfigured()) return [];
  const rows = await db().learningGoal.findMany({
    where: { publicUserId: userId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    targetNote: r.targetNote,
    isActive: r.isActive,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function upsertLearningGoal(input: {
  userId: string;
  id?: string;
  title: string;
  description?: string | null;
  targetNote?: string | null;
  isActive?: boolean;
}): Promise<LearningGoalRecord> {
  if (!isDatabaseConfigured()) {
    throw new ValidationError("Database not configured.");
  }
  if (input.id) {
    const existing = await db().learningGoal.findUnique({
      where: { id: input.id },
    });
    if (!existing) throw new ValidationError("Goal not found.");
    assertOwner(input.userId, existing.publicUserId);
    const row = await db().learningGoal.update({
      where: { id: input.id },
      data: {
        title: input.title.trim(),
        description: input.description?.trim() || null,
        targetNote: input.targetNote?.trim() || null,
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
    });
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      targetNote: row.targetNote,
      isActive: row.isActive,
      createdAt: row.createdAt.toISOString(),
    };
  }
  const row = await db().learningGoal.create({
    data: {
      publicUserId: input.userId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      targetNote: input.targetNote?.trim() || null,
      isActive: input.isActive ?? true,
    },
  });
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    targetNote: row.targetNote,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function deleteLearningGoal(
  userId: string,
  goalId: string,
): Promise<void> {
  if (!isDatabaseConfigured()) return;
  const existing = await db().learningGoal.findUnique({ where: { id: goalId } });
  if (!existing) return;
  assertOwner(userId, existing.publicUserId);
  await db().learningGoal.delete({ where: { id: goalId } });
}

export async function getLearningStats(userId: string): Promise<LearningStats> {
  const empty: LearningStats = {
    savedCount: 0,
    historyCount: 0,
    interestCount: 0,
    continueCount: 0,
    completedPathsCount: 0,
    certificatesCount: 0,
    streakDays: 0,
    dailyGoalPercent: 0,
    dailyGoalLabel: "Set a daily goal in Preferences",
    weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
  };

  if (!isDatabaseConfigured()) return empty;

  const [savedCount, historyCount, interestCount, continueCount, history] =
    await Promise.all([
      db().savedContent.count({ where: { publicUserId: userId } }),
      db().learningHistory.count({ where: { publicUserId: userId } }),
      db().userInterest.count({ where: { publicUserId: userId } }),
      db().guideProgress.count({ where: { publicUserId: userId } }),
      db().learningHistory.findMany({
        where: { publicUserId: userId },
        orderBy: { viewedAt: "desc" },
        take: 200,
        select: { viewedAt: true },
      }),
    ]);

  const [completedPathsCount, certificatesCount, activeGoals] =
    await Promise.all([
      db().guideProgress.count({
        where: { publicUserId: userId, completedAt: { not: null } },
      }),
      db().certificate.count({ where: { publicUserId: userId } }),
      db().learningGoal.count({
        where: { publicUserId: userId, isActive: true },
      }),
    ]);

  const days = new Set(
    history.map((h) => h.viewedAt.toISOString().slice(0, 10)),
  );
  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (!days.has(key)) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return history.filter((h) => h.viewedAt.toISOString().slice(0, 10) === key)
      .length;
  });

  const dailyGoalPercent =
    activeGoals > 0 ? Math.min(100, Math.round((streak > 0 ? 1 : 0) * 100)) : 0;

  return {
    savedCount,
    historyCount,
    interestCount,
    continueCount,
    completedPathsCount,
    certificatesCount,
    streakDays: streak,
    dailyGoalPercent,
    dailyGoalLabel:
      activeGoals > 0
        ? `${activeGoals} active learning goal${activeGoals === 1 ? "" : "s"}`
        : "Set a daily goal in Preferences",
    weeklyActivity,
  };
}

export async function getRecommendedForLearner(
  userId: string,
  limit = 9,
): Promise<RecommendationItem[]> {
  const result = await getRecommendations({
    contextType: "user",
    contextId: userId,
    limit,
    hrefScope: "account",
  });
  return result.items;
}

export async function getLearningDashboard(input: {
  userId: string;
  userName?: string | null;
}): Promise<LearningDashboard> {
  const [
    stats,
    continueLearning,
    recentlyViewed,
    savedPreview,
    recommendations,
    featuredFromHomepage,
  ] = await Promise.all([
    getLearningStats(input.userId),
    listContinueLearning(input.userId),
    listLearningHistory(input.userId, { limit: 6 }),
    listSavedContent(input.userId, { sort: "newest" }),
    getRecommendedForLearner(input.userId, 6),
    resolveFeaturedPublishedContent(),
  ]);

  return {
    userName: input.userName ?? null,
    stats,
    continueLearning: continueLearning.slice(0, 3),
    recentlyViewed,
    savedPreview: savedPreview.slice(0, 4),
    recommendations,
    featuredFromHomepage,
  };
}
