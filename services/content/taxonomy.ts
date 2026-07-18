/**
 * Taxonomy Content Service — Categories & Topics (MES-009).
 * Shared layer for Articles (MES-008), Guides (MES-010), AI Tools (MES-012).
 */

import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import type {
  CategoryDetail,
  CategoryListParams,
  CategoryListResult,
  CategoryRecord,
  CategorySummary,
  CategoryWriteInput,
  TaxonomyStatusValue,
  TopicDetail,
  TopicListParams,
  TopicListResult,
  TopicRecord,
  TopicSummary,
  TopicWriteInput,
} from "./types";

function slugify(input: string, fallback = "item"): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 120) || fallback
  );
}

const nowIso = () => new Date().toISOString();

type MemCategory = Omit<
  CategoryRecord,
  "topicCount" | "articleCount" | "guideCount" | "toolCount"
>;
type MemTopic = Omit<
  TopicRecord,
  "articleCount" | "guideCount" | "toolCount" | "categoryName"
> & { categoryName?: string | null };

const memory = {
  categories: [] as MemCategory[],
  topics: [] as MemTopic[],
  seeded: false,
};

function seedTaxonomy() {
  if (memory.seeded) return;
  memory.seeded = true;
  const t = nowIso();
  memory.categories = [
    {
      id: "cat_ai",
      name: "Artificial Intelligence",
      slug: "artificial-intelligence",
      description: "Foundations and applied AI for practitioners.",
      icon: "sparkles",
      accentColor: "#E8940C",
      status: "ACTIVE",
      featured: true,
      displayOrder: 1,
      seoTitle: "Artificial Intelligence | Mendanize",
      seoDescription: "Learn AI concepts with practical depth.",
      focusKeyword: "artificial intelligence",
      canonicalUrl: null,
      imageUrl: null,
      imageAlt: null,
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "cat_web",
      name: "Web Development",
      slug: "web-development",
      description: "Modern web stacks and frameworks.",
      icon: "code",
      accentColor: "#A8A29E",
      status: "ACTIVE",
      featured: false,
      displayOrder: 2,
      seoTitle: null,
      seoDescription: null,
      focusKeyword: null,
      canonicalUrl: null,
      imageUrl: null,
      imageAlt: null,
      createdAt: t,
      updatedAt: t,
    },
  ];
  memory.topics = [
    {
      id: "top_transformers",
      name: "Transformers",
      slug: "transformers",
      description: "Attention, encoder/decoder, and modern LLMs.",
      categoryId: "cat_ai",
      status: "ACTIVE",
      featured: true,
      displayOrder: 1,
      seoTitle: null,
      seoDescription: null,
      focusKeyword: "transformers",
      canonicalUrl: null,
      imageUrl: null,
      imageAlt: null,
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "top_nextjs",
      name: "Next.js",
      slug: "nextjs",
      description: "App Router, RSC, and full-stack React.",
      categoryId: "cat_web",
      status: "ACTIVE",
      featured: false,
      displayOrder: 1,
      seoTitle: null,
      seoDescription: null,
      focusKeyword: "nextjs",
      canonicalUrl: null,
      imageUrl: null,
      imageAlt: null,
      createdAt: t,
      updatedAt: t,
    },
  ];
}

async function uniqueSlug(
  kind: "category" | "topic",
  base: string,
  excludeId?: string
): Promise<string> {
  let slug = slugify(base, kind);
  if (!isDatabaseConfigured()) {
    seedTaxonomy();
    const list = kind === "category" ? memory.categories : memory.topics;
    let n = 0;
    while (list.some((x) => x.slug === slug && x.id !== excludeId)) {
      n += 1;
      slug = `${slugify(base, kind)}-${n}`;
    }
    return slug;
  }

  const prisma = getPrisma();
  let n = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing =
      kind === "category"
        ? await prisma.category.findUnique({ where: { slug } })
        : await prisma.topic.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    n += 1;
    slug = `${slugify(base, kind)}-${n}`;
  }
}

function enrichCategory(cat: MemCategory): CategoryRecord {
  seedTaxonomy();
  return {
    ...cat,
    topicCount: memory.topics.filter((t) => t.categoryId === cat.id).length,
    articleCount: 0,
    guideCount: 0,
    toolCount: 0,
  };
}

