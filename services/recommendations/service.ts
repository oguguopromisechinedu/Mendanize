/**
 * Recommendations Shared Service — MES-018.
 * Single rules-based engine for related, for-you, and trending contexts.
 * Consumed by Search, content detail pages, and Personalization (MES-022).
 */

import "server-only";

import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import {
  contentHref,
  type ContentScope,
} from "@/lib/content-paths";
import type {
  GetRecommendationsParams,
  RecommendationEntityType,
  RecommendationItem,
  RecommendationParams,
  RecommendationsResult,
} from "./types";
import {
  getActiveModel,
  getShadowModel,
  scoreWithModel,
} from "./ml-scoring";

type SeedContext = {
  categoryIds: string[];
  topicIds: string[];
  exclude: Set<string>;
  reasonBase: string;
};

type Scored = RecommendationItem & { score: number };

function db() {
  return getPrisma();
}

function hrefFor(
  type: RecommendationEntityType,
  slug: string,
  scope: ContentScope = "public",
): string {
  return contentHref(type, slug, { scope });
}

function key(type: RecommendationEntityType, id: string) {
  return `${type}:${id}`;
}

function recencyBonus(publishedAt: Date | null | undefined): number {
  if (!publishedAt) return 0;
  const ageMs = Date.now() - publishedAt.getTime();
  const days = ageMs / (1000 * 60 * 60 * 24);
  if (days <= 30) return 2;
  if (days <= 90) return 1;
  return 0;
}

function takeTop(scored: Scored[], limit: number): RecommendationItem[] {
  return scored
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit)
    .map(({ score, ...item }) => ({ ...item, score }));
}

async function loadArticleSeed(id: string): Promise<SeedContext | null> {
  const row = await db().article.findUnique({
    where: { id },
    select: { id: true, categoryId: true, topicId: true, title: true },
  });
  if (!row) return null;
  return {
    categoryIds: row.categoryId ? [row.categoryId] : [],
    topicIds: row.topicId ? [row.topicId] : [],
    exclude: new Set([key("article", row.id)]),
    reasonBase: `Related to “${row.title}”`,
  };
}

async function loadGuideSeed(id: string): Promise<SeedContext | null> {
  const row = await db().guide.findUnique({
    where: { id },
    select: { id: true, categoryId: true, topicId: true, title: true },
  });
  if (!row) return null;
  return {
    categoryIds: row.categoryId ? [row.categoryId] : [],
    topicIds: [row.topicId],
    exclude: new Set([key("guide", row.id)]),
    reasonBase: `Related to “${row.title}”`,
  };
}

async function loadToolSeed(id: string): Promise<SeedContext | null> {
  const row = await db().tool.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      relatedArticleIds: true,
      relatedGuideIds: true,
      relatedToolIds: true,
      categories: { select: { categoryId: true } },
      topics: { select: { topicId: true } },
    },
  });
  if (!row) return null;
  return {
    categoryIds: row.categories.map((c) => c.categoryId),
    topicIds: row.topics.map((t) => t.topicId),
    exclude: new Set([key("ai_tool", row.id)]),
    reasonBase: `Related to “${row.name}”`,
  };
}

