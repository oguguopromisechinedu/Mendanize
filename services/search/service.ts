/**
 * Search Shared Service — MES-017 Search & Discovery.
 * Unified query across articles, guides, tools, categories, topics.
 * Postgres ILIKE / contains for this phase; tsvector can replace later.
 */

import "server-only";

import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import {
  contentHref,
  type ContentScope,
} from "@/lib/content-paths";
import { getRecommendations } from "@/services/recommendations";
import type {
  SearchConfigurationRecord,
  SearchConfigurationWrite,
  SearchDifficulty,
  SearchDiscoveryPayload,
  SearchEntityType,
  SearchFilterRecord,
  SearchHit,
  SearchParams,
  SearchResult,
  SearchResultGroup,
  SearchSettingsOverview,
  SearchSuggestionItem,
} from "./types";

const SETTINGS_KEY = "main";

const TYPE_LABELS: Record<SearchEntityType, string> = {
  article: "Articles",
  guide: "Guides",
  ai_tool: "AI Tools",
  category: "Categories",
  topic: "Topics",
};

const TYPE_ORDER: SearchEntityType[] = [
  "article",
  "guide",
  "ai_tool",
  "category",
  "topic",
];

const FALLBACK_SUGGESTIONS = [
  "What is large language models?",
  "Getting started with AI tools",
  "Learning path for web developers",
];

const FALLBACK_TRENDING = [
  { query: "Prompt engineering", score: 100 },
  { query: "React Server Components", score: 80 },
  { query: "AI tools for beginners", score: 60 },
];

function db() {
  return getPrisma();
}

