export const SEO_ENTITY_TYPES = [
  "HOMEPAGE",
  "ARTICLE",
  "CATEGORY",
  "TOPIC",
  "GUIDE",
  "AI_TOOL",
  "PAGE",
] as const

export const SEO_ENTITY_LABELS: Record<
  (typeof SEO_ENTITY_TYPES)[number],
  string
> = {
  HOMEPAGE: "Homepage",
  ARTICLE: "Articles",
  CATEGORY: "Categories",
  TOPIC: "Topics",
  GUIDE: "Guides",
  AI_TOOL: "AI Tools",
  PAGE: "Static pages",
}

export const SEO_NAV = [
  { href: "/dashboard/seo", label: "Dashboard" },
  { href: "/dashboard/seo/settings", label: "Global settings" },
  { href: "/dashboard/seo/templates", label: "Templates" },
  { href: "/dashboard/seo/structured-data", label: "Structured data" },
  { href: "/dashboard/seo/robots", label: "Robots.txt" },
  { href: "/dashboard/redirects", label: "Redirects" },
  { href: "/dashboard/sitemap", label: "Sitemap" },
] as const

export const REDIRECT_TYPES = ["PERMANENT_301", "TEMPORARY_302"] as const
export const REDIRECT_STATUSES = ["ACTIVE", "DISABLED"] as const