function enrichTopic(topic: MemTopic): TopicRecord {
  seedTaxonomy();
  const cat = memory.categories.find((c) => c.id === topic.categoryId);
  return {
    ...topic,
    categoryName: cat?.name ?? topic.categoryName ?? null,
    articleCount: 0,
    guideCount: 0,
    toolCount: 0,
  };
}

function mapCategoryRow(row: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  accentColor: string | null;
  status: TaxonomyStatusValue;
  featured: boolean;
  displayOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  focusKeyword: string | null;
  canonicalUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  image: { url: string; alt: string | null } | null;
  _count: { topics: number; articles: number; guides: number };
}): CategoryRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    icon: row.icon,
    accentColor: row.accentColor,
    status: row.status,
    featured: row.featured,
    displayOrder: row.displayOrder,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    focusKeyword: row.focusKeyword,
    canonicalUrl: row.canonicalUrl,
    imageUrl: row.image?.url ?? null,
    imageAlt: row.image?.alt ?? null,
    topicCount: row._count.topics,
    articleCount: row._count.articles,
    guideCount: row._count.guides,
    toolCount: 0,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapTopicRow(row: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  categoryId: string;
  status: TaxonomyStatusValue;
  featured: boolean;
  displayOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  focusKeyword: string | null;
  canonicalUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  category: { name: string } | null;
  image: { url: string; alt: string | null } | null;
  _count: { articles: number; guides: number };
}): TopicRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    categoryId: row.categoryId,
    categoryName: row.category?.name ?? null,
    status: row.status,
    featured: row.featured,
    displayOrder: row.displayOrder,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    focusKeyword: row.focusKeyword,
    canonicalUrl: row.canonicalUrl,
    imageUrl: row.image?.url ?? null,
    imageAlt: row.image?.alt ?? null,
    articleCount: row._count.articles,
    guideCount: row._count.guides,
    toolCount: 0,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const categoryInclude = {
  image: { select: { url: true, alt: true } },
  _count: { select: { topics: true, articles: true, guides: true } },
} as const;

const topicInclude = {
  category: { select: { name: true } },
  image: { select: { url: true, alt: true } },
  _count: { select: { articles: true, guides: true } },
} as const;