async function collectFromOverlap(
  seed: SeedContext,
  limit: number,
): Promise<Scored[]> {
  const { categoryIds, topicIds, exclude, reasonBase } = seed;
  const scored: Scored[] = [];
  const seen = new Set(exclude);

  const push = (item: Scored) => {
    const k = key(item.entityType, item.entityId);
    if (seen.has(k)) return;
    seen.add(k);
    scored.push(item);
  };

  const articleWhere =
    categoryIds.length || topicIds.length
      ? {
          status: "PUBLISHED" as const,
          OR: [
            ...(categoryIds.length
              ? [{ categoryId: { in: categoryIds } }]
              : []),
            ...(topicIds.length ? [{ topicId: { in: topicIds } }] : []),
          ],
        }
      : { status: "PUBLISHED" as const };

  const articles = await db().article.findMany({
    where: articleWhere,
    include: {
      featuredImage: { select: { url: true } },
      category: { select: { name: true } },
    },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take: 40,
  });

  for (const a of articles) {
    let score = 0;
    if (a.topicId && topicIds.includes(a.topicId)) score += 4;
    if (a.categoryId && categoryIds.includes(a.categoryId)) score += 3;
    if (a.featured) score += 2;
    score += recencyBonus(a.publishedAt);
    if (score === 0 && !categoryIds.length && !topicIds.length) score = 1;
    if (score === 0) continue;
    push({
      entityType: "article",
      entityId: a.id,
      title: a.title,
      slug: a.slug,
      href: hrefFor("article", a.slug),
      thumbnail: a.featuredImage?.url ?? a.socialImageUrl,
      reason: a.category?.name
        ? `${reasonBase} · shared category ${a.category.name}`
        : reasonBase,
      score,
    });
  }

  const guideWhere =
    categoryIds.length || topicIds.length
      ? {
          status: "PUBLISHED" as const,
          OR: [
            ...(categoryIds.length
              ? [{ categoryId: { in: categoryIds } }]
              : []),
            ...(topicIds.length ? [{ topicId: { in: topicIds } }] : []),
          ],
        }
      : { status: "PUBLISHED" as const };

  const guides = await db().guide.findMany({
    where: guideWhere,
    include: { topic: { select: { name: true } } },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take: 40,
  });

  for (const g of guides) {
    let score = 0;
    if (topicIds.includes(g.topicId)) score += 4;
    if (g.categoryId && categoryIds.includes(g.categoryId)) score += 3;
    if (g.featured) score += 2;
    score += recencyBonus(g.publishedAt);
    if (score === 0 && !categoryIds.length && !topicIds.length) score = 1;
    if (score === 0) continue;
    push({
      entityType: "guide",
      entityId: g.id,
      title: g.title,
      slug: g.slug,
      href: hrefFor("guide", g.slug),
      thumbnail: g.coverImageUrl,
      reason: `Same topic as ${g.topic.name}`,
      score,
    });
  }

  const tools = await db().tool.findMany({
    where: {
      status: "PUBLISHED",
      ...(categoryIds.length || topicIds.length
        ? {
            OR: [
              ...(categoryIds.length
                ? [
                    {
                      categories: {
                        some: { categoryId: { in: categoryIds } },
                      },
                    },
                  ]
                : []),
              ...(topicIds.length
                ? [{ topics: { some: { topicId: { in: topicIds } } } }]
                : []),
            ],
          }
        : {}),
    },
    include: {
      images: { where: { kind: { in: ["LOGO", "COVER"] } }, take: 1 },
      categories: { include: { category: { select: { name: true } } } },
      topics: { select: { topicId: true } },
    },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take: 40,
  });

  for (const t of tools) {
    const toolCatIds = t.categories.map((c) => c.categoryId);
    const toolTopicIds = t.topics.map((x) => x.topicId);

    let score = 0;
    if (toolTopicIds.some((id) => topicIds.includes(id))) score += 4;
    if (toolCatIds.some((id) => categoryIds.includes(id))) score += 3;
    if (t.featured) score += 2;
    score += recencyBonus(t.publishedAt);
    if (score === 0 && !categoryIds.length && !topicIds.length) score = 1;
    if (score === 0) continue;
    push({
      entityType: "ai_tool",
      entityId: t.id,
      title: t.name,
      slug: t.slug,
      href: hrefFor("ai_tool", t.slug),
      thumbnail: t.images[0]?.url ?? null,
      reason: t.categories[0]
        ? `Overlaps ${t.categories[0].category.name}`
        : reasonBase,
      score,
    });
  }

  if (categoryIds.length) {
    const categories = await db().category.findMany({
      where: { status: "ACTIVE", id: { in: categoryIds } },
      include: { image: { select: { url: true } } },
    });
    for (const c of categories) {
      push({
        entityType: "category",
        entityId: c.id,
        title: c.name,
        slug: c.slug,
        href: hrefFor("category", c.slug),
        thumbnail: c.image?.url ?? null,
        reason: "Same learning category",
        score: 2 + (c.featured ? 1 : 0),
      });
    }
  }

  if (topicIds.length) {
    const topics = await db().topic.findMany({
      where: { status: "ACTIVE", id: { in: topicIds } },
      include: { image: { select: { url: true } } },
    });
    for (const t of topics) {
      push({
        entityType: "topic",
        entityId: t.id,
        title: t.name,
        slug: t.slug,
        href: hrefFor("topic", t.slug),
        thumbnail: t.image?.url ?? null,
        reason: "Same learning topic",
        score: 2 + (t.featured ? 1 : 0),
      });
    }
  }

  return takeTop(scored, Math.max(limit * 2, limit)).map((i) => ({
    ...i,
    score: i.score ?? 0,
  })) as Scored[];
}

