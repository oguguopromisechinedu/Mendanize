/**
 * Learning Guides Content Service — MES-010.
 */

import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { estimateReadingTimeMin } from "./reading-time";
import { getCategoryById, getTopicById } from "./taxonomy";
import type {
  GuideDifficultyValue,
  GuideLessonRecord,
  GuideListParams,
  GuideListResult,
  GuideRecord,
  GuideSectionRecord,
  GuideStatusValue,
  GuideSummary,
  GuideWriteInput,
} from "./types";

function slugify(input: string, fallback = "guide"): string {
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
  guides: [] as GuideRecord[],
  seeded: false,
};

function seedGuides() {
  if (memory.seeded) return;
  memory.seeded = true;
  const t = nowIso();
  memory.guides = [
    {
      id: "guide_seed_1",
      title: "Transformers from zero",
      slug: "transformers-from-zero",
      shortDescription: "A structured path through attention and modern LLMs.",
      fullDescription:
        "<p>Learn transformers step by step with practical checkpoints.</p>",
      coverImageUrl: null,
      coverImageAlt: null,
      status: "PUBLISHED",
      difficulty: "BEGINNER",
      estimatedMinutes: 120,
      learningObjectives: [
        "Explain self-attention",
        "Sketch an encoder-decoder",
      ],
      prerequisites: ["Basic Python"],
      featured: true,
      authorId: "seed-author",
      authorName: "Editorial",
      categoryId: "cat_ai",
      categoryName: "Artificial Intelligence",
      categorySlug: "artificial-intelligence",
      topicId: "top_transformers",
      topicName: "Transformers",
      topicSlug: "transformers",
      publishedAt: t,
      scheduledAt: null,
      seoTitle: "Transformers from zero | Mendanize",
      seoDescription: "A beginner learning guide to transformers.",
      focusKeyword: "transformers guide",
      canonicalUrl: null,
      sectionCount: 1,
      lessonCount: 2,
      sections: [
        {
          id: "gsec_1",
          guideId: "guide_seed_1",
          title: "Foundations",
          slug: "foundations",
          description: "Core ideas",
          sortOrder: 0,
          lessons: [
            {
              id: "gless_1",
              sectionId: "gsec_1",
              title: "Why attention",
              slug: "why-attention",
              content: "<p>Attention lets models weigh token relationships.</p>",
              readingTimeMin: 4,
              featuredImageUrl: null,
              featuredImageAlt: null,
              videoUrl: null,
              codeExample: null,
              resourceUrl: null,
              articleId: null,
              aiToolId: null,
              sortOrder: 0,
            },
            {
              id: "gless_2",
              sectionId: "gsec_1",
              title: "Encoder overview",
              slug: "encoder-overview",
              content: "<p>Encoders build contextual representations.</p>",
              readingTimeMin: 5,
              featuredImageUrl: null,
              featuredImageAlt: null,
              videoUrl: null,
              codeExample: "def attend(q, k, v):\n  return softmax(q @ k.T) @ v",
              resourceUrl: null,
              articleId: null,
              aiToolId: null,
              sortOrder: 1,
            },
          ],
        },
      ],
      createdAt: t,
      updatedAt: t,
    },
  ];
}

async function uniqueGuideSlug(base: string, excludeId?: string) {
  let slug = slugify(base);
  if (!isDatabaseConfigured()) {
    seedGuides();
    let n = 0;
    while (memory.guides.some((g) => g.slug === slug && g.id !== excludeId)) {
      n += 1;
      slug = `${slugify(base)}-${n}`;
    }
    return slug;
  }
  const prisma = getPrisma();
  let n = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.guide.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    n += 1;
    slug = `${slugify(base)}-${n}`;
  }
}

