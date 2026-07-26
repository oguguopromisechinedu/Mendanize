/**
 * Shared featured content from the published Homepage CMS.
 * Strict: live PUBLISHED entities only — never homepage seed / marketing fallbacks.
 * Used by the learner dashboard; public homepage keeps its own seed-tolerant path.
 */

import "server-only";

import { isDatabaseConfigured } from "@/lib/db/prisma";
import { contentHref } from "@/lib/content-paths";
import { getHomepageAdmin } from "@/services/content/homepage";
import { getArticleById } from "@/services/content/articles";
import { getGuideById } from "@/services/content/guides";
import { getToolById } from "@/services/content/tools";
import type {
  HomepageFeaturedKindValue,
  HomepageFeaturedRecord,
} from "@/services/content/types";

export type FeaturedPublishedPath = {
  id: string;
  title: string;
  description: string;
  href: string;
  difficulty: string;
  duration: string;
  lessons: number;
};

export type FeaturedPublishedArticle = {
  id: string;
  title: string;
  description: string;
  href: string;
  category: string;
  readingTime: string;
  imageUrl: string | null;
};

export type FeaturedPublishedTool = {
  id: string;
  name: string;
  description: string;
  href: string;
  category: string;
};

export type FeaturedPublishedContent = {
  /** True only when Homepage CMS status is PUBLISHED and at least one entity resolved. */
  available: boolean;
  paths: FeaturedPublishedPath[];
  articles: FeaturedPublishedArticle[];
  tools: FeaturedPublishedTool[];
};

const EMPTY: FeaturedPublishedContent = {
  available: false,
  paths: [],
  articles: [],
  tools: [],
};

function listFeaturedRows(
  featured: HomepageFeaturedRecord[],
  kind: HomepageFeaturedKindValue,
  limit: number | null | undefined,
): HomepageFeaturedRecord[] {
  const items = featured
    .filter((f) => f.kind === kind)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return typeof limit === "number" ? items.slice(0, limit) : items;
}

/**
 * Resolve Homepage CMS featured guides/articles/tools that are actually PUBLISHED.
 * Returns empty when DB is off, homepage is draft/unpublished, or featured entities are missing.
 */
export async function resolveFeaturedPublishedContent(): Promise<FeaturedPublishedContent> {
  if (!isDatabaseConfigured()) return EMPTY;

  try {
    const admin = await getHomepageAdmin();
    if (admin.status !== "PUBLISHED") return EMPTY;

    const sectionMeta = (key: string) =>
      admin.sections.find((s) => s.sectionKey === key);

    const guideRows = listFeaturedRows(
      admin.featured,
      "GUIDE",
      sectionMeta("paths")?.displayLimit,
    );
    const articleRows = listFeaturedRows(
      admin.featured,
      "ARTICLE",
      sectionMeta("articles")?.displayLimit,
    );
    const toolRows = listFeaturedRows(
      admin.featured,
      "TOOL",
      sectionMeta("tools")?.displayLimit,
    );

    const [paths, articles, tools] = await Promise.all([
      resolvePublishedGuides(guideRows),
      resolvePublishedArticles(articleRows),
      resolvePublishedTools(toolRows),
    ]);

    const available =
      paths.length > 0 || articles.length > 0 || tools.length > 0;

    return { available, paths, articles, tools };
  } catch (error) {
    console.error(
      "[featured-published] Failed to resolve homepage featured content:",
      error instanceof Error ? error.message : error,
    );
    return EMPTY;
  }
}

async function resolvePublishedGuides(
  rows: HomepageFeaturedRecord[],
): Promise<FeaturedPublishedPath[]> {
  const out: FeaturedPublishedPath[] = [];
  for (const f of rows) {
    const guide = await getGuideById(f.entityId).catch(() => null);
    if (!guide || guide.status !== "PUBLISHED") continue;
    out.push({
      id: guide.id,
      title: f.titleOverride || guide.title,
      description: guide.shortDescription ?? "",
      href: contentHref("guide", guide.slug, { scope: "account" }),
      difficulty: guide.difficulty
        ? guide.difficulty.charAt(0) + guide.difficulty.slice(1).toLowerCase()
        : "Beginner",
      duration: `${guide.estimatedMinutes} min`,
      lessons: guide.lessonCount ?? 0,
    });
  }
  return out;
}

async function resolvePublishedArticles(
  rows: HomepageFeaturedRecord[],
): Promise<FeaturedPublishedArticle[]> {
  const out: FeaturedPublishedArticle[] = [];
  for (const f of rows) {
    const art = await getArticleById(f.entityId).catch(() => null);
    if (!art || art.status !== "PUBLISHED") continue;
    out.push({
      id: art.id,
      title: f.titleOverride || art.title,
      description: art.excerpt ?? "",
      href: contentHref("article", art.slug, { scope: "account" }),
      category: art.categoryName ?? "",
      readingTime: `${art.readingTimeMin} min`,
      imageUrl: art.featuredImageUrl ?? null,
    });
  }
  return out;
}

async function resolvePublishedTools(
  rows: HomepageFeaturedRecord[],
): Promise<FeaturedPublishedTool[]> {
  const out: FeaturedPublishedTool[] = [];
  for (const f of rows) {
    const tool = await getToolById(f.entityId).catch(() => null);
    if (!tool || tool.status !== "PUBLISHED") continue;
    out.push({
      id: tool.id,
      name: f.titleOverride || tool.name,
      description: tool.shortDescription ?? "",
      href: contentHref("ai_tool", tool.slug, { scope: "account" }),
      category: tool.categoryNames?.[0] ?? "",
    });
  }
  return out;
}
