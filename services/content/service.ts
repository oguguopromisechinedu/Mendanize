/**
 * Content Shared Service (MES-002 / MES-008 / MES-009 / MES-010 / MES-012)
 */

import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import {
  getArticleBySlugAdmin,
  listPublishedArticleSummaries,
} from "./articles";
import {
  getGuideBySlugAdmin,
  listPublishedGuideSummaries,
} from "./guides";
import {
  listCategorySummaries,
  listTopicSummaries,
} from "./taxonomy";
import {
  getToolBySlugAdmin,
  listPublishedToolSummaries,
} from "./tools";
import type {
  ArticleSummary,
  AuthorSummary,
  CategorySummary,
  ContentListParams,
  GuideRecord,
  GuideSummary,
  PublicArticleDetail,
  ToolRecord,
  ToolSummary,
  TopicSummary,
} from "./types";

export {
  listArticlesAdmin,
  getArticleById,
  getArticleBySlugAdmin,
  createArticle,
  updateArticle,
  deleteArticles,
  bulkUpdateArticleStatus,
  listTagsAdmin,
  estimateReadingTimeMin,
} from "./articles";

export {
  listCategoriesAdmin,
  listTopicsAdmin,
  listCategorySummaries,
  listTopicSummaries,
  getCategoryById,
  getTopicById,
  getCategoryBySlug,
  getTopicBySlug,
  getCategoryDetail,
  getTopicDetail,
  getPublishedCategoryBySlug,
  getPublishedTopicBySlug,
  createCategory,
  updateCategory,
  createTopic,
  updateTopic,
  deleteCategories,
  deleteTopics,
  bulkUpdateCategoryStatus,
  bulkUpdateTopicStatus,
} from "./taxonomy";

export {
  listGuidesAdmin,
  getGuideById,
  getGuideBySlugAdmin,
  createGuide,
  updateGuide,
  deleteGuides,
  bulkUpdateGuideStatus,
  listPublishedGuideSummaries,
  flattenGuideLessons,
} from "./guides";

export {
  listToolsAdmin,
  getToolById,
  getToolBySlugAdmin,
  createTool,
  updateTool,
  deleteTools,
  bulkUpdateToolStatus,
  listPublishedToolSummaries,
  listPublishedTools,
} from "./tools";

export async function listArticles(
  params?: ContentListParams
): Promise<ArticleSummary[]> {
  return listPublishedArticleSummaries(params);
}

export async function getArticleBySlug(
  slug: string
): Promise<ArticleSummary | null> {
  const article = await getPublishedArticleBySlug(slug);
  if (!article) return null;
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    publishedAt: article.publishedAt,
    readingTimeMin: article.readingTimeMin,
    categoryName: article.categoryName,
    featuredImageUrl: article.featuredImageUrl,
    featured: article.featured,
  };
}

/** Full published article for the public reading experience (MES-025). */
export async function getPublishedArticleBySlug(
  slug: string
): Promise<PublicArticleDetail | null> {
  const article = await getArticleBySlugAdmin(slug);
  if (!article || article.status !== "PUBLISHED") return null;

  const published = await listPublishedArticleSummaries({ pageSize: 200 });
  const ordered = [...published].sort((a, b) => {
    const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return db - da;
  });
  const idx = ordered.findIndex((a) => a.slug === slug);
  const prev =
    idx >= 0 && idx < ordered.length - 1
      ? { slug: ordered[idx + 1]!.slug, title: ordered[idx + 1]!.title }
      : null;
  const next =
    idx > 0
      ? { slug: ordered[idx - 1]!.slug, title: ordered[idx - 1]!.title }
      : null;

  return { ...article, prev, next };
}

export async function listGuides(
  params?: ContentListParams
): Promise<GuideSummary[]> {
  return listPublishedGuideSummaries(params);
}

export async function getGuideBySlug(
  slug: string
): Promise<GuideSummary | null> {
  const guide = await getPublishedGuideBySlug(slug);
  if (!guide) return null;
  return {
    id: guide.id,
    slug: guide.slug,
    title: guide.title,
    excerpt: guide.shortDescription,
    difficulty: guide.difficulty,
    estimatedMinutes: guide.estimatedMinutes,
    coverImageUrl: guide.coverImageUrl,
    categoryName: guide.categoryName,
    featured: guide.featured,
    sectionCount: guide.sectionCount,
    lessonCount: guide.lessonCount,
  };
}

/** Full published guide for the public learning experience (MES-026). */
export async function getPublishedGuideBySlug(
  slug: string
): Promise<GuideRecord | null> {
  const guide = await getGuideBySlugAdmin(slug);
  if (!guide || guide.status !== "PUBLISHED") return null;
  return guide;
}

export async function listAiTools(
  params?: ContentListParams
): Promise<ToolSummary[]> {
  return listPublishedToolSummaries(params);
}

export async function getAiToolBySlug(
  slug: string
): Promise<ToolSummary | null> {
  const tool = await getPublishedToolBySlug(slug);
  if (!tool) return null;
  return {
    id: tool.id,
    slug: tool.slug,
    name: tool.name,
    description: tool.shortDescription,
    pricing: tool.pricing,
    difficulty: tool.difficulty,
    logoUrl: tool.logoUrl,
    featured: tool.featured,
    categoryNames: tool.categoryNames,
    topicNames: tool.topicNames,
    platforms: tool.platforms,
    publishedAt: tool.publishedAt,
  };
}

/** Full published tool for the public directory detail page (MES-027). */
export async function getPublishedToolBySlug(
  slug: string
): Promise<ToolRecord | null> {
  const tool = await getToolBySlugAdmin(slug);
  if (!tool || tool.status !== "PUBLISHED") return null;
  return tool;
}

export async function listCategories(): Promise<CategorySummary[]> {
  return listCategorySummaries();
}

/** Active categories for public taxonomy index. */
export async function listPublicCategories() {
  const { listCategoriesAdmin } = await import("./taxonomy");
  const result = await listCategoriesAdmin({
    status: "ACTIVE",
    pageSize: 100,
    sort: "displayOrder",
    sortDir: "asc",
  });
  return result.items;
}

/** Active topics for public taxonomy index. */
export async function listPublicTopics(categoryId?: string) {
  const { listTopicsAdmin } = await import("./taxonomy");
  const result = await listTopicsAdmin({
    status: "ACTIVE",
    pageSize: 100,
    categoryId,
    sort: "displayOrder",
    sortDir: "asc",
  });
  return result.items;
}

export async function listTopics(): Promise<TopicSummary[]> {
  return listTopicSummaries();
}

/** Staff/authors who have published or drafted content. */
export async function listAuthors(): Promise<AuthorSummary[]> {
  if (!isDatabaseConfigured()) {
    return [
      { id: "usr_admin", name: "Platform Admin", slug: "platform-admin" },
      { id: "usr_editor", name: "Content Editor", slug: "content-editor" },
    ];
  }

  const rows = await getPrisma().user.findMany({
    where: {
      OR: [
        { articles: { some: {} } },
        { guides: { some: {} } },
        { role: { in: ["EDITOR", "ADMIN", "SUPER_ADMIN"] } },
      ],
    },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
    take: 200,
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name?.trim() || row.email.split("@")[0] || "Author",
    slug: (row.name || row.email)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80),
  }));
}