export async function listCategoriesAdmin(
  params: CategoryListParams = {}
): Promise<CategoryListResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));
  const sort = params.sort ?? "displayOrder";
  const sortDir = params.sortDir ?? "asc";

  if (!isDatabaseConfigured()) {
    seedTaxonomy();
    let items = memory.categories.map(enrichCategory);
    if (params.status && params.status !== "ALL") {
      items = items.filter((c) => c.status === params.status);
    }
    if (params.query?.trim()) {
      const q = params.query.trim().toLowerCase();
      items = items.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
      );
    }
    items.sort((a, b) => {
      const av = a[sort];
      const bv = b[sort];
      const dir = sortDir === "asc" ? 1 : -1;
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    const total = items.length;
    const start = (page - 1) * pageSize;
    return {
      items: items.slice(start, start + pageSize),
      total,
      page,
      pageSize,
    };
  }

  const prisma = getPrisma();
  const where: Record<string, unknown> = {};
  if (params.status && params.status !== "ALL") where.status = params.status;
  if (params.query?.trim()) {
    where.OR = [
      { name: { contains: params.query.trim(), mode: "insensitive" } },
      { slug: { contains: params.query.trim(), mode: "insensitive" } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.category.count({ where }),
    prisma.category.findMany({
      where,
      include: categoryInclude,
      orderBy: { [sort]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: rows.map((r) => mapCategoryRow(r as Parameters<typeof mapCategoryRow>[0])),
    total,
    page,
    pageSize,
  };
}

export async function listTopicsAdmin(
  params: TopicListParams = {}
): Promise<TopicListResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));
  const sort = params.sort ?? "displayOrder";
  const sortDir = params.sortDir ?? "asc";

  if (!isDatabaseConfigured()) {
    seedTaxonomy();
    let items = memory.topics.map(enrichTopic);
    if (params.categoryId) {
      items = items.filter((t) => t.categoryId === params.categoryId);
    }
    if (params.status && params.status !== "ALL") {
      items = items.filter((t) => t.status === params.status);
    }
    if (params.query?.trim()) {
      const q = params.query.trim().toLowerCase();
      items = items.filter(
        (t) =>
          t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q)
      );
    }
    items.sort((a, b) => {
      const av = a[sort];
      const bv = b[sort];
      const dir = sortDir === "asc" ? 1 : -1;
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    const total = items.length;
    const start = (page - 1) * pageSize;
    return {
      items: items.slice(start, start + pageSize),
      total,
      page,
      pageSize,
    };
  }

  const prisma = getPrisma();
  const where: Record<string, unknown> = {};
  if (params.categoryId) where.categoryId = params.categoryId;
  if (params.status && params.status !== "ALL") where.status = params.status;
  if (params.query?.trim()) {
    where.OR = [
      { name: { contains: params.query.trim(), mode: "insensitive" } },
      { slug: { contains: params.query.trim(), mode: "insensitive" } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.topic.count({ where }),
    prisma.topic.findMany({
      where,
      include: topicInclude,
      orderBy: { [sort]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: rows.map((r) => mapTopicRow(r as Parameters<typeof mapTopicRow>[0])),
    total,
    page,
    pageSize,
  };
}

/** Compact selects for article/guide/tool editors. */
export async function listCategorySummaries(): Promise<CategorySummary[]> {
  const result = await listCategoriesAdmin({ pageSize: 100, status: "ACTIVE" });
  return result.items.map((c) => ({ id: c.id, name: c.name, slug: c.slug }));
}

export async function listTopicSummaries(
  categoryId?: string
): Promise<TopicSummary[]> {
  const result = await listTopicsAdmin({
    pageSize: 100,
    status: "ACTIVE",
    categoryId,
  });
  return result.items.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    categoryId: t.categoryId,
  }));
}

export async function getCategoryById(
  id: string
): Promise<CategoryRecord | null> {
  if (!isDatabaseConfigured()) {
    seedTaxonomy();
    const found = memory.categories.find((c) => c.id === id);
    return found ? enrichCategory(found) : null;
  }
  const row = await getPrisma().category.findUnique({
    where: { id },
    include: categoryInclude,
  });
  return row
    ? mapCategoryRow(row as Parameters<typeof mapCategoryRow>[0])
    : null;
}

export async function getTopicById(id: string): Promise<TopicRecord | null> {
  if (!isDatabaseConfigured()) {
    seedTaxonomy();
    const found = memory.topics.find((t) => t.id === id);
    return found ? enrichTopic(found) : null;
  }
  const row = await getPrisma().topic.findUnique({
    where: { id },
    include: topicInclude,
  });
  return row ? mapTopicRow(row as Parameters<typeof mapTopicRow>[0]) : null;
}

export async function getCategoryBySlug(
  slug: string
): Promise<CategoryRecord | null> {
  if (!isDatabaseConfigured()) {
    seedTaxonomy();
    const found = memory.categories.find((c) => c.slug === slug);
    return found ? enrichCategory(found) : null;
  }
  const row = await getPrisma().category.findUnique({
    where: { slug },
    include: categoryInclude,
  });
  return row
    ? mapCategoryRow(row as Parameters<typeof mapCategoryRow>[0])
    : null;
}

export async function getTopicBySlug(
  slug: string
): Promise<TopicRecord | null> {
  if (!isDatabaseConfigured()) {
    seedTaxonomy();
    const found = memory.topics.find((t) => t.slug === slug);
    return found ? enrichTopic(found) : null;
  }
  const row = await getPrisma().topic.findUnique({
    where: { slug },
    include: topicInclude,
  });
  return row ? mapTopicRow(row as Parameters<typeof mapTopicRow>[0]) : null;
}

export type TaxonomyDetailOptions = {
  /** When true, only ACTIVE topics and PUBLISHED articles are included. */
  publishedOnly?: boolean;
};

export async function getCategoryDetail(
  id: string,
  options?: TaxonomyDetailOptions
): Promise<CategoryDetail | null> {
  const category = await getCategoryById(id);
  if (!category) return null;
  if (options?.publishedOnly && category.status !== "ACTIVE") return null;

  const topicsResult = await listTopicsAdmin({
    categoryId: id,
    pageSize: 50,
    status: options?.publishedOnly ? "ACTIVE" : "ALL",
  });
  let recentArticles: CategoryDetail["recentArticles"] = [];

  if (isDatabaseConfigured()) {
    const articles = await getPrisma().article.findMany({
      where: {
        categoryId: id,
        ...(options?.publishedOnly ? { status: "PUBLISHED" } : {}),
      },
      orderBy: { updatedAt: "desc" },
      take: 12,
      select: { id: true, title: true, slug: true, status: true },
    });
    recentArticles = articles.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      status: a.status,
    }));
  }

  return {
    ...category,
    topics: topicsResult.items,
    recentArticles,
  };
}

export async function getTopicDetail(
  id: string,
  options?: TaxonomyDetailOptions
): Promise<TopicDetail | null> {
  const topic = await getTopicById(id);
  if (!topic) return null;
  if (options?.publishedOnly && topic.status !== "ACTIVE") return null;

  let recentArticles: TopicDetail["recentArticles"] = [];
  if (isDatabaseConfigured()) {
    const articles = await getPrisma().article.findMany({
      where: {
        topicId: id,
        ...(options?.publishedOnly ? { status: "PUBLISHED" } : {}),
      },
      orderBy: { updatedAt: "desc" },
      take: 12,
      select: { id: true, title: true, slug: true, status: true },
    });
    recentArticles = articles.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      status: a.status,
    }));
  }

  return { ...topic, recentArticles };
}