function normalizeSections(
  guideId: string,
  sections: GuideWriteInput["sections"] = []
): GuideSectionRecord[] {
  return (sections ?? []).map((section, sIdx) => {
    const sectionId = section.id || `gsec_${Date.now()}_${sIdx}`;
    const sectionSlug = slugify(section.slug || section.title, `section-${sIdx + 1}`);
    const lessons: GuideLessonRecord[] = (section.lessons ?? []).map(
      (lesson, lIdx) => {
        const content = lesson.content ?? "<p></p>";
        return {
          id: lesson.id || `gless_${Date.now()}_${sIdx}_${lIdx}`,
          sectionId,
          title: lesson.title,
          slug: slugify(lesson.slug || lesson.title, `lesson-${lIdx + 1}`),
          content,
          readingTimeMin:
            lesson.readingTimeMin ?? estimateReadingTimeMin(content),
          featuredImageUrl: lesson.featuredImageUrl ?? null,
          featuredImageAlt: lesson.featuredImageAlt ?? null,
          videoUrl: lesson.videoUrl ?? null,
          codeExample: lesson.codeExample ?? null,
          resourceUrl: lesson.resourceUrl ?? null,
          articleId: lesson.articleId ?? null,
          aiToolId: lesson.aiToolId ?? null,
          sortOrder: lesson.sortOrder ?? lIdx,
        };
      }
    );
    return {
      id: sectionId,
      guideId,
      title: section.title,
      slug: sectionSlug,
      description: section.description ?? null,
      sortOrder: section.sortOrder ?? sIdx,
      lessons: lessons.sort((a, b) => a.sortOrder - b.sortOrder),
    };
  }).sort((a, b) => a.sortOrder - b.sortOrder);
}

function counts(sections: GuideSectionRecord[]) {
  return {
    sectionCount: sections.length,
    lessonCount: sections.reduce((n, s) => n + s.lessons.length, 0),
  };
}

