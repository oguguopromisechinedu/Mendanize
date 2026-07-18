export const NAVIGATION_NAV = [
  { label: "Overview", href: "/dashboard/navigation" },
  { label: "Main", href: "/dashboard/navigation/main" },
  { label: "Mobile", href: "/dashboard/navigation/mobile" },
  { label: "Footer", href: "/dashboard/navigation/footer" },
  { label: "Quick links", href: "/dashboard/navigation/quick-links" },
  { label: "Utility", href: "/dashboard/navigation/utility" },
  { label: "Legal", href: "/dashboard/navigation/legal" },
  { label: "Social", href: "/dashboard/navigation/social" },
  { label: "Locations", href: "/dashboard/navigation/locations" },
  { label: "Settings", href: "/dashboard/navigation/settings" },
] as const;

export const MENU_ITEM_TYPES = [
  { value: "INTERNAL_PAGE", label: "Internal page" },
  { value: "ARTICLE", label: "Article" },
  { value: "CATEGORY", label: "Category" },
  { value: "TOPIC", label: "Topic" },
  { value: "GUIDE", label: "Guide" },
  { value: "AI_TOOL", label: "AI tool" },
  { value: "CUSTOM_URL", label: "Custom URL" },
] as const;

export const LOCATION_LABELS: Record<string, string> = {
  MAIN: "Main navigation",
  MOBILE: "Mobile navigation",
  FOOTER: "Footer",
  UTILITY: "Utility",
  QUICK_LINKS: "Quick links",
};
