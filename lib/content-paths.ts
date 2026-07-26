/**
 * Canonical public vs account content URLs.
 * Public SEO routes stay at /guides, /articles, …;
 * signed-in learners browse the same content under /account/….
 */

export type ContentScope = "public" | "account";

export type ContentEntityType =
  | "article"
  | "guide"
  | "ai_tool"
  | "category"
  | "topic";

const LIST_SEGMENT: Record<ContentEntityType, string> = {
  article: "articles",
  guide: "guides",
  ai_tool: "ai-tools",
  category: "categories",
  topic: "topics",
};

export function contentListHref(
  type: ContentEntityType,
  options?: { scope?: ContentScope },
): string {
  const scope = options?.scope ?? "public";
  const segment = LIST_SEGMENT[type];
  return scope === "account" ? `/account/${segment}` : `/${segment}`;
}

export function contentHref(
  type: ContentEntityType,
  slug: string,
  options?: { scope?: ContentScope },
): string {
  return `${contentListHref(type, options)}/${slug}`;
}

export function contentLessonHref(
  guideSlug: string,
  lessonSlug: string,
  options?: { scope?: ContentScope },
): string {
  return `${contentListHref("guide", options)}/${guideSlug}/lessons/${lessonSlug}`;
}

export function contentSearchHref(options?: {
  scope?: ContentScope;
}): string {
  return options?.scope === "account" ? "/account/search" : "/search";
}