/** Public category landing — ACTIVE taxonomy with published article summaries only. */
export async function getPublishedCategoryBySlug(
  slug: string
): Promise<CategoryDetail | null> {
  const category = await getCategoryBySlug(slug);
  if (!category || category.status !== "ACTIVE") return null;
  return getCategoryDetail(category.id, { publishedOnly: true });
}

/** Public topic landing — ACTIVE taxonomy with published article summaries only. */
export async function getPublishedTopicBySlug(
  slug: string
): Promise<TopicDetail | null> {
  const topic = await getTopicBySlug(slug);
  if (!topic || topic.status !== "ACTIVE") return null;
  return getTopicDetail(topic.id, { publishedOnly: true });
}

export async function createCategory(
  input: CategoryWriteInput
): Promise<CategoryRecord> {
  const slug = await uniqueSlug("category", input.slug || input.name);
  const status = input.status ?? "ACTIVE";

  if (!isDatabaseConfigured()) {
    seedTaxonomy();
    if (
      memory.categories.some(
        (c) => c.name.toLowerCase() === input.name.toLowerCase()
      )
    ) {
      throw new Error("A category with this name already exists");
    }
    const t = nowIso();
    const record: MemCategory = {
      id: `cat_${Date.now()}`,
      name: input.name,
      slug,
      description: input.description ?? null,
      icon: input.icon ?? null,
      accentColor: input.accentColor ?? null,
      status,
      featured: input.featured ?? false,
      displayOrder: input.displayOrder ?? 0,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      focusKeyword: input.focusKeyword ?? null,
      canonicalUrl: input.canonicalUrl ?? null,
      imageUrl: input.imageUrl ?? null,
      imageAlt: input.imageAlt ?? null,
      createdAt: t,
      updatedAt: t,
    };
    memory.categories.push(record);
    return enrichCategory(record);
  }

  const prisma = getPrisma();
  const created = await prisma.category.create({
    data: {
      name: input.name,
      slug,
      description: input.description ?? null,
      icon: input.icon ?? null,
      accentColor: input.accentColor ?? null,
      status,
      featured: input.featured ?? false,
      displayOrder: input.displayOrder ?? 0,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      focusKeyword: input.focusKeyword ?? null,
      canonicalUrl: input.canonicalUrl ?? null,
      image: input.imageUrl
        ? {
            create: {
              url: input.imageUrl,
              alt: input.imageAlt ?? null,
            },
          }
        : undefined,
    },
    include: categoryInclude,
  });
  return mapCategoryRow(created as Parameters<typeof mapCategoryRow>[0]);
}

