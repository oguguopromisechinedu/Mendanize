/**
 * MES-033 — content cache tags + public path invalidation on publish.
 */
import { revalidatePath, revalidateTag } from "next/cache"

export const CONTENT_CACHE_TAGS = {
  homepage: "content:homepage",
  homepageStatistics: "content:homepage-statistics",
  navigation: "content:navigation",
  articles: "content:articles",
  guides: "content:guides",
  tools: "content:tools",
  taxonomy: "content:taxonomy",
} as const

/** Call after Article / Guide / AI Tool publish or update. */
export function invalidatePublicContent(opts?: {
  articleSlug?: string
  guideSlug?: string
  toolSlug?: string
}) {
  // Next.js 16+: profile required (stale-while-revalidate style)
  revalidateTag(CONTENT_CACHE_TAGS.articles, "max")
  revalidateTag(CONTENT_CACHE_TAGS.guides, "max")
  revalidateTag(CONTENT_CACHE_TAGS.tools, "max")
  revalidateTag(CONTENT_CACHE_TAGS.homepage, "max")
  revalidateTag(CONTENT_CACHE_TAGS.homepageStatistics, "max")

  revalidatePath("/")
  revalidatePath("/articles")
  revalidatePath("/blog")
  revalidatePath("/guides")
  revalidatePath("/ai-tools")
  revalidatePath("/tools")
  revalidatePath("/categories")
  revalidatePath("/topics")
  revalidatePath("/search")

  if (opts?.articleSlug) {
    revalidatePath(`/articles/${opts.articleSlug}`)
    revalidatePath(`/blog/${opts.articleSlug}`)
  }
  if (opts?.guideSlug) {
    revalidatePath(`/guides/${opts.guideSlug}`)
  }
  if (opts?.toolSlug) {
    revalidatePath(`/ai-tools/${opts.toolSlug}`)
    revalidatePath(`/tools/${opts.toolSlug}`)
  }
}

/** Subscriber / learner totals shown on the public homepage. */
export function invalidateHomepageStatistics() {
  revalidateTag(CONTENT_CACHE_TAGS.homepageStatistics, "max")
  revalidatePath("/")
}
