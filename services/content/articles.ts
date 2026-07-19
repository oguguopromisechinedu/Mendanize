/**
 * Article Content Service — MES-008.
 * Prisma when DATABASE_URL is set; otherwise an in-memory store for local UI work.
 */

import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { estimateReadingTimeMin } from "./reading-time";
import type {
  ArticleAdminListParams,
  ArticleListResult,
  ArticleRecord,
  ArticleStatusValue,
  ArticleSummary,
  ArticleWriteInput,
  TagSummary,
} from "./types";

export { estimateReadingTimeMin } from "./reading-time";
export {
  listCategoriesAdmin,
  listTopicsAdmin,
  listCategorySummaries,
  listTopicSummaries,
} from "./taxonomy";
import { getCategoryById, getTopicById } from "./taxonomy";

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 120) || "article"
  );
}

type MemoryArticle = ArticleRecord & { tagNames: string[] };

const memory = {
  tags: [
    { id: "tag_ai", slug: "ai", name: "AI" },
    { id: "tag_learn", slug: "learning", name: "Learning" },
  ] as TagSummary[],
  articles: [] as MemoryArticle[],
};

function seedMemoryArticles() {
  if (memory.articles.length > 0) return;
  const now = new Date().toISOString();
  memory.articles.push({
    id: "art_seed_1",
    title: "How transformers actually work",
    slug: "how-transformers-actually-work",
    excerpt: "A practical walkthrough of attention for learners.",
    content:
      "<h2>Attention</h2><p>Transformers compare tokens to every other token…</p>",
    status: "PUBLISHED",
    featured: true,
    readingTimeMin: 6,
    authorId: "seed-author",
    authorName: "Editorial",
    categoryId: "cat_ai",
    categoryName: "Artificial Intelligence",
    categorySlug: "artificial-intelligence",
    topicId: "top_transformers",
    topicName: "Transformers",
    topicSlug: "transformers",
    publishedAt: now,
    scheduledAt: null,
    viewCount: 1200,
    seoTitle: "How transformers actually work | Mendanize",
    seoDescription: "Learn attention without the jargon fog.",
    focusKeyword: "transformers",
    canonicalUrl: null,
    socialImageUrl: null,
    featuredImageUrl: null,
    featuredImageAlt: null,
    tags: [memory.tags[0]],
    tagNames: ["AI"],
    createdAt: now,
    updatedAt: now,
  });
}

function mapPrismaArticle(row: {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: ArticleStatusValue;
  featured: boolean;
  readingTimeMin: number;
  authorId: string;
  categoryId: string | null;
  topicId: string | null;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  viewCount: number;
  seoTitle: string | null;
  seoDescription: string | null;
  focusKeyword: string | null;
  canonicalUrl: string | null;
  socialImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: { name: string | null };
  category: { name: string; slug: string } | null;
  topic: { name: string; slug: string } | null;
  featuredImage: { url: string; alt: string | null } | null;
  tags: Array<{ tag: { id: string; name: string; slug: string } }>;
}): ArticleRecord {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    status: row.status,
    featured: row.featured,
    readingTimeMin: row.readingTimeMin,
    authorId: row.authorId,
    authorName: row.author.name,
    categoryId: row.categoryId,
    categoryName: row.category?.name ?? null,
    categorySlug: row.category?.slug ?? null,
    topicId: row.topicId,
    topicName: row.topic?.name ?? null,
    topicSlug: row.topic?.slug ?? null,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    scheduledAt: row.scheduledAt?.toISOString() ?? null,
    viewCount: row.viewCount,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    focusKeyword: row.focusKeyword,
    canonicalUrl: row.canonicalUrl,
    socialImageUrl: row.socialImageUrl,
    featuredImageUrl: row.featuredImage?.url ?? null,
    featuredImageAlt: row.featuredImage?.alt ?? null,
    tags: row.tags.map((t) => t.tag),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const articleInclude = {
  author: { select: { name: true } },
  category: { select: { name: true, slug: true } },
  topic: { select: { name: true, slug: true } },
  featuredImage: { select: { url: true, alt: true } },
  tags: { include: { tag: true } },
} as const;

async function ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = slugify(base);
  if (!isDatabaseConfigured()) {
    seedMemoryArticles();
    let n = 0;
    while (
      memory.articles.some(
        (a) => a.slug === slug && a.id !== excludeId
      )
    ) {
      n += 1;
      slug = `${slugify(base)}-${n}`;
    }
    return slug;
  }

  const prisma = getPrisma();
  let n = 0;
  while (true) {
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    n += 1;
    slug = `${slugify(base)}-${n}`;
  }
}

