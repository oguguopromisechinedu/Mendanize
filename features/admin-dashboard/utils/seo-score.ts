import type { ArticleRecord } from "@/services/content/types";

/** Heuristic SEO score (0–100) from article metadata — no dedicated DB field. */
export function computeArticleSeoScore(article: Pick<
  ArticleRecord,
  | "seoTitle"
  | "seoDescription"
  | "focusKeyword"
  | "excerpt"
  | "featuredImageUrl"
  | "status"
  | "tags"
  | "title"
>): number {
  let score = 0;

  if (article.seoTitle?.trim()) score += 20;
  else if (article.title.trim().length >= 30) score += 10;

  if (article.seoDescription?.trim() && article.seoDescription.length >= 120)
    score += 20;
  else if (article.seoDescription?.trim()) score += 12;

  if (article.focusKeyword?.trim()) score += 15;
  if (article.excerpt?.trim() && article.excerpt.length >= 80) score += 15;
  else if (article.excerpt?.trim()) score += 8;

  if (article.featuredImageUrl?.trim()) score += 15;
  if (article.tags.length >= 2) score += 10;
  else if (article.tags.length === 1) score += 5;

  if (article.status === "PUBLISHED") score += 5;

  return Math.min(100, score);
}
