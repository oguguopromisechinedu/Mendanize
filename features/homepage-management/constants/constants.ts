export const HOMEPAGE_SECTION_KEYS = [
  "hero",
  "ask",
  "stats",
  "categories",
  "paths",
  "articles",
  "tools",
  "why",
  "testimonials",
  "newsletter",
  "faq",
  "finalCta",
] as const

export const HOMEPAGE_SECTION_LABELS: Record<
  (typeof HOMEPAGE_SECTION_KEYS)[number],
  string
> = {
  hero: "Hero",
  ask: "Ask Mendanize",
  stats: "Statistics",
  categories: "Featured categories",
  paths: "Learning paths",
  articles: "Featured articles",
  tools: "Featured tools",
  why: "Why Mendanize",
  testimonials: "Testimonials",
  newsletter: "Newsletter",
  faq: "FAQ",
  finalCta: "Final CTA",
}

export const HOMEPAGE_NAV = [
  { href: "/dashboard/homepage", label: "Overview" },
  { href: "/dashboard/homepage/sections", label: "Sections" },
  { href: "/dashboard/homepage/hero", label: "Hero" },
  { href: "/dashboard/homepage/featured", label: "Featured" },
  { href: "/dashboard/homepage/latest-articles", label: "Latest articles" },
  { href: "/dashboard/homepage/statistics", label: "Statistics" },
  { href: "/dashboard/homepage/testimonials", label: "Testimonials" },
  { href: "/dashboard/homepage/faq", label: "FAQ" },
  { href: "/dashboard/homepage/newsletter", label: "Newsletter" },
  { href: "/dashboard/homepage/cta", label: "Final CTA" },
  { href: "/dashboard/homepage/ask", label: "Ask copy" },
  { href: "/dashboard/homepage/why", label: "Why section" },
] as const

export const FEATURED_KINDS = [
  "CATEGORY",
  "ARTICLE",
  "GUIDE",
  "TOOL",
] as const

export const FEATURED_KIND_LABELS: Record<
  (typeof FEATURED_KINDS)[number],
  string
> = {
  CATEGORY: "Categories",
  ARTICLE: "Articles",
  GUIDE: "Guides",
  TOOL: "Tools",
}

export const STAT_ICON_OPTIONS = [
  "articles",
  "tools",
  "subscribers",
  "content",
  "hub",
  "sparkles",
] as const

export const CATEGORY_ICON_OPTIONS = [
  "sparkles",
  "brain",
  "layers",
  "chart",
  "terminal",
  "code",
  "mobile",
  "server",
  "shield",
  "rocket",
  "palette",
  "database",
  "lock",
  "globe",
  "bot",
] as const

export const WHY_ICON_OPTIONS = [
  "insights",
  "tutorials",
  "community",
  "updated",
  "skills",
  "ai",
] as const