async function relatedForContent(
  contextType: "article" | "guide" | "tool",
  contextId: string,
  limit: number,
): Promise<RecommendationItem[]> {
  let seed: SeedContext | null = null;
  if (contextType === "article") seed = await loadArticleSeed(contextId);
  if (contextType === "guide") seed = await loadGuideSeed(contextId);
  if (contextType === "tool") seed = await loadToolSeed(contextId);
  if (!seed) return [];

  // Manual tool related IDs get a strong boost when present.
  const manual: Scored[] = [];
  if (contextType === "tool") {
    const tool = await db().tool.findUnique({
      where: { id: contextId },
      select: {
        relatedArticleIds: true,
        relatedGuideIds: true,
        relatedToolIds: true,
      },
    });
    if (tool) {
      for (const id of tool.relatedArticleIds) {
        const a = await db().article.findFirst({
          where: { id, status: "PUBLISHED" },
          include: { featuredImage: { select: { url: true } } },
        });
        if (!a) continue;
        manual.push({
          entityType: "article",
          entityId: a.id,
          title: a.title,
          slug: a.slug,
          href: hrefFor("article", a.slug),
          thumbnail: a.featuredImage?.url ?? a.socialImageUrl,
          reason: "Curated related article",
          score: 20,
        });
        seed.exclude.add(key("article", a.id));
      }
      for (const id of tool.relatedGuideIds) {
        const g = await db().guide.findFirst({
          where: { id, status: "PUBLISHED" },
        });
        if (!g) continue;
        manual.push({
          entityType: "guide",
          entityId: g.id,
          title: g.title,
          slug: g.slug,
          href: hrefFor("guide", g.slug),
          thumbnail: g.coverImageUrl,
          reason: "Curated related guide",
          score: 20,
        });
        seed.exclude.add(key("guide", g.id));
      }
      for (const id of tool.relatedToolIds) {
        const t = await db().tool.findFirst({
          where: { id, status: "PUBLISHED" },
          include: {
            images: { where: { kind: { in: ["LOGO", "COVER"] } }, take: 1 },
          },
        });
        if (!t) continue;
        manual.push({
          entityType: "ai_tool",
          entityId: t.id,
          title: t.name,
          slug: t.slug,
          href: hrefFor("ai_tool", t.slug),
          thumbnail: t.images[0]?.url ?? null,
          reason: "Curated related tool",
          score: 20,
        });
        seed.exclude.add(key("ai_tool", t.id));
      }
    }
  }

  const overlap = await collectFromOverlap(seed, limit);
  return takeTop([...manual, ...overlap], limit);
}

async function trendingRecommendations(limit: number): Promise<RecommendationItem[]> {
  const articles = await db().article.findMany({
    where: { status: "PUBLISHED" },
    include: { featuredImage: { select: { url: true } } },
    orderBy: [{ viewCount: "desc" }, { featured: "desc" }, { publishedAt: "desc" }],
    take: limit,
  });

  const guides = await db().guide.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take: Math.ceil(limit / 2),
  });

  const tools = await db().tool.findMany({
    where: { status: "PUBLISHED" },
    include: {
      images: { where: { kind: { in: ["LOGO", "COVER"] } }, take: 1 },
    },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take: Math.ceil(limit / 2),
  });

  const scored: Scored[] = [
    ...articles.map((a, i) => ({
      entityType: "article" as const,
      entityId: a.id,
      title: a.title,
      slug: a.slug,
      href: hrefFor("article", a.slug),
      thumbnail: a.featuredImage?.url ?? a.socialImageUrl,
      reason: a.viewCount > 0 ? "Trending by views" : "Featured & recent (placeholder until Analytics)",
      score: 1000 + a.viewCount * 10 - i,
    })),
    ...guides.map((g, i) => ({
      entityType: "guide" as const,
      entityId: g.id,
      title: g.title,
      slug: g.slug,
      href: hrefFor("guide", g.slug),
      thumbnail: g.coverImageUrl,
      reason: "Popular learning guide",
      score: 500 - i + (g.featured ? 50 : 0),
    })),
    ...tools.map((t, i) => ({
      entityType: "ai_tool" as const,
      entityId: t.id,
      title: t.name,
      slug: t.slug,
      href: hrefFor("ai_tool", t.slug),
      thumbnail: t.images[0]?.url ?? null,
      reason: "Popular AI tool",
      score: 400 - i + (t.featured ? 50 : 0),
    })),
  ];

  return takeTop(scored, limit);
}