function mapConfig(row: {
  id: string;
  key: string;
  enabled: boolean;
  minQueryLength: number;
  resultsPerPage: number;
  rankingRulesNote: string | null;
  synonymsPlaceholder: string | null;
  stopWordsPlaceholder: string | null;
  analyticsPlaceholder: string | null;
  includeArticles: boolean;
  includeGuides: boolean;
  includeTools: boolean;
  includeCategories: boolean;
  includeTopics: boolean;
  updatedAt: Date;
}): SearchConfigurationRecord {
  return {
    id: row.id,
    key: row.key,
    enabled: row.enabled,
    minQueryLength: row.minQueryLength,
    resultsPerPage: row.resultsPerPage,
    rankingRulesNote: row.rankingRulesNote,
    synonymsPlaceholder: row.synonymsPlaceholder,
    stopWordsPlaceholder: row.stopWordsPlaceholder,
    analyticsPlaceholder: row.analyticsPlaceholder,
    includeArticles: row.includeArticles,
    includeGuides: row.includeGuides,
    includeTools: row.includeTools,
    includeCategories: row.includeCategories,
    includeTopics: row.includeTopics,
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function ensureSeeded(): Promise<void> {
  if (!isDatabaseConfigured()) return;

  const existing = await db().searchConfiguration.findUnique({
    where: { key: SETTINGS_KEY },
  });
  if (existing) return;

  await db().$transaction(async (tx) => {
    await tx.searchConfiguration.create({
      data: {
        key: SETTINGS_KEY,
        rankingRulesNote:
          "Title matches rank above excerpt. Featured content is boosted. Personalized ranking lands later.",
        synonymsPlaceholder: "llm, large language model\nai, artificial intelligence",
        stopWordsPlaceholder: "a, an, the, of, for, to, in",
        analyticsPlaceholder:
          "Search analytics reads from Analytics (MES-023) SearchAnalytics / trending fallback.",
      },
    });

    await tx.searchFilter.createMany({
      data: [
        { key: "content_type", label: "Content type", kind: "CONTENT_TYPE", sortOrder: 0 },
        { key: "category", label: "Category", kind: "CATEGORY", sortOrder: 1 },
        { key: "topic", label: "Topic", kind: "TOPIC", sortOrder: 2 },
        { key: "difficulty", label: "Difficulty", kind: "DIFFICULTY", sortOrder: 3 },
        { key: "publish_date", label: "Publish date", kind: "PUBLISH_DATE", sortOrder: 4 },
        { key: "featured", label: "Featured", kind: "FEATURED", sortOrder: 5 },
        {
          key: "recently_updated",
          label: "Recently updated",
          kind: "RECENTLY_UPDATED",
          sortOrder: 6,
        },
      ],
    });

    await tx.searchSuggestion.createMany({
      data: FALLBACK_SUGGESTIONS.map((query, sortOrder) => ({
        query,
        label: query,
        sortOrder,
      })),
    });

    await tx.trendingSearch.createMany({
      data: FALLBACK_TRENDING.map((t, sortOrder) => ({
        query: t.query,
        score: t.score,
        sortOrder,
      })),
    });
  });
}

function contains(q: string) {
  return { contains: q, mode: "insensitive" as const };
}

function hrefFor(
  type: SearchEntityType,
  slug: string,
  scope: ContentScope = "public",
): string {
  return contentHref(type, slug, { scope });
}

function enabledTypes(
  config: SearchConfigurationRecord,
  requested?: SearchEntityType[],
): SearchEntityType[] {
  const allowed: SearchEntityType[] = [];
  if (config.includeArticles) allowed.push("article");
  if (config.includeGuides) allowed.push("guide");
  if (config.includeTools) allowed.push("ai_tool");
  if (config.includeCategories) allowed.push("category");
  if (config.includeTopics) allowed.push("topic");
  if (!requested?.length) return allowed;
  return allowed.filter((t) => requested.includes(t));
}

function groupHits(hits: SearchHit[]): SearchResultGroup[] {
  return TYPE_ORDER.map((type) => ({
    type,
    label: TYPE_LABELS[type],
    hits: hits.filter((h) => h.type === type),
  })).filter((g) => g.hits.length > 0);
}

export async function getSearchConfiguration(): Promise<SearchConfigurationRecord> {
  await ensureSeeded();
  if (!isDatabaseConfigured()) {
    return {
      id: "local",
      key: SETTINGS_KEY,
      enabled: true,
      minQueryLength: 2,
      resultsPerPage: 12,
      rankingRulesNote: null,
      synonymsPlaceholder: null,
      stopWordsPlaceholder: null,
      analyticsPlaceholder: null,
      includeArticles: true,
      includeGuides: true,
      includeTools: true,
      includeCategories: true,
      includeTopics: true,
      updatedAt: new Date().toISOString(),
    };
  }
  const row = await db().searchConfiguration.findUniqueOrThrow({
    where: { key: SETTINGS_KEY },
  });
  return mapConfig(row);
}

export async function updateSearchConfiguration(
  input: SearchConfigurationWrite,
): Promise<SearchConfigurationRecord> {
  await ensureSeeded();
  const row = await db().searchConfiguration.update({
    where: { key: SETTINGS_KEY },
    data: {
      ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
      ...(input.minQueryLength !== undefined
        ? { minQueryLength: input.minQueryLength }
        : {}),
      ...(input.resultsPerPage !== undefined
        ? { resultsPerPage: input.resultsPerPage }
        : {}),
      ...(input.rankingRulesNote !== undefined
        ? { rankingRulesNote: input.rankingRulesNote }
        : {}),
      ...(input.synonymsPlaceholder !== undefined
        ? { synonymsPlaceholder: input.synonymsPlaceholder }
        : {}),
      ...(input.stopWordsPlaceholder !== undefined
        ? { stopWordsPlaceholder: input.stopWordsPlaceholder }
        : {}),
      ...(input.analyticsPlaceholder !== undefined
        ? { analyticsPlaceholder: input.analyticsPlaceholder }
        : {}),
      ...(input.includeArticles !== undefined
        ? { includeArticles: input.includeArticles }
        : {}),
      ...(input.includeGuides !== undefined
        ? { includeGuides: input.includeGuides }
        : {}),
      ...(input.includeTools !== undefined
        ? { includeTools: input.includeTools }
        : {}),
      ...(input.includeCategories !== undefined
        ? { includeCategories: input.includeCategories }
        : {}),
      ...(input.includeTopics !== undefined
        ? { includeTopics: input.includeTopics }
        : {}),
    },
  });
  return mapConfig(row);
}

export async function listSearchFilters(): Promise<SearchFilterRecord[]> {
  await ensureSeeded();
  if (!isDatabaseConfigured()) return [];
  const rows = await db().searchFilter.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    key: r.key,
    label: r.label,
    kind: r.kind,
    enabled: r.enabled,
    sortOrder: r.sortOrder,
    optionsJson: r.optionsJson,
  }));
}