export async function updateCategory(
  id: string,
  input: CategoryWriteInput
): Promise<CategoryRecord | null> {
  const existing = await getCategoryById(id);
  if (!existing) return null;
  const slug = await uniqueSlug("category", input.slug || input.name, id);

  if (!isDatabaseConfigured()) {
    seedTaxonomy();
    const idx = memory.categories.findIndex((c) => c.id === id);
    if (idx < 0) return null;
    if (
      memory.categories.some(
        (c) =>
          c.id !== id && c.name.toLowerCase() === input.name.toLowerCase()
      )
    ) {
      throw new Error("A category with this name already exists");
    }
    memory.categories[idx] = {
      ...memory.categories[idx],
      name: input.name,
      slug,
      description: input.description ?? null,
      icon: input.icon ?? null,
      accentColor: input.accentColor ?? null,
      status: input.status ?? existing.status,
      featured: input.featured ?? false,
      displayOrder: input.displayOrder ?? 0,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      focusKeyword: input.focusKeyword ?? null,
      canonicalUrl: input.canonicalUrl ?? null,
      imageUrl: input.imageUrl ?? null,
      imageAlt: input.imageAlt ?? null,
      updatedAt: nowIso(),
    };
    return enrichCategory(memory.categories[idx]);
  }

  const prisma = getPrisma();
  const existingImage = await prisma.categoryImage.findUnique({
    where: { categoryId: id },
  });
  const updated = await prisma.category.update({
    where: { id },
    data: {
      name: input.name,
      slug,
      description: input.description ?? null,
      icon: input.icon ?? null,
      accentColor: input.accentColor ?? null,
      status: input.status ?? existing.status,
      featured: input.featured ?? false,
      displayOrder: input.displayOrder ?? 0,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      focusKeyword: input.focusKeyword ?? null,
      canonicalUrl: input.canonicalUrl ?? null,
      image: input.imageUrl
        ? {
            upsert: {
              create: {
                url: input.imageUrl,
                alt: input.imageAlt ?? null,
              },
              update: {
                url: input.imageUrl,
                alt: input.imageAlt ?? null,
              },
            },
          }
        : existingImage
          ? { delete: true }
          : undefined,
    },
    include: categoryInclude,
  });
  return mapCategoryRow(updated as Parameters<typeof mapCategoryRow>[0]);
}

export async function createTopic(
  input: TopicWriteInput
): Promise<TopicRecord> {
  if (!input.categoryId) {
    throw new Error("Parent category is required — topics cannot be orphaned");
  }
  const parent = await getCategoryById(input.categoryId);
  if (!parent) throw new Error("Parent category not found");

  const slug = await uniqueSlug("topic", input.slug || input.name);
  const status = input.status ?? "ACTIVE";

  if (!isDatabaseConfigured()) {
    seedTaxonomy();
    if (
      memory.topics.some(
        (t) => t.name.toLowerCase() === input.name.toLowerCase()
      )
    ) {
      throw new Error("A topic with this name already exists");
    }
    const t = nowIso();
    const record: MemTopic = {
      id: `top_${Date.now()}`,
      name: input.name,
      slug,
      description: input.description ?? null,
      categoryId: input.categoryId,
      status,
      featured: input.featured ?? false,
      displayOrder: input.displayOrder ?? 0,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      focusKeyword: input.focusKeyword ?? null,
      canonicalUrl: input.canonicalUrl ?? null,
      imageUrl: input.imageUrl ?? null,
      imageAlt: input.imageAlt ?? null,
      createdAt: t,
      updatedAt: t,
    };
    memory.topics.push(record);
    return enrichTopic(record);
  }

  const created = await getPrisma().topic.create({
    data: {
      name: input.name,
      slug,
      description: input.description ?? null,
      categoryId: input.categoryId,
      status,
      featured: input.featured ?? false,
      displayOrder: input.displayOrder ?? 0,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      focusKeyword: input.focusKeyword ?? null,
      canonicalUrl: input.canonicalUrl ?? null,
      image: input.imageUrl
        ? {
            create: {
              url: input.imageUrl,
              alt: input.imageAlt ?? null,
            },
          }
        : undefined,
    },
    include: topicInclude,
  });
  return mapTopicRow(created as Parameters<typeof mapTopicRow>[0]);
}