async function resolveTagIds(names: string[]): Promise<string[]> {
  const cleaned = [
    ...new Set(names.map((n) => n.trim()).filter(Boolean)),
  ];
  if (!cleaned.length) return [];

  if (!isDatabaseConfigured()) {
    const ids: string[] = [];
    for (const name of cleaned) {
      let tag = memory.tags.find(
        (t) => t.name.toLowerCase() === name.toLowerCase()
      );
      if (!tag) {
        tag = {
          id: `tag_${slugify(name)}`,
          name,
          slug: slugify(name),
        };
        memory.tags.push(tag);
      }
      ids.push(tag.id);
    }
    return ids;
  }

  const prisma = getPrisma();
  const ids: string[] = [];
  for (const name of cleaned) {
    const slug = slugify(name);
    const tag = await prisma.tag.upsert({
      where: { slug },
      create: { name, slug },
      update: {},
    });
    ids.push(tag.id);
  }
  return ids;
}

function filterMemory(params: ArticleAdminListParams = {}): ArticleListResult {
  seedMemoryArticles();
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));
  let items = [...memory.articles];

  if (params.status && params.status !== "ALL") {
    items = items.filter((a) => a.status === params.status);
  }
  if (params.query?.trim()) {
    const q = params.query.trim().toLowerCase();
    items = items.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q) ||
        (a.excerpt ?? "").toLowerCase().includes(q)
    );
  }
  if (params.categoryId) {
    items = items.filter((a) => a.categoryId === params.categoryId);
  }
  if (params.topicId) {
    items = items.filter((a) => a.topicId === params.topicId);
  }
  if (typeof params.featured === "boolean") {
    items = items.filter((a) => a.featured === params.featured);
  }

  const sort = params.sort ?? "updatedAt";
  const dir = params.sortDir === "asc" ? 1 : -1;
  items.sort((a, b) => {
    const av = a[sort] ?? "";
    const bv = b[sort] ?? "";
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });

  const total = items.length;
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize).map(({ tagNames: _, ...rest }) => rest),
    total,
    page,
    pageSize,
  };
}

export async function listArticlesAdmin(
  params: ArticleAdminListParams = {}
): Promise<ArticleListResult> {
  if (!isDatabaseConfigured()) return filterMemory(params);

  const prisma = getPrisma();
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));
  const where: Record<string, unknown> = {};

  if (params.status && params.status !== "ALL") {
    where.status = params.status;
  }
  if (params.query?.trim()) {
    where.OR = [
      { title: { contains: params.query.trim(), mode: "insensitive" } },
      { slug: { contains: params.query.trim(), mode: "insensitive" } },
      { excerpt: { contains: params.query.trim(), mode: "insensitive" } },
    ];
  }
  if (params.categoryId) where.categoryId = params.categoryId;
  if (params.topicId) where.topicId = params.topicId;
  if (typeof params.featured === "boolean") where.featured = params.featured;

  const sort = params.sort ?? "updatedAt";
  const sortDir = params.sortDir ?? "desc";

  const [total, rows] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      include: articleInclude,
      orderBy: { [sort]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: rows.map((r) => mapPrismaArticle(r as Parameters<typeof mapPrismaArticle>[0])),
    total,
    page,
    pageSize,
  };
}

export async function getArticleById(id: string): Promise<ArticleRecord | null> {
  if (!isDatabaseConfigured()) {
    seedMemoryArticles();
    const found = memory.articles.find((a) => a.id === id);
    if (!found) return null;
    const { tagNames: _, ...rest } = found;
    return rest;
  }

  const row = await getPrisma().article.findUnique({
    where: { id },
    include: articleInclude,
  });
  return row
    ? mapPrismaArticle(row as Parameters<typeof mapPrismaArticle>[0])
    : null;
}

export async function getArticleBySlugAdmin(
  slug: string
): Promise<ArticleRecord | null> {
  if (!isDatabaseConfigured()) {
    seedMemoryArticles();
    const found = memory.articles.find((a) => a.slug === slug);
    if (!found) return null;
    const { tagNames: _, ...rest } = found;
    return rest;
  }

  const row = await getPrisma().article.findUnique({
    where: { slug },
    include: articleInclude,
  });
  return row
    ? mapPrismaArticle(row as Parameters<typeof mapPrismaArticle>[0])
    : null;
}