export async function setSearchFilterEnabled(
  key: string,
  enabled: boolean,
): Promise<SearchFilterRecord> {
  await ensureSeeded();
  const row = await db().searchFilter.update({
    where: { key },
    data: { enabled },
  });
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    kind: row.kind,
    enabled: row.enabled,
    sortOrder: row.sortOrder,
    optionsJson: row.optionsJson,
  };
}

export async function getSearchSettingsOverview(): Promise<SearchSettingsOverview> {
  await ensureSeeded();
  const [configuration, filters, suggestionCount, trendingCount, historyCount] =
    await Promise.all([
      getSearchConfiguration(),
      listSearchFilters(),
      isDatabaseConfigured() ? db().searchSuggestion.count() : Promise.resolve(0),
      isDatabaseConfigured() ? db().trendingSearch.count() : Promise.resolve(0),
      isDatabaseConfigured() ? db().searchHistory.count() : Promise.resolve(0),
    ]);
  return {
    configuration,
    filters,
    suggestionCount,
    trendingCount,
    historyCount,
  };
}

export async function recordSearchHistory(input: {
  query: string;
  resultCount: number;
  userId?: string | null;
  sessionKey?: string | null;
}): Promise<void> {
  if (!isDatabaseConfigured()) return;
  await ensureSeeded();
  const q = input.query.trim();
  if (!q) return;
  await db().searchHistory.create({
    data: {
      query: q.slice(0, 200),
      resultCount: input.resultCount,
      userId: input.userId ?? null,
      sessionKey: input.sessionKey ?? null,
    },
  });
}

export async function getRecentSearches(limit = 6): Promise<SearchSuggestionItem[]> {
  await ensureSeeded();
  if (!isDatabaseConfigured()) {
    return [
      { query: "Prompt engineering", label: "Prompt engineering", source: "recent" },
      {
        query: "React Server Components",
        label: "React Server Components",
        source: "recent",
      },
    ];
  }
  const rows = await db().searchHistory.findMany({
    orderBy: { createdAt: "desc" },
    take: 40,
  });
  const seen = new Set<string>();
  const out: SearchSuggestionItem[] = [];
  for (const row of rows) {
    const key = row.query.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ query: row.query, label: row.query, source: "recent" });
    if (out.length >= limit) break;
  }
  return out;
}

export async function getTrendingSearches(limit = 6): Promise<SearchSuggestionItem[]> {
  await ensureSeeded();
  if (!isDatabaseConfigured()) {
    return FALLBACK_TRENDING.slice(0, limit).map((t) => ({
      query: t.query,
      label: t.query,
      source: "trending" as const,
    }));
  }
  const rows = await db().trendingSearch.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { score: "desc" }],
    take: limit,
  });
  if (rows.length > 0) {
    return rows.map((r) => ({
      query: r.query,
      label: r.query,
      source: "trending" as const,
    }));
  }
  try {
    const { getTopSearchQueriesFromAnalytics } = await import(
      "@/services/analytics"
    );
    const fromAnalytics = await getTopSearchQueriesFromAnalytics(limit);
    if (fromAnalytics.length > 0) {
      return fromAnalytics.map((t) => ({
        query: t.query,
        label: t.query,
        source: "trending" as const,
      }));
    }
  } catch {
    /* fall through */
  }
  return FALLBACK_TRENDING.slice(0, limit).map((t) => ({
    query: t.query,
    label: t.query,
    source: "trending" as const,
  }));
}

