/**
 * User Learning Shared Service — MES-022.
 * Private per-user data only. Ranking via Recommendations (MES-018).
 */

import "server-only";

import { RecommendationEntityKind } from "@prisma/client";

import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { AuthorizationError, ValidationError } from "@/lib/api/errors";
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
  switch (type) {
    case "article":
      return `/articles/${slug}`;
    case "guide":
      return `/guides/${slug}`;
    case "ai_tool":
      return `/ai-tools/${slug}`;
    case "category":
      return `/categories/${slug}`;
    case "topic":
      return `/topics/${slug}`;
  }
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

/** Placeholder continue-learning cards when no LearningProgress rows yet. */
async function seedPlaceholderProgress(
  userId: string,
): Promise<ContinueLearningCard[]> {
  if (!isDatabaseConfigured()) {
    return [
      {
        id: "placeholder-1",
        guideId: "local",
        title: "Introduction to AI Literacy",
        slug: "ai-literacy",
        href: "/guides/ai-literacy",
        lastLessonTitle: "What is machine learning?",
        completedLessons: 2,
        totalLessons: 6,
        remainingLessons: 4,
        estimatedMinutesLeft: 45,
        percentComplete: 33,
        lastOpenedAt: new Date().toISOString(),
      },
    ];
  }

  const published = await db().guide.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { updatedAt: "desc" },
    take: 3,
    select: { id: true, title: true, slug: true },
  });

  if (published.length === 0) return [];

  const cards: ContinueLearningCard[] = [];
  for (const [i, g] of published.entries()) {
    const completed = Math.min(i + 1, 4);
    const total = 6;
    const percent = Math.round((completed / total) * 100);
    const row = await db().learningProgress.upsert({
      where: { publicUserId_guideId: { publicUserId: userId, guideId: g.id } },
      create: {
        publicUserId: userId,
        guideId: g.id,
        lastLessonTitle: `Lesson ${completed}: Getting started`,
        completedLessons: completed,
        totalLessons: total,
        estimatedMinutesLeft: (total - completed) * 12,
        percentComplete: percent,
        lastOpenedAt: new Date(Date.now() - i * 86400000),
      },
      update: {},
    });
    cards.push({
      id: row.id,
      guideId: g.id,
      title: g.title,
      slug: g.slug,
      href: hrefFor("guide", g.slug),
      lastLessonTitle: row.lastLessonTitle ?? "Lesson",
      completedLessons: row.completedLessons,
      totalLessons: row.totalLessons,
      remainingLessons: Math.max(0, row.totalLessons - row.completedLessons),
      estimatedMinutesLeft: row.estimatedMinutesLeft,
      percentComplete: row.percentComplete,
      lastOpenedAt: row.lastOpenedAt.toISOString(),
    });
  }
  return cards;
}

export async function listContinueLearning(
  userId: string,
): Promise<ContinueLearningCard[]> {
  if (!isDatabaseConfigured()) {
    return seedPlaceholderProgress(userId);
  }

  const rows = await db().learningProgress.findMany({
    where: { publicUserId: userId },
    orderBy: { lastOpenedAt: "desc" },
    take: 12,
  });

  if (rows.length === 0) {
    return seedPlaceholderProgress(userId);
  }

  const guides = await db().guide.findMany({
    where: { id: { in: rows.map((r) => r.guideId) } },
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
  if (!isDatabaseConfigured()) {
    return {
      savedCount: 0,
      historyCount: 0,
      interestCount: 0,
      continueCount: 0,
      streakDaysPlaceholder: 0,
      weeklyGoalPlaceholder: "Set a weekly goal in Preferences",
    };
  }
  const [savedCount, historyCount, interestCount, continueCount] =
    await Promise.all([
      db().savedContent.count({ where: { publicUserId: userId } }),
      db().learningHistory.count({ where: { publicUserId: userId } }),
      db().userInterest.count({ where: { publicUserId: userId } }),
      db().learningProgress.count({ where: { publicUserId: userId } }),
    ]);
  return {
    savedCount,
    historyCount,
    interestCount,
    continueCount,
    streakDaysPlaceholder: 0,
    weeklyGoalPlaceholder: "Weekly goal tracking arrives in a later spec",
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
  });
  return result.items;
}

export async function getLearningDashboard(input: {
  userId: string;
  userName?: string | null;
}): Promise<LearningDashboard> {
  const [stats, continueLearning, recentlyViewed, savedPreview, recommendations] =
    await Promise.all([
      getLearningStats(input.userId),
      listContinueLearning(input.userId),
      listLearningHistory(input.userId, { limit: 6 }),
      listSavedContent(input.userId, { sort: "newest" }),
      getRecommendedForLearner(input.userId, 6),
    ]);

  return {
    userName: input.userName ?? null,
    stats,
    continueLearning: continueLearning.slice(0, 3),
    recentlyViewed,
    savedPreview: savedPreview.slice(0, 4),
    recommendations,
  };
}