async function userRecommendations(
  userId: string,
  limit: number,
): Promise<RecommendationItem[]> {
  const [interests, saved, history] = await Promise.all([
    db().userInterest.findMany({ where: { publicUserId: userId }, take: 40 }),
    db().savedContent.findMany({
      where: { publicUserId: userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db().learningHistory.findMany({
      where: { publicUserId: userId },
      orderBy: { viewedAt: "desc" },
      take: 20,
    }),
  ]);

  const categoryIds = [
    ...new Set(interests.map((i) => i.categoryId).filter(Boolean) as string[]),
  ];
  const topicIds = [
    ...new Set(interests.map((i) => i.topicId).filter(Boolean) as string[]),
  ];

  const exclude = new Set<string>();
  const scored: Scored[] = [];

  for (const s of saved) {
    exclude.add(
      key(
        s.entityType === "ARTICLE"
          ? "article"
          : s.entityType === "GUIDE"
            ? "guide"
            : s.entityType === "AI_TOOL"
              ? "ai_tool"
              : s.entityType === "CATEGORY"
                ? "category"
                : "topic",
        s.entityId,
      ),
    );
  }
  for (const h of history) {
    exclude.add(
      key(
        h.entityType === "ARTICLE"
          ? "article"
          : h.entityType === "GUIDE"
            ? "guide"
            : h.entityType === "AI_TOOL"
              ? "ai_tool"
              : h.entityType === "CATEGORY"
                ? "category"
                : "topic",
        h.entityId,
      ),
    );
  }

  if (categoryIds.length || topicIds.length) {
    const interestHits = await collectFromOverlap(
      {
        categoryIds,
        topicIds,
        exclude,
        reasonBase: "Matches your interests",
      },
      limit,
    );
    for (const item of interestHits) {
      scored.push({
        ...item,
        reason: item.reason ?? "Matches your interests",
        score: (item.score ?? 0) + 5,
      });
      exclude.add(key(item.entityType, item.entityId));
    }
  }

  // Related-of-saved: expand from up to 5 saved/history anchors
  const anchors = [...saved, ...history]
    .slice(0, 5)
    .map((row) => {
      const entityType =
        row.entityType === "ARTICLE"
          ? ("article" as const)
          : row.entityType === "GUIDE"
            ? ("guide" as const)
            : row.entityType === "AI_TOOL"
              ? ("tool" as const)
              : null;
      return entityType ? { entityType, entityId: row.entityId } : null;
    })
    .filter(Boolean) as Array<{
    entityType: "article" | "guide" | "tool";
    entityId: string;
  }>;

  for (const anchor of anchors) {
    const related = await relatedForContent(
      anchor.entityType,
      anchor.entityId,
      Math.max(3, Math.ceil(limit / 2)),
    );
    for (const item of related) {
      if (exclude.has(key(item.entityType, item.entityId))) continue;
      scored.push({
        ...item,
        reason: `Because you saved or viewed related content`,
        score: (item.score ?? 0) + 3,
      });
      exclude.add(key(item.entityType, item.entityId));
    }
  }

  if (!scored.length) {
    // Cold start: featured + trending
    const cold = await trendingRecommendations(limit);
    return cold.map((item) => ({
      ...item,
      reason: "Suggested while we learn your interests",
    }));
  }

  return takeTop(scored, limit);
}

/**
 * Canonical recommendations API (MES-018).
 * All modules must call this — never invent parallel ranking.
 *
 * MES-049: If an ML model is active (DEFAULT or CANARY with rollout match),
 * rules candidates are re-ranked by the model. Shadow models are scored in
 * the background for comparison but never affect user-facing results.
 * Falls back to rules on any model failure.
 */
export async function getRecommendations(
  params: GetRecommendationsParams & { sessionId?: string },
): Promise<RecommendationsResult> {
  const limit = Math.min(24, Math.max(1, params.limit ?? 8));
  const hrefScope: ContentScope = params.hrefScope ?? "public";

  if (!isDatabaseConfigured()) {
    return { items: [] };
  }

  const { contextType, contextId } = params;

  let items: RecommendationItem[] = [];

  if (contextType === "trending") {
    items = await trendingRecommendations(limit);
  } else if (contextType === "user") {
    if (!contextId) return { items: [] };
    items = await userRecommendations(contextId, limit);
  } else if (
    contextType === "article" ||
    contextType === "guide" ||
    contextType === "tool"
  ) {
    items = await relatedForContent(contextType, contextId, limit);
  }

  // MES-049: attempt ML re-ranking
  const mlResult = await tryMlRerank(items, {
    userId: contextType === "user" ? contextId : undefined,
    contextType,
    contextId: contextType !== "user" ? contextId : undefined,
    sessionId: params.sessionId,
  });
  if (mlResult) {
    items = mlResult;
  }

  if (hrefScope === "account") {
    items = items.map((item) => ({
      ...item,
      href: contentHref(item.entityType, item.slug, { scope: "account" }),
    }));
  }

  return { items };
}

/** @deprecated Prefer getRecommendations — kept for MES-002 seam callers. */
export async function getRelated(
  params: RecommendationParams,
): Promise<RecommendationItem[]> {
  const contextType =
    params.entityType === "ai_tool"
      ? "tool"
      : params.entityType === "article" || params.entityType === "guide"
        ? params.entityType
        : null;
  if (!contextType) {
    const result = await getRecommendations({
      contextType: "trending",
      contextId: params.entityId,
      limit: params.limit,
    });
    return result.items;
  }
  const result = await getRecommendations({
    contextType,
    contextId: params.entityId,
    limit: params.limit,
  });
  return result.items;
}

export async function getRecommendedForUser(
  userId: string,
  params?: RecommendationParams,
): Promise<RecommendationItem[]> {
  const result = await getRecommendations({
    contextType: "user",
    contextId: userId,
    limit: params?.limit,
  });
  return result.items;
}

/**
 * MES-049: attempt ML re-ranking of rules-scored candidates.
 * Shadow models are scored but their results are discarded (comparison only).
 * Returns null when rules should be used as-is.
 */
async function tryMlRerank(
  candidates: RecommendationItem[],
  ctx: { userId?: string; contextType: string; contextId?: string; sessionId?: string },
): Promise<RecommendationItem[] | null> {
  if (!candidates.length) return null;

  const activeModel = await getActiveModel(ctx.sessionId);

  // Fire-and-forget shadow scoring for comparison logging
  getShadowModel().then(async (shadow) => {
    if (!shadow) return;
    await scoreWithModel(shadow, {
      userId: ctx.userId,
      contextType: ctx.contextType,
      contextId: ctx.contextId,
      candidates,
    }).catch(() => {});
  }).catch(() => {});

  if (!activeModel) return null;

  const result = await scoreWithModel(activeModel, {
    userId: ctx.userId,
    contextType: ctx.contextType,
    contextId: ctx.contextId,
    candidates,
  });

  return result?.items ?? null;
}

/** Record a view for Learning History (Personalization / public pages). */
export async function recordContentView(input: {
  userId: string;
  entityType: RecommendationEntityType;
  entityId: string;
}): Promise<void> {
  if (!isDatabaseConfigured() || !input.userId) return;
  const kind =
    input.entityType === "article"
      ? "ARTICLE"
      : input.entityType === "guide"
        ? "GUIDE"
        : input.entityType === "ai_tool"
          ? "AI_TOOL"
          : input.entityType === "category"
            ? "CATEGORY"
            : "TOPIC";
  await db().learningHistory.create({
    data: {
      publicUserId: input.userId,
      entityType: kind,
      entityId: input.entityId,
    },
  });
}