export async function getSearchSuggestions(
  prefix = "",
  limit = 8,
): Promise<SearchSuggestionItem[]> {
  await ensureSeeded();
  if (!isDatabaseConfigured()) {
    const q = prefix.trim().toLowerCase();
    return FALLBACK_SUGGESTIONS.filter((s) => !q || s.toLowerCase().includes(q))
      .slice(0, limit)
      .map((query) => ({ query, label: query, source: "suggestion" as const }));
  }
  const q = prefix.trim();
  const rows = await db().searchSuggestion.findMany({
    where: {
      active: true,
      ...(q
        ? {
            OR: [
              { query: contains(q) },
              { label: contains(q) },
            ],
          }
        : {}),
    },
    orderBy: { sortOrder: "asc" },
    take: limit,
  });
  return rows.map((r) => ({
    query: r.query,
    label: r.label ?? r.query,
    source: "suggestion" as const,
  }));
}

async function getRecommendationSuggestions(
  limit = 4,
): Promise<SearchSuggestionItem[]> {
  try {
    const { items } = await getRecommendations({
      contextType: "trending",
      contextId: "search",
      limit,
    });
    return items.map((item) => ({
      query: item.title,
      label: item.title,
      source: "recommendation" as const,
    }));
  } catch {
    return [];
  }
}

export async function getSearchDiscovery(
  prefix = "",
): Promise<SearchDiscoveryPayload> {
  const [suggestions, recent, trending, recommended] = await Promise.all([
    getSearchSuggestions(prefix, 8),
    getRecentSearches(6),
    getTrendingSearches(6),
    getRecommendationSuggestions(4),
  ]);
  return { suggestions, recent, trending, recommended };
}