export async function createArticle(
  input: ArticleWriteInput
): Promise<ArticleRecord> {
  const slug = await ensureUniqueSlug(input.slug || input.title);
  const readingTimeMin = estimateReadingTimeMin(input.content);
  const status = input.status ?? "DRAFT";
  const publishedAt =
    status === "PUBLISHED"
      ? input.publishedAt
        ? new Date(input.publishedAt)
        : new Date()
      : input.publishedAt
        ? new Date(input.publishedAt)
        : null;
  const scheduledAt =
    status === "SCHEDULED" && input.scheduledAt
      ? new Date(input.scheduledAt)
      : input.scheduledAt
        ? new Date(input.scheduledAt)
        : null;

  if (!isDatabaseConfigured()) {
    seedMemoryArticles();
    const tagIds = await resolveTagIds(input.tagNames ?? []);
    const tags = memory.tags.filter((t) => tagIds.includes(t.id));
    const cat = input.categoryId
      ? await getCategoryById(input.categoryId)
      : null;
    const topic = input.topicId ? await getTopicById(input.topicId) : null;
    const now = new Date().toISOString();
    const record: MemoryArticle = {
      id: `art_${Date.now()}`,
      title: input.title,
      slug,
      excerpt: input.excerpt ?? null,
      content: input.content,
      status,
      featured: input.featured ?? false,
      readingTimeMin,
      authorId: input.authorId,
      authorName: "You",
      categoryId: input.categoryId ?? null,
      categoryName: cat?.name ?? null,
      categorySlug: cat?.slug ?? null,
      topicId: input.topicId ?? null,
      topicName: topic?.name ?? null,
      topicSlug: topic?.slug ?? null,
      publishedAt: publishedAt?.toISOString() ?? null,
      scheduledAt: scheduledAt?.toISOString() ?? null,
      viewCount: 0,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      focusKeyword: input.focusKeyword ?? null,
      canonicalUrl: input.canonicalUrl ?? null,
      socialImageUrl: input.socialImageUrl ?? null,
      featuredImageUrl: input.featuredImageUrl ?? null,
      featuredImageAlt: input.featuredImageAlt ?? null,
      tags,
      tagNames: tags.map((t) => t.name),
      createdAt: now,
      updatedAt: now,
    };
    memory.articles.unshift(record);
    const { tagNames: _, ...rest } = record;
    return rest;
  }

  const prisma = getPrisma();
  const tagIds = await resolveTagIds(input.tagNames ?? []);

  const created = await prisma.article.create({
    data: {
      title: input.title,
      slug,
      excerpt: input.excerpt ?? null,
      content: input.content,
      status,
      featured: input.featured ?? false,
      readingTimeMin,
      authorId: input.authorId,
      categoryId: input.categoryId || null,
      topicId: input.topicId || null,
      publishedAt,
      scheduledAt,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      focusKeyword: input.focusKeyword ?? null,
      canonicalUrl: input.canonicalUrl ?? null,
      socialImageUrl: input.socialImageUrl ?? null,
      tags: tagIds.length
        ? { create: tagIds.map((tagId) => ({ tagId })) }
        : undefined,
      featuredImage: input.featuredImageUrl
        ? {
            create: {
              url: input.featuredImageUrl,
              alt: input.featuredImageAlt ?? null,
            },
          }
        : undefined,
    },
    include: articleInclude,
  });

  return mapPrismaArticle(created as Parameters<typeof mapPrismaArticle>[0]);
}

