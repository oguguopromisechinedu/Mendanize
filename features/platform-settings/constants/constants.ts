export const SETTINGS_NAV = [
  { label: "Overview", href: "/dashboard/settings" },
  { label: "General", href: "/dashboard/settings/general" },
  { label: "Branding", href: "/dashboard/settings/branding" },
  { label: "Localization", href: "/dashboard/settings/localization" },
  { label: "Authentication", href: "/dashboard/settings/authentication" },
  { label: "AI", href: "/dashboard/settings/ai" },
  { label: "Search", href: "/dashboard/settings/search" },
  { label: "Email", href: "/dashboard/settings/email" },
  { label: "Security", href: "/dashboard/settings/security" },
  { label: "Maintenance", href: "/dashboard/settings/maintenance" },
  { label: "Feature flags", href: "/dashboard/settings/feature-flags" },
  { label: "Backup", href: "/dashboard/settings/backup" },
  { label: "Billing", href: "/dashboard/settings/billing" },
] as const;

export const AI_PROVIDERS = ["claude", "openai", "local_mock"] as const;

/** Anthropic owns all article / writing generation. */
export const AI_TEXT_PROVIDERS = ["claude"] as const;

/** OpenAI owns all image generation. */
export const AI_IMAGE_PROVIDERS = ["openai"] as const;