export async function search(params: SearchParams): Promise<SearchResult> {
  const config = await getSearchConfiguration();
  const query = params.query.trim();
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(
    50,
    Math.max(1, params.pageSize ?? config.resultsPerPage),
  );
  const hrefScope: ContentScope = params.hrefScope ?? "public";

  const empty = (): SearchResult => ({
    query,
    hits: [],
    groups: [],
    total: 0,
    page,
    pageSize,
  });

  if (!config.enabled || query.length < config.minQueryLength) {
    return empty();
  }

  if (!isDatabaseConfigured()) {
    return empty();
  }

  await ensureSeeded();

  const types = enabledTypes(config, params.types);
  const publishedAfter = params.publishedAfter
    ? new Date(params.publishedAfter)
    : null;
  const publishedBefore = params.publishedBefore
    ? new Date(params.publishedBefore)
    : null;
  const recentlyCutoff = params.recentlyUpdated
    ? new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
    : null;

  const hits: SearchHit[] = [];

  if (types.includes("article")) {
    const articles = await db().article.findMany({
      where: {
        status: "PUBLISHED",
        AND: [
          {
            OR: [
              { title: contains(query) },
              { excerpt: contains(query) },
              { content: contains(query) },
              { focusKeyword: contains(query) },
            ],
          },
          ...(params.categorySlug
            ? [{ category: { slug: params.categorySlug } }]
            : []),
          ...(params.topicSlug ? [{ topic: { slug: params.topicSlug } }] : []),
          ...(params.featured != null ? [{ featured: params.featured }] : []),
          ...(publishedAfter ? [{ publishedAt: { gte: publishedAfter } }] : []),
          ...(publishedBefore
            ? [{ publishedAt: { lte: publishedBefore } }]
            : []),
          ...(recentlyCutoff ? [{ updatedAt: { gte: recentlyCutoff } }] : []),
        ],
      },
      include: {
        category: { select: { name: true } },
        topic: { select: { name: true } },
        featuredImage: { select: { url: true } },
      },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      take: 40,
    });
    for (const a of articles) {
      hits.push({
        type: "article",
        id: a.id,
        slug: a.slug,
        href: hrefFor("article", a.slug, hrefScope),
        title: a.title,
        excerpt: a.excerpt,
        thumbnailUrl: a.featuredImage?.url ?? a.socialImageUrl,
        categoryName: a.category?.name ?? null,
        topicName: a.topic?.name ?? null,
        readingTimeMin: a.readingTimeMin,
        publishedAt: a.publishedAt?.toISOString() ?? null,
        updatedAt: a.updatedAt.toISOString(),
        featured: a.featured,
      });
    }
  }

  if (types.includes("guide")) {
    const guides = await db().guide.findMany({
      where: {
        status: "PUBLISHED",
        AND: [
          {
            OR: [
              { title: contains(query) },
              { shortDescription: contains(query) },
              { fullDescription: contains(query) },
              { focusKeyword: contains(query) },
            ],
          },
          ...(params.categorySlug
            ? [{ category: { slug: params.categorySlug } }]
            : []),
          ...(params.topicSlug ? [{ topic: { slug: params.topicSlug } }] : []),
          ...(params.difficulty
            ? [{ difficulty: params.difficulty as SearchDifficulty }]
            : []),
          ...(params.featured != null ? [{ featured: params.featured }] : []),
          ...(publishedAfter ? [{ publishedAt: { gte: publishedAfter } }] : []),
          ...(publishedBefore
            ? [{ publishedAt: { lte: publishedBefore } }]
            : []),
          ...(recentlyCutoff ? [{ updatedAt: { gte: recentlyCutoff } }] : []),
        ],
      },
      include: {
        category: { select: { name: true } },
        topic: { select: { name: true } },
      },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      take: 40,
    });
    for (const g of guides) {
      hits.push({
        type: "guide",
        id: g.id,
        slug: g.slug,
        href: hrefFor("guide", g.slug, hrefScope),
        title: g.title,
        excerpt: g.shortDescription,
        thumbnailUrl: g.coverImageUrl,
        categoryName: g.category?.name ?? null,
        topicName: g.topic?.name ?? null,
        difficulty: g.difficulty,
        readingTimeMin: g.estimatedMinutes,
        publishedAt: g.publishedAt?.toISOString() ?? null,
        updatedAt: g.updatedAt.toISOString(),
        featured: g.featured,
      });
    }
  }

  if (types.includes("ai_tool")) {
    const tools = await db().tool.findMany({
      where: {
        status: "PUBLISHED",
        AND: [
          {
            OR: [
              { name: contains(query) },
              { shortDescription: contains(query) },
              { fullDescription: contains(query) },
              { focusKeyword: contains(query) },
              { developer: contains(query) },
            ],
          },
          ...(params.categorySlug
            ? [{ categories: { some: { category: { slug: params.categorySlug } } } }]
            : []),
          ...(params.topicSlug
            ? [{ topics: { some: { topic: { slug: params.topicSlug } } } }]
            : []),
          ...(params.difficulty
            ? [{ difficulty: params.difficulty as SearchDifficulty }]
            : []),
          ...(params.featured != null ? [{ featured: params.featured }] : []),
          ...(publishedAfter ? [{ publishedAt: { gte: publishedAfter } }] : []),
          ...(publishedBefore
            ? [{ publishedAt: { lte: publishedBefore } }]
            : []),
          ...(recentlyCutoff ? [{ updatedAt: { gte: recentlyCutoff } }] : []),
        ],
      },
      include: {
        categories: { include: { category: { select: { name: true } } }, take: 1 },
        topics: { include: { topic: { select: { name: true } } }, take: 1 },
        images: { where: { kind: { in: ["LOGO", "COVER"] } }, take: 1 },
      },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      take: 40,
    });
    for (const t of tools) {
      hits.push({
        type: "ai_tool",
        id: t.id,
        slug: t.slug,
        href: hrefFor("ai_tool", t.slug, hrefScope),
        title: t.name,
        excerpt: t.shortDescription,
        thumbnailUrl: t.images[0]?.url ?? null,
        categoryName: t.categories[0]?.category.name ?? null,
        topicName: t.topics[0]?.topic.name ?? null,
        difficulty: t.difficulty,
        publishedAt: t.publishedAt?.toISOString() ?? null,
        updatedAt: t.updatedAt.toISOString(),
        featured: t.featured,
      });
    }
  }

  if (types.includes("category") && params.difficulty == null) {
    const categories = await db().category.findMany({
      where: {
        status: "ACTIVE",
        AND: [
          {
            OR: [
              { name: contains(query) },
              { description: contains(query) },
              { focusKeyword: contains(query) },
            ],
          },
          ...(params.featured != null ? [{ featured: params.featured }] : []),
          ...(recentlyCutoff ? [{ updatedAt: { gte: recentlyCutoff } }] : []),
        ],
      },
      include: { image: { select: { url: true } } },
      orderBy: [{ featured: "desc" }, { displayOrder: "asc" }],
      take: 20,
    });
    for (const c of categories) {
      if (params.categorySlug && c.slug !== params.categorySlug) continue;
      hits.push({
        type: "category",
        id: c.id,
        slug: c.slug,
        href: hrefFor("category", c.slug, hrefScope),
        title: c.name,
        excerpt: c.description,
        thumbnailUrl: c.image?.url ?? null,
        updatedAt: c.updatedAt.toISOString(),
        featured: c.featured,
      });
    }
  }

  if (types.includes("topic") && params.difficulty == null) {
    const topics = await db().topic.findMany({
      where: {
        status: "ACTIVE",
        AND: [
          {
            OR: [
              { name: contains(query) },
              { description: contains(query) },
              { focusKeyword: contains(query) },
            ],
          },
          ...(params.categorySlug
            ? [{ category: { slug: params.categorySlug } }]
            : []),
          ...(params.topicSlug ? [{ slug: params.topicSlug }] : []),
          ...(params.featured != null ? [{ featured: params.featured }] : []),
          ...(recentlyCutoff ? [{ updatedAt: { gte: recentlyCutoff } }] : []),
        ],
      },
      include: {
        category: { select: { name: true } },
        image: { select: { url: true } },
      },
      orderBy: [{ featured: "desc" }, { displayOrder: "asc" }],
      take: 20,
    });
    for (const t of topics) {
      hits.push({
        type: "topic",
        id: t.id,
        slug: t.slug,
        href: hrefFor("topic", t.slug, hrefScope),
        title: t.name,
        excerpt: t.description,
        thumbnailUrl: t.image?.url ?? null,
        categoryName: t.category?.name ?? null,
        updatedAt: t.updatedAt.toISOString(),
        featured: t.featured,
      });
    }
  }

  hits.sort((a, b) => {
    const af = a.featured ? 1 : 0;
    const bf = b.featured ? 1 : 0;
    if (af !== bf) return bf - af;
    const ad = a.publishedAt ?? a.updatedAt ?? "";
    const bd = b.publishedAt ?? b.updatedAt ?? "";
    return bd.localeCompare(ad);
  });

  const total = hits.length;
  const start = (page - 1) * pageSize;
  const pageHits = hits.slice(start, start + pageSize);

  if (params.recordHistory !== false) {
    await recordSearchHistory({
      query,
      resultCount: total,
      userId: params.userId,
      sessionKey: params.sessionKey,
    });
  }

  return {
    query,
    hits: pageHits,
    groups: groupHits(pageHits),
    total,
    page,
    pageSize,
  };
}

export async function listFilterOptions(): Promise<{
  categories: Array<{ slug: string; name: string }>;
  topics: Array<{ slug: string; name: string }>;
}> {
  if (!isDatabaseConfigured()) {
    return { categories: [], topics: [] };
  }
  const [categories, topics] = await Promise.all([
    db().category.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, name: true },
      orderBy: { displayOrder: "asc" },
      take: 100,
    }),
    db().topic.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, name: true },
      orderBy: { displayOrder: "asc" },
      take: 100,
    }),
  ]);
  return { categories, topics };
}