export async function updateArticle(
  id: string,
  input: Omit<ArticleWriteInput, "authorId"> & { authorId?: string }
): Promise<ArticleRecord | null> {
  const existing = await getArticleById(id);
  if (!existing) return null;

  const slug = await ensureUniqueSlug(input.slug || input.title, id);
  const readingTimeMin = estimateReadingTimeMin(input.content);
  const status = input.status ?? existing.status;
  let publishedAt = existing.publishedAt ? new Date(existing.publishedAt) : null;
  if (status === "PUBLISHED" && !publishedAt) {
    publishedAt = input.publishedAt ? new Date(input.publishedAt) : new Date();
  } else if (input.publishedAt) {
    publishedAt = new Date(input.publishedAt);
  }
  if (status === "DRAFT" || status === "ARCHIVED") {
    // keep publishedAt for history unless cleared
  }
  const scheduledAt =
    status === "SCHEDULED"
      ? input.scheduledAt
        ? new Date(input.scheduledAt)
        : existing.scheduledAt
          ? new Date(existing.scheduledAt)
          : null
      : input.scheduledAt
        ? new Date(input.scheduledAt)
        : null;

  if (!isDatabaseConfigured()) {
    seedMemoryArticles();
    const idx = memory.articles.findIndex((a) => a.id === id);
    if (idx < 0) return null;
    const tagIds = await resolveTagIds(input.tagNames ?? existing.tags.map((t) => t.name));
    const tags = memory.tags.filter((t) => tagIds.includes(t.id));
    const catId = input.categoryId ?? existing.categoryId;
    const topicId = input.topicId ?? existing.topicId;
    const cat = catId ? await getCategoryById(catId) : null;
    const topic = topicId ? await getTopicById(topicId) : null;
    const updated: MemoryArticle = {
      ...memory.articles[idx],
      title: input.title,
      slug,
      excerpt: input.excerpt ?? null,
      content: input.content,
      status,
      featured: input.featured ?? false,
      readingTimeMin,
      categoryId: input.categoryId ?? null,
      categoryName: cat?.name ?? null,
      categorySlug: cat?.slug ?? null,
      topicId: input.topicId ?? null,
      topicName: topic?.name ?? null,
      topicSlug: topic?.slug ?? null,
      publishedAt: publishedAt?.toISOString() ?? null,
      scheduledAt: scheduledAt?.toISOString() ?? null,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      focusKeyword: input.focusKeyword ?? null,
      canonicalUrl: input.canonicalUrl ?? null,
      socialImageUrl: input.socialImageUrl ?? null,
      featuredImageUrl: input.featuredImageUrl ?? null,
      featuredImageAlt: input.featuredImageAlt ?? null,
      tags,
      tagNames: tags.map((t) => t.name),
      updatedAt: new Date().toISOString(),
    };
    memory.articles[idx] = updated;
    const { tagNames: _, ...rest } = updated;
    return rest;
  }

  const prisma = getPrisma();
  const tagIds = await resolveTagIds(
    input.tagNames ?? existing.tags.map((t) => t.name)
  );

  await prisma.articleTag.deleteMany({ where: { articleId: id } });

  const hasImage = Boolean(input.featuredImageUrl);
  const existingImage = await prisma.featuredImage.findUnique({
    where: { articleId: id },
  });

  const updated = await prisma.article.update({
    where: { id },
    data: {
      title: input.title,
      slug,
      excerpt: input.excerpt ?? null,
      content: input.content,
      status,
      featured: input.featured ?? false,
      readingTimeMin,
      categoryId: input.categoryId || null,
      topicId: input.topicId || null,
      publishedAt,
      scheduledAt,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      focusKeyword: input.focusKeyword ?? null,
      canonicalUrl: input.canonicalUrl ?? null,
      socialImageUrl: input.socialImageUrl ?? null,
      tags: tagIds.length
        ? { create: tagIds.map((tagId) => ({ tagId })) }
        : undefined,
      featuredImage: hasImage
        ? {
            upsert: {
              create: {
                url: input.featuredImageUrl!,
                alt: input.featuredImageAlt ?? null,
              },
              update: {
                url: input.featuredImageUrl!,
                alt: input.featuredImageAlt ?? null,
              },
            },
          }
        : existingImage
          ? { delete: true }
          : undefined,
    },
    include: articleInclude,
  });

  return mapPrismaArticle(updated as Parameters<typeof mapPrismaArticle>[0]);
}

export async function deleteArticles(ids: string[]): Promise<number> {
  if (!ids.length) return 0;
  if (!isDatabaseConfigured()) {
    seedMemoryArticles();
    const before = memory.articles.length;
    memory.articles = memory.articles.filter((a) => !ids.includes(a.id));
    return before - memory.articles.length;
  }
  const result = await getPrisma().article.deleteMany({
    where: { id: { in: ids } },
  });
  return result.count;
}

export async function bulkUpdateArticleStatus(
  ids: string[],
  status: ArticleStatusValue
): Promise<number> {
  if (!ids.length) return 0;
  if (!isDatabaseConfigured()) {
    seedMemoryArticles();
    let count = 0;
    for (const a of memory.articles) {
      if (ids.includes(a.id)) {
        a.status = status;
        if (status === "PUBLISHED" && !a.publishedAt) {
          a.publishedAt = new Date().toISOString();
        }
        a.updatedAt = new Date().toISOString();
        count += 1;
      }
    }
    return count;
  }

  const data: {
    status: ArticleStatusValue;
    publishedAt?: Date;
  } = { status };
  if (status === "PUBLISHED") {
    data.publishedAt = new Date();
  }

  const result = await getPrisma().article.updateMany({
    where: { id: { in: ids } },
    data,
  });
  return result.count;
}

export async function listTagsAdmin(): Promise<TagSummary[]> {
  if (!isDatabaseConfigured()) {
    seedMemoryArticles();
    return [...memory.tags];
  }
  const rows = await getPrisma().tag.findMany({ orderBy: { name: "asc" } });
  return rows.map((r) => ({ id: r.id, name: r.name, slug: r.slug }));
}

/** Public summary — published only. */
export async function listPublishedArticleSummaries(
  params: {
    page?: number;
    pageSize?: number;
    query?: string;
    categoryId?: string;
    topicId?: string;
  } = {}
): Promise<ArticleSummary[]> {
  const result = await listArticlesAdmin({
    ...params,
    status: "PUBLISHED",
  });
  return result.items.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    publishedAt: a.publishedAt,
    readingTimeMin: a.readingTimeMin,
    categoryName: a.categoryName,
    featuredImageUrl: a.featuredImageUrl,
    featured: a.featured,
  }));
}
