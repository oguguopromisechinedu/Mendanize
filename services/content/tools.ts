/**
 * AI Tools Content Service — MES-012 Discover directory.
 */

import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { getCategoryById, getTopicById } from "./taxonomy";
import type {
  ToolAvailabilityValue,
  ToolDifficultyValue,
  ToolFeatureKindValue,
  ToolFeatureRecord,
  ToolImageKindValue,
  ToolImageRecord,
  ToolListParams,
  ToolListResult,
  ToolPricingValue,
  ToolRecord,
  ToolStatusValue,
  ToolSummary,
  ToolWriteInput,
} from "./types";

function slugify(input: string, fallback = "tool"): string {
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

const memory = {
  tools: [] as ToolRecord[],
  seeded: false,
};

function seedTools() {
  if (memory.seeded) return;
  memory.seeded = true;
  const t = nowIso();
  memory.tools = [
    {
      id: "tool_seed_1",
      name: "Claude",
      slug: "claude",
      shortDescription: "Anthropic’s assistant for deep reasoning and writing.",
      fullDescription:
        "<p>Use Claude for long-context reading, drafting, and careful analysis.</p>",
      websiteUrl: "https://claude.ai",
      developer: "Anthropic",
      platforms: ["Web", "API"],
      availability: "AVAILABLE",
      pricing: "FREEMIUM",
      difficulty: "BEGINNER",
      recommendedFor: ["Writers", "Researchers"],
      learningOutcomes: ["Prompt for structured drafts", "Critique sources"],
      relatedArticleIds: [],
      relatedGuideIds: [],
      relatedToolIds: [],
      demoVideoUrl: null,
      featured: true,
      status: "PUBLISHED",
      publishedAt: t,
      seoTitle: "Claude AI tool | Mendanize",
      seoDescription: "Learn Claude as an educational AI tool.",
      focusKeyword: "claude",
      canonicalUrl: null,
      categoryIds: ["cat_ai"],
      categoryNames: ["Artificial Intelligence"],
      topicIds: ["top_transformers"],
      topicNames: ["Transformers"],
      tagNames: ["LLM", "Writing"],
      features: [
        {
          id: "tf1",
          label: "Long context windows",
          kind: "FEATURE",
          sortOrder: 0,
        },
        {
          id: "tf2",
          label: "Drafting essays",
          kind: "USE_CASE",
          sortOrder: 0,
        },
        {
          id: "tf3",
          label: "Careful instruction following",
          kind: "ADVANTAGE",
          sortOrder: 0,
        },
        {
          id: "tf4",
          label: "No native image generation",
          kind: "LIMITATION",
          sortOrder: 0,
        },
      ],
      images: [],
      logoUrl: null,
      coverUrl: null,
      createdAt: t,
      updatedAt: t,
    },
  ];
}

async function uniqueToolSlug(base: string, excludeId?: string) {
  let slug = slugify(base);
  if (!isDatabaseConfigured()) {
    seedTools();
    let n = 0;
    while (memory.tools.some((t) => t.slug === slug && t.id !== excludeId)) {
      n += 1;
      slug = `${slugify(base)}-${n}`;
    }
    return slug;
  }
  const prisma = getPrisma();
  let n = 0;
  while (true) {
    const existing = await prisma.tool.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    n += 1;
    slug = `${slugify(base)}-${n}`;
  }
}

async function resolveTagIds(names: string[]): Promise<string[]> {
  const cleaned = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
  if (!cleaned.length) return [];
  if (!isDatabaseConfigured()) return cleaned.map((n) => `tag_${slugify(n)}`);

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

function deriveImages(input: ToolWriteInput): ToolImageRecord[] {
  const images: ToolImageRecord[] = [...(input.images ?? [])].map((img, i) => ({
    id: img.id || `timg_${i}`,
    url: img.url,
    alt: img.alt ?? null,
    kind: img.kind,
    sortOrder: img.sortOrder ?? i,
  }));
  if (input.logoUrl) {
    images.push({
      id: "logo",
      url: input.logoUrl,
      alt: null,
      kind: "LOGO",
      sortOrder: 0,
    });
  }
  if (input.coverUrl) {
    images.push({
      id: "cover",
      url: input.coverUrl,
      alt: null,
      kind: "COVER",
      sortOrder: 0,
    });
  }
  (input.screenshotUrls ?? []).forEach((url, i) => {
    images.push({
      id: `shot_${i}`,
      url,
      alt: null,
      kind: "SCREENSHOT",
      sortOrder: i,
    });
  });
  return images;
}

function featuresFromInput(
  features: ToolWriteInput["features"] = []
): ToolFeatureRecord[] {
  return (features ?? []).map((f, i) => ({
    id: f.id || `tfeat_${i}`,
    label: f.label,
    kind: f.kind,
    sortOrder: f.sortOrder ?? i,
  }));
}

function logoCover(images: ToolImageRecord[]) {
  return {
    logoUrl: images.find((i) => i.kind === "LOGO")?.url ?? null,
    coverUrl: images.find((i) => i.kind === "COVER")?.url ?? null,
  };
}

function mapToolRow(row: {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  fullDescription: string | null;
  websiteUrl: string | null;
  developer: string | null;
  platforms: string[];
  availability: ToolAvailabilityValue;
  pricing: ToolPricingValue;
  difficulty: ToolDifficultyValue;
  recommendedFor: string[];
  learningOutcomes: string[];
  relatedArticleIds: string[];
  relatedGuideIds: string[];
  relatedToolIds: string[];
  demoVideoUrl: string | null;
  featured: boolean;
  status: ToolStatusValue;
  publishedAt: Date | null;
  seoTitle: string | null;
  seoDescription: string | null;
  focusKeyword: string | null;
  canonicalUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  categories: Array<{ category: { id: string; name: string } }>;
  topics: Array<{ topic: { id: string; name: string } }>;
  tags: Array<{ tag: { name: string } }>;
  features: Array<{
    id: string;
    label: string;
    kind: ToolFeatureKindValue;
    sortOrder: number;
  }>;
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
    kind: ToolImageKindValue;
    sortOrder: number;
  }>;
}): ToolRecord {
  const images = [...row.images].sort((a, b) => a.sortOrder - b.sortOrder);
  const lc = logoCover(images);
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    shortDescription: row.shortDescription,
    fullDescription: row.fullDescription,
    websiteUrl: row.websiteUrl,
    developer: row.developer,
    platforms: row.platforms,
    availability: row.availability,
    pricing: row.pricing,
    difficulty: row.difficulty,
    recommendedFor: row.recommendedFor,
    learningOutcomes: row.learningOutcomes,
    relatedArticleIds: row.relatedArticleIds,
    relatedGuideIds: row.relatedGuideIds,
    relatedToolIds: row.relatedToolIds,
    demoVideoUrl: row.demoVideoUrl,
    featured: row.featured,
    status: row.status,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    focusKeyword: row.focusKeyword,
    canonicalUrl: row.canonicalUrl,
    categoryIds: row.categories.map((c) => c.category.id),
    categoryNames: row.categories.map((c) => c.category.name),
    topicIds: row.topics.map((t) => t.topic.id),
    topicNames: row.topics.map((t) => t.topic.name),
    tagNames: row.tags.map((t) => t.tag.name),
    features: [...row.features].sort((a, b) => a.sortOrder - b.sortOrder),
    images,
    ...lc,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const toolInclude = {
  categories: { include: { category: { select: { id: true, name: true } } } },
  topics: { include: { topic: { select: { id: true, name: true } } } },
  tags: { include: { tag: { select: { name: true } } } },
  features: true,
  images: true,
} as const;

export async function listToolsAdmin(
  params: ToolListParams = {}
): Promise<ToolListResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));
  const sort = params.sort ?? "updatedAt";
  const sortDir = params.sortDir ?? "desc";

  if (!isDatabaseConfigured()) {
    seedTools();
    let items = [...memory.tools];
    if (params.status && params.status !== "ALL") {
      items = items.filter((t) => t.status === params.status);
    }
    if (params.pricing && params.pricing !== "ALL") {
      items = items.filter((t) => t.pricing === params.pricing);
    }
    if (params.difficulty && params.difficulty !== "ALL") {
      items = items.filter((t) => t.difficulty === params.difficulty);
    }
    if (params.platform?.trim()) {
      const p = params.platform.trim().toLowerCase();
      items = items.filter((t) =>
        t.platforms.some((x) => x.toLowerCase() === p)
      );
    }
    if (params.categoryId) {
      items = items.filter((t) => t.categoryIds.includes(params.categoryId!));
    }
    if (params.topicId) {
      items = items.filter((t) => t.topicIds.includes(params.topicId!));
    }
    if (typeof params.featured === "boolean") {
      items = items.filter((t) => t.featured === params.featured);
    }
    if (params.query?.trim()) {
      const q = params.query.trim().toLowerCase();
      items = items.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          (t.developer ?? "").toLowerCase().includes(q) ||
          (t.shortDescription ?? "").toLowerCase().includes(q)
      );
    }
    items.sort((a, b) => {
      const sortKey = sort === "publishedAt" ? "publishedAt" : sort;
      const av = (a[sortKey as keyof typeof a] as string | null) ?? "";
      const bv = (b[sortKey as keyof typeof b] as string | null) ?? "";
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
  if (params.pricing && params.pricing !== "ALL") where.pricing = params.pricing;
  if (params.difficulty && params.difficulty !== "ALL") {
    where.difficulty = params.difficulty;
  }
  if (params.platform?.trim()) {
    where.platforms = { has: params.platform.trim() };
  }
  if (typeof params.featured === "boolean") where.featured = params.featured;
  if (params.categoryId) {
    where.categories = { some: { categoryId: params.categoryId } };
  }
  if (params.topicId) {
    where.topics = { some: { topicId: params.topicId } };
  }
  if (params.query?.trim()) {
    where.OR = [
      { name: { contains: params.query.trim(), mode: "insensitive" } },
      { slug: { contains: params.query.trim(), mode: "insensitive" } },
      { developer: { contains: params.query.trim(), mode: "insensitive" } },
      {
        shortDescription: {
          contains: params.query.trim(),
          mode: "insensitive",
        },
      },
    ];
  }

  const orderField =
    sort === "publishedAt"
      ? "publishedAt"
      : sort === "name"
        ? "name"
        : sort === "pricing"
          ? "pricing"
          : "updatedAt";

  const [total, rows] = await Promise.all([
    prisma.tool.count({ where }),
    prisma.tool.findMany({
      where,
      include: toolInclude,
      orderBy: { [orderField]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: rows.map((r) => mapToolRow(r as Parameters<typeof mapToolRow>[0])),
    total,
    page,
    pageSize,
  };
}

export async function getToolById(id: string): Promise<ToolRecord | null> {
  if (!isDatabaseConfigured()) {
    seedTools();
    return memory.tools.find((t) => t.id === id) ?? null;
  }
  const row = await getPrisma().tool.findUnique({
    where: { id },
    include: toolInclude,
  });
  return row ? mapToolRow(row as Parameters<typeof mapToolRow>[0]) : null;
}

export async function getToolBySlugAdmin(
  slug: string
): Promise<ToolRecord | null> {
  if (!isDatabaseConfigured()) {
    seedTools();
    return memory.tools.find((t) => t.slug === slug) ?? null;
  }
  const row = await getPrisma().tool.findUnique({
    where: { slug },
    include: toolInclude,
  });
  return row ? mapToolRow(row as Parameters<typeof mapToolRow>[0]) : null;
}

async function resolveNames(categoryIds: string[], topicIds: string[]) {
  const categoryNames: string[] = [];
  const topicNames: string[] = [];
  for (const id of categoryIds) {
    const c = await getCategoryById(id);
    if (c) categoryNames.push(c.name);
  }
  for (const id of topicIds) {
    const t = await getTopicById(id);
    if (t) topicNames.push(t.name);
  }
  return { categoryNames, topicNames };
}

export async function createTool(input: ToolWriteInput): Promise<ToolRecord> {
  const slug = await uniqueToolSlug(input.slug || input.name);
  const status = input.status ?? "DRAFT";
  const publishedAt =
    status === "PUBLISHED"
      ? input.publishedAt
        ? new Date(input.publishedAt)
        : new Date()
      : input.publishedAt
        ? new Date(input.publishedAt)
        : null;
  const categoryIds = input.categoryIds ?? [];
  const topicIds = input.topicIds ?? [];
  const features = featuresFromInput(input.features);
  const images = deriveImages(input);
  const { categoryNames, topicNames } = await resolveNames(
    categoryIds,
    topicIds
  );
  const lc = logoCover(images);

  if (!isDatabaseConfigured()) {
    seedTools();
    const t = nowIso();
    const record: ToolRecord = {
      id: `tool_${Date.now()}`,
      name: input.name,
      slug,
      shortDescription: input.shortDescription ?? null,
      fullDescription: input.fullDescription ?? null,
      websiteUrl: input.websiteUrl ?? null,
      developer: input.developer ?? null,
      platforms: input.platforms ?? [],
      availability: input.availability ?? "AVAILABLE",
      pricing: input.pricing ?? "FREEMIUM",
      difficulty: input.difficulty ?? "BEGINNER",
      recommendedFor: input.recommendedFor ?? [],
      learningOutcomes: input.learningOutcomes ?? [],
      relatedArticleIds: input.relatedArticleIds ?? [],
      relatedGuideIds: input.relatedGuideIds ?? [],
      relatedToolIds: input.relatedToolIds ?? [],
      demoVideoUrl: input.demoVideoUrl ?? null,
      featured: input.featured ?? false,
      status,
      publishedAt: publishedAt?.toISOString() ?? null,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      focusKeyword: input.focusKeyword ?? null,
      canonicalUrl: input.canonicalUrl ?? null,
      categoryIds,
      categoryNames,
      topicIds,
      topicNames,
      tagNames: input.tagNames ?? [],
      features,
      images,
      ...lc,
      createdAt: t,
      updatedAt: t,
    };
    memory.tools.unshift(record);
    return record;
  }

  const prisma = getPrisma();
  const tagIds = await resolveTagIds(input.tagNames ?? []);
  const created = await prisma.tool.create({
    data: {
      name: input.name,
      slug,
      shortDescription: input.shortDescription ?? null,
      fullDescription: input.fullDescription ?? null,
      websiteUrl: input.websiteUrl ?? null,
      developer: input.developer ?? null,
      platforms: input.platforms ?? [],
      availability: input.availability ?? "AVAILABLE",
      pricing: input.pricing ?? "FREEMIUM",
      difficulty: input.difficulty ?? "BEGINNER",
      recommendedFor: input.recommendedFor ?? [],
      learningOutcomes: input.learningOutcomes ?? [],
      relatedArticleIds: input.relatedArticleIds ?? [],
      relatedGuideIds: input.relatedGuideIds ?? [],
      relatedToolIds: input.relatedToolIds ?? [],
      demoVideoUrl: input.demoVideoUrl ?? null,
      featured: input.featured ?? false,
      status,
      publishedAt,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      focusKeyword: input.focusKeyword ?? null,
      canonicalUrl: input.canonicalUrl ?? null,
      categories: categoryIds.length
        ? { create: categoryIds.map((categoryId) => ({ categoryId })) }
        : undefined,
      topics: topicIds.length
        ? { create: topicIds.map((topicId) => ({ topicId })) }
        : undefined,
      tags: tagIds.length
        ? { create: tagIds.map((tagId) => ({ tagId })) }
        : undefined,
      features: features.length
        ? {
            create: features.map((f) => ({
              label: f.label,
              kind: f.kind,
              sortOrder: f.sortOrder,
            })),
          }
        : undefined,
      images: images.length
        ? {
            create: images.map((img) => ({
              url: img.url,
              alt: img.alt,
              kind: img.kind,
              sortOrder: img.sortOrder,
            })),
          }
        : undefined,
    },
    include: toolInclude,
  });

  return mapToolRow(created as Parameters<typeof mapToolRow>[0]);
}

export async function updateTool(
  id: string,
  input: ToolWriteInput
): Promise<ToolRecord | null> {
  const existing = await getToolById(id);
  if (!existing) return null;

  const slug = await uniqueToolSlug(input.slug || input.name, id);
  const status = input.status ?? existing.status;
  let publishedAt = existing.publishedAt
    ? new Date(existing.publishedAt)
    : null;
  if (status === "PUBLISHED" && !publishedAt) {
    publishedAt = input.publishedAt ? new Date(input.publishedAt) : new Date();
  } else if (input.publishedAt) {
    publishedAt = new Date(input.publishedAt);
  }

  const categoryIds = input.categoryIds ?? existing.categoryIds;
  const topicIds = input.topicIds ?? existing.topicIds;
  const features = featuresFromInput(input.features ?? existing.features);
  const images =
    input.images || input.logoUrl || input.coverUrl || input.screenshotUrls
      ? deriveImages(input)
      : existing.images;
  const { categoryNames, topicNames } = await resolveNames(
    categoryIds,
    topicIds
  );
  const lc = logoCover(images);

  if (!isDatabaseConfigured()) {
    seedTools();
    const idx = memory.tools.findIndex((t) => t.id === id);
    if (idx < 0) return null;
    memory.tools[idx] = {
      ...memory.tools[idx],
      name: input.name,
      slug,
      shortDescription: input.shortDescription ?? null,
      fullDescription: input.fullDescription ?? null,
      websiteUrl: input.websiteUrl ?? null,
      developer: input.developer ?? null,
      platforms: input.platforms ?? [],
      availability: input.availability ?? existing.availability,
      pricing: input.pricing ?? existing.pricing,
      difficulty: input.difficulty ?? existing.difficulty,
      recommendedFor: input.recommendedFor ?? [],
      learningOutcomes: input.learningOutcomes ?? [],
      relatedArticleIds: input.relatedArticleIds ?? [],
      relatedGuideIds: input.relatedGuideIds ?? [],
      relatedToolIds: input.relatedToolIds ?? [],
      demoVideoUrl: input.demoVideoUrl ?? null,
      featured: input.featured ?? false,
      status,
      publishedAt: publishedAt?.toISOString() ?? null,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      focusKeyword: input.focusKeyword ?? null,
      canonicalUrl: input.canonicalUrl ?? null,
      categoryIds,
      categoryNames,
      topicIds,
      topicNames,
      tagNames: input.tagNames ?? existing.tagNames,
      features,
      images,
      ...lc,
      updatedAt: nowIso(),
    };
    return memory.tools[idx];
  }

  const prisma = getPrisma();
  const tagIds = await resolveTagIds(input.tagNames ?? existing.tagNames);

  await prisma.toolCategoryRelation.deleteMany({ where: { toolId: id } });
  await prisma.toolTopicRelation.deleteMany({ where: { toolId: id } });
  await prisma.toolTag.deleteMany({ where: { toolId: id } });
  await prisma.toolFeature.deleteMany({ where: { toolId: id } });
  await prisma.toolImage.deleteMany({ where: { toolId: id } });

  const updated = await prisma.tool.update({
    where: { id },
    data: {
      name: input.name,
      slug,
      shortDescription: input.shortDescription ?? null,
      fullDescription: input.fullDescription ?? null,
      websiteUrl: input.websiteUrl ?? null,
      developer: input.developer ?? null,
      platforms: input.platforms ?? [],
      availability: input.availability ?? existing.availability,
      pricing: input.pricing ?? existing.pricing,
      difficulty: input.difficulty ?? existing.difficulty,
      recommendedFor: input.recommendedFor ?? [],
      learningOutcomes: input.learningOutcomes ?? [],
      relatedArticleIds: input.relatedArticleIds ?? [],
      relatedGuideIds: input.relatedGuideIds ?? [],
      relatedToolIds: input.relatedToolIds ?? [],
      demoVideoUrl: input.demoVideoUrl ?? null,
      featured: input.featured ?? false,
      status,
      publishedAt,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      focusKeyword: input.focusKeyword ?? null,
      canonicalUrl: input.canonicalUrl ?? null,
      categories: categoryIds.length
        ? { create: categoryIds.map((categoryId) => ({ categoryId })) }
        : undefined,
      topics: topicIds.length
        ? { create: topicIds.map((topicId) => ({ topicId })) }
        : undefined,
      tags: tagIds.length
        ? { create: tagIds.map((tagId) => ({ tagId })) }
        : undefined,
      features: features.length
        ? {
            create: features.map((f) => ({
              label: f.label,
              kind: f.kind,
              sortOrder: f.sortOrder,
            })),
          }
        : undefined,
      images: images.length
        ? {
            create: images.map((img) => ({
              url: img.url,
              alt: img.alt,
              kind: img.kind,
              sortOrder: img.sortOrder,
            })),
          }
        : undefined,
    },
    include: toolInclude,
  });

  return mapToolRow(updated as Parameters<typeof mapToolRow>[0]);
}

export async function deleteTools(ids: string[]): Promise<number> {
  if (!ids.length) return 0;
  if (!isDatabaseConfigured()) {
    seedTools();
    const before = memory.tools.length;
    memory.tools = memory.tools.filter((t) => !ids.includes(t.id));
    return before - memory.tools.length;
  }
  const result = await getPrisma().tool.deleteMany({
    where: { id: { in: ids } },
  });
  return result.count;
}

export async function bulkUpdateToolStatus(
  ids: string[],
  status: ToolStatusValue
): Promise<number> {
  if (!ids.length) return 0;
  if (!isDatabaseConfigured()) {
    seedTools();
    let n = 0;
    for (const t of memory.tools) {
      if (ids.includes(t.id)) {
        t.status = status;
        if (status === "PUBLISHED" && !t.publishedAt) {
          t.publishedAt = nowIso();
        }
        t.updatedAt = nowIso();
        n += 1;
      }
    }
    return n;
  }
  const data: { status: ToolStatusValue; publishedAt?: Date } = { status };
  if (status === "PUBLISHED") data.publishedAt = new Date();
  const result = await getPrisma().tool.updateMany({
    where: { id: { in: ids } },
    data,
  });
  return result.count;
}

export async function listPublishedToolSummaries(
  params: ToolListParams = {}
): Promise<ToolSummary[]> {
  const result = await listToolsAdmin({
    ...params,
    status: "PUBLISHED",
  });
  return result.items.map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    description: t.shortDescription,
    pricing: t.pricing,
    difficulty: t.difficulty,
    logoUrl: t.logoUrl,
    featured: t.featured,
    categoryNames: t.categoryNames,
    topicNames: t.topicNames,
    platforms: t.platforms,
    publishedAt: t.publishedAt,
  }));
}

/** Full published tools for the public directory (MES-027). */
export async function listPublishedTools(
  params: ToolListParams = {}
): Promise<ToolListResult> {
  return listToolsAdmin({
    ...params,
    status: "PUBLISHED",
  });
}