function mapGuideRow(row: {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  fullDescription: string | null;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  status: GuideStatusValue;
  difficulty: GuideDifficultyValue;
  estimatedMinutes: number;
  learningObjectives: string[];
  prerequisites: string[];
  featured: boolean;
  authorId: string;
  categoryId: string | null;
  topicId: string;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  seoTitle: string | null;
  seoDescription: string | null;
  focusKeyword: string | null;
  canonicalUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: { name: string | null };
  category: { name: string; slug: string } | null;
  topic: { name: string; slug: string };
  sections: Array<{
    id: string;
    guideId: string;
    title: string;
    slug: string;
    description: string | null;
    sortOrder: number;
    lessons: Array<{
      id: string;
      sectionId: string;
      title: string;
      slug: string;
      content: string;
      readingTimeMin: number;
      featuredImageUrl: string | null;
      featuredImageAlt: string | null;
      videoUrl: string | null;
      codeExample: string | null;
      resourceUrl: string | null;
      articleId: string | null;
      aiToolId: string | null;
      sortOrder: number;
    }>;
  }>;
}): GuideRecord {
  const sections = row.sections
    .map((s) => ({
      ...s,
      lessons: [...s.lessons].sort((a, b) => a.sortOrder - b.sortOrder),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const c = counts(sections);
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    shortDescription: row.shortDescription,
    fullDescription: row.fullDescription,
    coverImageUrl: row.coverImageUrl,
    coverImageAlt: row.coverImageAlt,
    status: row.status,
    difficulty: row.difficulty,
    estimatedMinutes: row.estimatedMinutes,
    learningObjectives: row.learningObjectives,
    prerequisites: row.prerequisites,
    featured: row.featured,
    authorId: row.authorId,
    authorName: row.author.name,
    categoryId: row.categoryId,
    categoryName: row.category?.name ?? null,
    categorySlug: row.category?.slug ?? null,
    topicId: row.topicId,
    topicName: row.topic.name,
    topicSlug: row.topic.slug,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    scheduledAt: row.scheduledAt?.toISOString() ?? null,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    focusKeyword: row.focusKeyword,
    canonicalUrl: row.canonicalUrl,
    ...c,
    sections,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const guideInclude = {
  author: { select: { name: true } },
  category: { select: { name: true, slug: true } },
  topic: { select: { name: true, slug: true } },
  sections: {
    orderBy: { sortOrder: "asc" as const },
    include: {
      lessons: { orderBy: { sortOrder: "asc" as const } },
    },
  },
};

export async function listGuidesAdmin(
  params: GuideListParams = {}
): Promise<GuideListResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));
  const sort = params.sort ?? "updatedAt";
  const sortDir = params.sortDir ?? "desc";

  if (!isDatabaseConfigured()) {
    seedGuides();
    let items = [...memory.guides];
    if (params.status && params.status !== "ALL") {
      items = items.filter((g) => g.status === params.status);
    }
    if (params.difficulty && params.difficulty !== "ALL") {
      items = items.filter((g) => g.difficulty === params.difficulty);
    }
    if (params.categoryId) {
      items = items.filter((g) => g.categoryId === params.categoryId);
    }
    if (params.topicId) {
      items = items.filter((g) => g.topicId === params.topicId);
    }
    if (params.query?.trim()) {
      const q = params.query.trim().toLowerCase();
      items = items.filter(
        (g) =>
          g.title.toLowerCase().includes(q) || g.slug.toLowerCase().includes(q)
      );
    }
    items.sort((a, b) => {
      const av = a[sort] ?? "";
      const bv = b[sort] ?? "";
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
  if (params.difficulty && params.difficulty !== "ALL") {
    where.difficulty = params.difficulty;
  }
  if (params.categoryId) where.categoryId = params.categoryId;
  if (params.topicId) where.topicId = params.topicId;
  if (params.query?.trim()) {
    where.OR = [
      { title: { contains: params.query.trim(), mode: "insensitive" } },
      { slug: { contains: params.query.trim(), mode: "insensitive" } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.guide.count({ where }),
    prisma.guide.findMany({
      where,
      include: guideInclude,
      orderBy: { [sort]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: rows.map((r) => mapGuideRow(r as Parameters<typeof mapGuideRow>[0])),
    total,
    page,
    pageSize,
  };
}

export async function getGuideById(id: string): Promise<GuideRecord | null> {
  if (!isDatabaseConfigured()) {
    seedGuides();
    return memory.guides.find((g) => g.id === id) ?? null;
  }
  const row = await getPrisma().guide.findUnique({
    where: { id },
    include: guideInclude,
  });
  return row ? mapGuideRow(row as Parameters<typeof mapGuideRow>[0]) : null;
}

export async function createGuide(
  input: GuideWriteInput
): Promise<GuideRecord> {
  const topic = await getTopicById(input.topicId);
  if (!topic) throw new Error("Topic is required — guides must attach to a topic");

  const categoryId = input.categoryId || topic.categoryId;
  const category = categoryId ? await getCategoryById(categoryId) : null;
  const slug = await uniqueGuideSlug(input.slug || input.title);
  const status = input.status ?? "DRAFT";
  const publishedAt =
    status === "PUBLISHED"
      ? input.publishedAt
        ? new Date(input.publishedAt)
        : new Date()
      : input.publishedAt
        ? new Date(input.publishedAt)
        : null;

  if (!isDatabaseConfigured()) {
    seedGuides();
    const id = `guide_${Date.now()}`;
    const sections = normalizeSections(id, input.sections);
    const c = counts(sections);
    const t = nowIso();
    const record: GuideRecord = {
      id,
      title: input.title,
      slug,
      shortDescription: input.shortDescription ?? null,
      fullDescription: input.fullDescription ?? null,
      coverImageUrl: input.coverImageUrl ?? null,
      coverImageAlt: input.coverImageAlt ?? null,
      status,
      difficulty: input.difficulty ?? "BEGINNER",
      estimatedMinutes: input.estimatedMinutes ?? 30,
      learningObjectives: input.learningObjectives ?? [],
      prerequisites: input.prerequisites ?? [],
      featured: input.featured ?? false,
      authorId: input.authorId,
      authorName: "You",
      categoryId: categoryId ?? null,
      categoryName: category?.name ?? null,
      categorySlug: category?.slug ?? null,
      topicId: input.topicId,
      topicName: topic.name,
      topicSlug: topic.slug,
      publishedAt: publishedAt?.toISOString() ?? null,
      scheduledAt: input.scheduledAt ?? null,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      focusKeyword: input.focusKeyword ?? null,
      canonicalUrl: input.canonicalUrl ?? null,
      ...c,
      sections,
      createdAt: t,
      updatedAt: t,
    };
    memory.guides.unshift(record);
    return record;
  }

  const prisma = getPrisma();
  const created = await prisma.guide.create({
    data: {
      title: input.title,
      slug,
      shortDescription: input.shortDescription ?? null,
      fullDescription: input.fullDescription ?? null,
      coverImageUrl: input.coverImageUrl ?? null,
      coverImageAlt: input.coverImageAlt ?? null,
      status,
      difficulty: input.difficulty ?? "BEGINNER",
      estimatedMinutes: input.estimatedMinutes ?? 30,
      learningObjectives: input.learningObjectives ?? [],
      prerequisites: input.prerequisites ?? [],
      featured: input.featured ?? false,
      authorId: input.authorId,
      categoryId: categoryId || null,
      topicId: input.topicId,
      publishedAt,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      focusKeyword: input.focusKeyword ?? null,
      canonicalUrl: input.canonicalUrl ?? null,
      sections: {
        create: (input.sections ?? []).map((section, sIdx) => ({
          title: section.title,
          slug: slugify(section.slug || section.title, `section-${sIdx + 1}`),
          description: section.description ?? null,
          sortOrder: section.sortOrder ?? sIdx,
          lessons: {
            create: (section.lessons ?? []).map((lesson, lIdx) => {
              const content = lesson.content ?? "";
              return {
                title: lesson.title,
                slug: slugify(
                  lesson.slug || lesson.title,
                  `lesson-${lIdx + 1}`
                ),
                content,
                readingTimeMin:
                  lesson.readingTimeMin ?? estimateReadingTimeMin(content),
                featuredImageUrl: lesson.featuredImageUrl ?? null,
                featuredImageAlt: lesson.featuredImageAlt ?? null,
                videoUrl: lesson.videoUrl ?? null,
                codeExample: lesson.codeExample ?? null,
                resourceUrl: lesson.resourceUrl ?? null,
                articleId: lesson.articleId ?? null,
                aiToolId: lesson.aiToolId ?? null,
                sortOrder: lesson.sortOrder ?? lIdx,
              };
            }),
          },
        })),
      },
    },
    include: guideInclude,
  });

  return mapGuideRow(created as Parameters<typeof mapGuideRow>[0]);
}

export async function updateGuide(
  id: string,
  input: Omit<GuideWriteInput, "authorId"> & { authorId?: string }
): Promise<GuideRecord | null> {
  const existing = await getGuideById(id);
  if (!existing) return null;

  const topic = await getTopicById(input.topicId);
  if (!topic) throw new Error("Topic is required — guides must attach to a topic");

  const categoryId = input.categoryId || topic.categoryId;
  const category = categoryId ? await getCategoryById(categoryId) : null;
  const slug = await uniqueGuideSlug(input.slug || input.title, id);
  const status = input.status ?? existing.status;
  let publishedAt = existing.publishedAt
    ? new Date(existing.publishedAt)
    : null;
  if (status === "PUBLISHED" && !publishedAt) {
    publishedAt = input.publishedAt ? new Date(input.publishedAt) : new Date();
  } else if (input.publishedAt) {
    publishedAt = new Date(input.publishedAt);
  }

  if (!isDatabaseConfigured()) {
    seedGuides();
    const idx = memory.guides.findIndex((g) => g.id === id);
    if (idx < 0) return null;
    const sections = normalizeSections(id, input.sections);
    const c = counts(sections);
    memory.guides[idx] = {
      ...memory.guides[idx],
      title: input.title,
      slug,
      shortDescription: input.shortDescription ?? null,
      fullDescription: input.fullDescription ?? null,
      coverImageUrl: input.coverImageUrl ?? null,
      coverImageAlt: input.coverImageAlt ?? null,
      status,
      difficulty: input.difficulty ?? existing.difficulty,
      estimatedMinutes: input.estimatedMinutes ?? existing.estimatedMinutes,
      learningObjectives:
        input.learningObjectives ?? existing.learningObjectives,
      prerequisites: input.prerequisites ?? existing.prerequisites,
      featured: input.featured ?? false,
      categoryId: categoryId ?? null,
      categoryName: category?.name ?? null,
      categorySlug: category?.slug ?? null,
      topicId: input.topicId,
      topicName: topic.name,
      topicSlug: topic.slug,
      publishedAt: publishedAt?.toISOString() ?? null,
      scheduledAt: input.scheduledAt ?? null,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      focusKeyword: input.focusKeyword ?? null,
      canonicalUrl: input.canonicalUrl ?? null,
      ...c,
      sections,
      updatedAt: nowIso(),
    };
    return memory.guides[idx];
  }

  const prisma = getPrisma();
  await prisma.guideSection.deleteMany({ where: { guideId: id } });

  const updated = await prisma.guide.update({
    where: { id },
    data: {
      title: input.title,
      slug,
      shortDescription: input.shortDescription ?? null,
      fullDescription: input.fullDescription ?? null,
      coverImageUrl: input.coverImageUrl ?? null,
      coverImageAlt: input.coverImageAlt ?? null,
      status,
      difficulty: input.difficulty ?? existing.difficulty,
      estimatedMinutes: input.estimatedMinutes ?? existing.estimatedMinutes,
      learningObjectives:
        input.learningObjectives ?? existing.learningObjectives,
      prerequisites: input.prerequisites ?? existing.prerequisites,
      featured: input.featured ?? false,
      categoryId: categoryId || null,
      topicId: input.topicId,
      publishedAt,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      focusKeyword: input.focusKeyword ?? null,
      canonicalUrl: input.canonicalUrl ?? null,
      sections: {
        create: (input.sections ?? []).map((section, sIdx) => ({
          title: section.title,
          slug: slugify(section.slug || section.title, `section-${sIdx + 1}`),
          description: section.description ?? null,
          sortOrder: section.sortOrder ?? sIdx,
          lessons: {
            create: (section.lessons ?? []).map((lesson, lIdx) => {
              const content = lesson.content ?? "";
              return {
                title: lesson.title,
                slug: slugify(
                  lesson.slug || lesson.title,
                  `lesson-${lIdx + 1}`
                ),
                content,
                readingTimeMin:
                  lesson.readingTimeMin ?? estimateReadingTimeMin(content),
                featuredImageUrl: lesson.featuredImageUrl ?? null,
                featuredImageAlt: lesson.featuredImageAlt ?? null,
                videoUrl: lesson.videoUrl ?? null,
                codeExample: lesson.codeExample ?? null,
                resourceUrl: lesson.resourceUrl ?? null,
                articleId: lesson.articleId ?? null,
                aiToolId: lesson.aiToolId ?? null,
                sortOrder: lesson.sortOrder ?? lIdx,
              };
            }),
          },
        })),
      },
    },
    include: guideInclude,
  });

  return mapGuideRow(updated as Parameters<typeof mapGuideRow>[0]);
}

export async function deleteGuides(ids: string[]): Promise<number> {
  if (!ids.length) return 0;
  if (!isDatabaseConfigured()) {
    seedGuides();
    const before = memory.guides.length;
    memory.guides = memory.guides.filter((g) => !ids.includes(g.id));
    return before - memory.guides.length;
  }
  const result = await getPrisma().guide.deleteMany({
    where: { id: { in: ids } },
  });
  return result.count;
}

export async function bulkUpdateGuideStatus(
  ids: string[],
  status: GuideStatusValue
): Promise<number> {
  if (!ids.length) return 0;
  if (!isDatabaseConfigured()) {
    seedGuides();
    let n = 0;
    for (const g of memory.guides) {
      if (ids.includes(g.id)) {
        g.status = status;
        if (status === "PUBLISHED" && !g.publishedAt) {
          g.publishedAt = nowIso();
        }
        g.updatedAt = nowIso();
        n += 1;
      }
    }
    return n;
  }
  const data: { status: GuideStatusValue; publishedAt?: Date } = { status };
  if (status === "PUBLISHED") data.publishedAt = new Date();
  const result = await getPrisma().guide.updateMany({
    where: { id: { in: ids } },
    data,
  });
  return result.count;
}

export async function getGuideBySlugAdmin(
  slug: string
): Promise<GuideRecord | null> {
  if (!isDatabaseConfigured()) {
    seedGuides();
    return memory.guides.find((g) => g.slug === slug) ?? null;
  }
  const row = await getPrisma().guide.findUnique({
    where: { slug },
    include: guideInclude,
  });
  return row ? mapGuideRow(row as Parameters<typeof mapGuideRow>[0]) : null;
}

export async function listPublishedGuideSummaries(
  params: {
    page?: number;
    pageSize?: number;
    query?: string;
    categoryId?: string;
    topicId?: string;
  } = {}
): Promise<GuideSummary[]> {
  const result = await listGuidesAdmin({
    ...params,
    status: "PUBLISHED",
  });
  return result.items.map((g) => ({
    id: g.id,
    slug: g.slug,
    title: g.title,
    excerpt: g.shortDescription,
    difficulty: g.difficulty,
    estimatedMinutes: g.estimatedMinutes,
    coverImageUrl: g.coverImageUrl,
    categoryName: g.categoryName,
    featured: g.featured,
    sectionCount: g.sectionCount,
    lessonCount: g.lessonCount,
  }));
}

/** Flat lesson list in guide order for prev/next navigation (MES-026). */
export function flattenGuideLessons(guide: GuideRecord): GuideLessonRecord[] {
  return guide.sections.flatMap((s) => s.lessons);
}