export async function updateTopic(
  id: string,
  input: TopicWriteInput
): Promise<TopicRecord | null> {
  if (!input.categoryId) {
    throw new Error("Parent category is required — topics cannot be orphaned");
  }
  const existing = await getTopicById(id);
  if (!existing) return null;
  const parent = await getCategoryById(input.categoryId);
  if (!parent) throw new Error("Parent category not found");

  const slug = await uniqueSlug("topic", input.slug || input.name, id);

  if (!isDatabaseConfigured()) {
    seedTaxonomy();
    const idx = memory.topics.findIndex((t) => t.id === id);
    if (idx < 0) return null;
    if (
      memory.topics.some(
        (t) =>
          t.id !== id && t.name.toLowerCase() === input.name.toLowerCase()
      )
    ) {
      throw new Error("A topic with this name already exists");
    }
    memory.topics[idx] = {
      ...memory.topics[idx],
      name: input.name,
      slug,
      description: input.description ?? null,
      categoryId: input.categoryId,
      status: input.status ?? existing.status,
      featured: input.featured ?? false,
      displayOrder: input.displayOrder ?? 0,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      focusKeyword: input.focusKeyword ?? null,
      canonicalUrl: input.canonicalUrl ?? null,
      imageUrl: input.imageUrl ?? null,
      imageAlt: input.imageAlt ?? null,
      updatedAt: nowIso(),
    };
    return enrichTopic(memory.topics[idx]);
  }

  const prisma = getPrisma();
  const existingImage = await prisma.topicImage.findUnique({
    where: { topicId: id },
  });
  const updated = await prisma.topic.update({
    where: { id },
    data: {
      name: input.name,
      slug,
      description: input.description ?? null,
      categoryId: input.categoryId,
      status: input.status ?? existing.status,
      featured: input.featured ?? false,
      displayOrder: input.displayOrder ?? 0,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      focusKeyword: input.focusKeyword ?? null,
      canonicalUrl: input.canonicalUrl ?? null,
      image: input.imageUrl
        ? {
            upsert: {
              create: {
                url: input.imageUrl,
                alt: input.imageAlt ?? null,
              },
              update: {
                url: input.imageUrl,
                alt: input.imageAlt ?? null,
              },
            },
          }
        : existingImage
          ? { delete: true }
          : undefined,
    },
    include: topicInclude,
  });
  return mapTopicRow(updated as Parameters<typeof mapTopicRow>[0]);
}

export async function deleteCategories(ids: string[]): Promise<number> {
  if (!ids.length) return 0;
  if (!isDatabaseConfigured()) {
    seedTaxonomy();
    const blocked = memory.topics.some((t) => ids.includes(t.categoryId));
    if (blocked) {
      throw new Error("Cannot delete categories that still have topics");
    }
    const before = memory.categories.length;
    memory.categories = memory.categories.filter((c) => !ids.includes(c.id));
    return before - memory.categories.length;
  }
  const result = await getPrisma().category.deleteMany({
    where: { id: { in: ids } },
  });
  return result.count;
}

export async function deleteTopics(ids: string[]): Promise<number> {
  if (!ids.length) return 0;
  if (!isDatabaseConfigured()) {
    seedTaxonomy();
    const before = memory.topics.length;
    memory.topics = memory.topics.filter((t) => !ids.includes(t.id));
    return before - memory.topics.length;
  }
  const result = await getPrisma().topic.deleteMany({
    where: { id: { in: ids } },
  });
  return result.count;
}

export async function bulkUpdateCategoryStatus(
  ids: string[],
  status: TaxonomyStatusValue
): Promise<number> {
  if (!ids.length) return 0;
  if (!isDatabaseConfigured()) {
    seedTaxonomy();
    let n = 0;
    for (const c of memory.categories) {
      if (ids.includes(c.id)) {
        c.status = status;
        c.updatedAt = nowIso();
        n += 1;
      }
    }
    return n;
  }
  const result = await getPrisma().category.updateMany({
    where: { id: { in: ids } },
    data: { status },
  });
  return result.count;
}

export async function bulkUpdateTopicStatus(
  ids: string[],
  status: TaxonomyStatusValue
): Promise<number> {
  if (!ids.length) return 0;
  if (!isDatabaseConfigured()) {
    seedTaxonomy();
    let n = 0;
    for (const t of memory.topics) {
      if (ids.includes(t.id)) {
        t.status = status;
        t.updatedAt = nowIso();
        n += 1;
      }
    }
    return n;
  }
  const result = await getPrisma().topic.updateMany({
    where: { id: { in: ids } },
    data: { status },
  });
  return result.count;
}
