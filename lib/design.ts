/**
 * Design surface helpers (MES-003).
 * Prefer CSS tokens / Tailwind semantic colors over ad-hoc hex.
 */

export const routes = {
  home: "/",
  learn: "/learn",
  guides: "/guides",
  categories: "/categories",
  aiTools: "/ai-tools",
  articles: "/articles",
  topics: "/topics",
  about: "/about",
  contact: "/contact",
  search: "/search",
  pricing: "/pricing",
  dashboard: "/dashboard",
  workspace: "/workspace",
  tools: "/ai-tools",
  blog: "/articles",
  seoOptimizer: "/seo-optimizer",
  templates: "/templates",
  content: "/dashboard/content",
  analytics: "/dashboard/analytics",
  blogGenerator: "/tools/blog-generator",
  signIn: "/sign-in",
  signUp: "/sign-up",
  onboarding: "/onboarding",
  admin: "/dashboard",
  settings: "/dashboard/settings",
  billing: "/dashboard/settings/billing",
  saved: "/dashboard/saved",
};

/** Layout / typography class presets backed by MES-003 tokens. */
export const styles = {
  container: "container-app",
  section: "section-y px-[var(--space-6)]",
  eyebrow: "type-caption text-primary",
  primaryBtn:
    "inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition duration-[var(--motion-base)] hover:opacity-95",
  glass:
    "rounded-2xl border border-border bg-card/80 text-card-foreground shadow-md backdrop-blur-xl",
  glassHover:
    "transition duration-[var(--motion-base)] hover:-translate-y-0.5 hover:border-primary/30 hover:bg-hover",
  gradientText: "text-primary",
  meshBg: "pointer-events-none absolute inset-0 overflow-hidden",
};

export const icons = {
  /** Single icon set for the product (MES-003) — Lucide via lucide-react. */
  library: "lucide-react" as const,
};
