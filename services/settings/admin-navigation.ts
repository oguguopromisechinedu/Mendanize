/**
 * Admin dashboard navigation seed (MES-007).
 * Persistence / permission filtering lands with Navigation Manager (MES-016).
 */

export type AdminNavItem = {
  label: string;
  href: string;
  icon: string;
  /** Future RBAC — architecture only in MES-007 */
  roles?: Array<"EDITOR" | "ADMIN" | "SUPER_ADMIN">;
};

export type AdminNavGroup = {
  id: string;
  label: string;
  items: AdminNavItem[];
};

export type AdminNavigationConfig = {
  brand: { name: string; href: string };
  groups: AdminNavGroup[];
};

export const SEEDED_ADMIN_NAVIGATION: AdminNavigationConfig = {
  brand: { name: "Mendanize", href: "/dashboard" },
  groups: [
    {
      id: "main",
      label: "Main",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: "layout-dashboard" },
        { label: "AI Knowledge", href: "/dashboard/ai-knowledge", icon: "library" },
        { label: "AI Tools", href: "/dashboard/ai-tools", icon: "cpu" },
        { label: "Homepage", href: "/dashboard/homepage", icon: "home" },
        { label: "Navbar Manager", href: "/dashboard/navigation", icon: "menu" },
        { label: "Comments", href: "/dashboard/comments", icon: "message-square" },
        { label: "Prompt Library", href: "/dashboard/prompt-library", icon: "message-square-text" },
        { label: "Project Templates", href: "/dashboard/project-templates", icon: "folder-kanban" },
        { label: "Certificates", href: "/dashboard/certificates", icon: "award" },
        { label: "Featured Learning", href: "/dashboard/featured-learning", icon: "star" },
        { label: "Workspace Presets", href: "/dashboard/workspace-presets", icon: "code-2" },
      ],
    },
    {
      id: "post",
      label: "Post",
      items: [
        { label: "Post Overview", href: "/dashboard/post", icon: "layout-dashboard" },
        { label: "Articles", href: "/dashboard/articles", icon: "file-text" },
        { label: "Learning Guides", href: "/dashboard/guides", icon: "book-open" },
        { label: "Categories", href: "/dashboard/categories", icon: "folder" },
        { label: "Topics", href: "/dashboard/topics", icon: "tags" },
        { label: "Media Library", href: "/dashboard/media", icon: "image" },
        { label: "Pages", href: "/dashboard/pages", icon: "layout" },
        { label: "AI Article Generator", href: "/dashboard/ai-studio/article", icon: "sparkles" },
        { label: "AI Image Generator", href: "/dashboard/ai-studio/image", icon: "image" },
        { label: "AI Video Generator", href: "/dashboard/ai-studio/video", icon: "video" },
        { label: "Scheduled Posts", href: "/dashboard/articles/scheduled", icon: "calendar" },
        { label: "Drafts", href: "/dashboard/articles/drafts", icon: "file-pen" },
        { label: "Trash", href: "/dashboard/articles/archived", icon: "trash" },
      ],
    },
    {
      id: "content-seo",
      label: "Content & SEO",
      items: [
        { label: "Tags", href: "/dashboard/tags", icon: "hash" },
        { label: "SEO Center", href: "/dashboard/seo", icon: "search" },
        { label: "Search settings", href: "/dashboard/search-settings", icon: "text-search" },
        { label: "Redirects", href: "/dashboard/redirects", icon: "corner-down-right" },
        { label: "Sitemap", href: "/dashboard/sitemap", icon: "map" },
        { label: "Broken Links", href: "/dashboard/broken-links", icon: "unlink" },
      ],
    },
    {
      id: "growth",
      label: "Growth & Engagement",
      items: [
        { label: "Newsletter", href: "/dashboard/newsletter", icon: "mail" },
        { label: "Notifications", href: "/dashboard/notifications", icon: "bell" },
        { label: "Subscribers", href: "/dashboard/subscribers", icon: "users" },
        { label: "Analytics", href: "/dashboard/analytics", icon: "bar-chart-3" },
        {
          label: "Community",
          href: "/dashboard/community",
          icon: "message-square",
        },
        {
          label: "Marketplace",
          href: "/dashboard/marketplace",
          icon: "store",
        },
      ],
    },
    {
      id: "bi",
      label: "Business Intelligence",
      items: [
        {
          label: "Founder Dashboard",
          href: "/dashboard/bi",
          icon: "line-chart",
          roles: ["SUPER_ADMIN"],
        },
        {
          label: "Company Valuation",
          href: "/dashboard/bi/valuation",
          icon: "landmark",
          roles: ["SUPER_ADMIN"],
        },
        {
          label: "Investor Metrics",
          href: "/dashboard/bi/investor",
          icon: "trending-up",
          roles: ["SUPER_ADMIN"],
        },
      ],
    },
    {
      id: "users",
      label: "Users & Management",
      items: [
        { label: "Users & Roles", href: "/dashboard/users", icon: "shield" },
        { label: "Workflow", href: "/dashboard/workflow", icon: "git-branch" },
        { label: "Activity Log", href: "/dashboard/activity-log", icon: "activity" },
        {
          label: "System Logs",
          href: "/dashboard/system-logs",
          icon: "activity",
        },
      ],
    },
    {
      id: "system",
      label: "System",
      items: [
        { label: "AI & Integrations", href: "/dashboard/integrations", icon: "cpu" },
        { label: "Automation", href: "/dashboard/automation", icon: "zap" },
        { label: "Knowledge Base", href: "/dashboard/knowledge-base", icon: "library" },
        { label: "Settings", href: "/dashboard/settings", icon: "settings" },
        {
          label: "Billing overview",
          href: "/dashboard/billing-overview",
          icon: "credit-card",
        },
      ],
    },
  ],
};

export async function getAdminNavigationConfig(): Promise<AdminNavigationConfig> {
  return structuredClone(SEEDED_ADMIN_NAVIGATION);
}

export function getSeededAdminNavigation(): AdminNavigationConfig {
  return SEEDED_ADMIN_NAVIGATION;
}
