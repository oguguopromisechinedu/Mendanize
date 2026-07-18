/**
 * Public navigation + footer config (MES-004 / MES-016).
 * Seed lives here; persisted CMS is owned by `services/navigation`.
 * Consumers must call getNavigationConfig(); do not hardcode nav arrays in layouts.
 */

export type NavLink = {
  label: string;
  href: string;
  children?: NavLink[];
  openInNewTab?: boolean;
  badgeLabel?: string;
};

export type FooterSection = {
  id: string;
  title: string;
  links: NavLink[];
};

export type SocialLink = {
  label: string;
  href: string;
};

export type NavigationConfig = {
  brand: {
    name: string;
    href: string;
    tagline: string;
  };
  primary: NavLink[];
  /** Mobile sheet links; falls back to primary when omitted. */
  mobile?: NavLink[];
  signInHref: string;
  footer: FooterSection[];
  social: SocialLink[];
  newsletter: {
    enabled: boolean;
    headline: string;
    placeholder: string;
  };
  copyrightText?: string | null;
};

export const SEEDED_NAVIGATION_CONFIG: NavigationConfig = {
  brand: {
    name: "Mendanize",
    href: "/",
    tagline: "Learn modern technology with clarity.",
  },
  primary: [
    { label: "Learn", href: "/learn" },
    { label: "Guides", href: "/guides" },
    { label: "Categories", href: "/categories" },
    { label: "AI Tools", href: "/ai-tools" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  signInHref: "/sign-in",
  footer: [
    {
      id: "categories",
      title: "Learning Categories",
      links: [
        { label: "Categories", href: "/categories" },
        { label: "Topics", href: "/topics" },
        { label: "Guides", href: "/guides" },
      ],
    },
    {
      id: "resources",
      title: "Resources",
      links: [
        { label: "Learn", href: "/learn" },
        { label: "My Learning", href: "/sign-in?callbackUrl=/learning" },
        { label: "AI Tools", href: "/ai-tools" },
        { label: "Search", href: "/search" },
        { label: "Articles", href: "/articles" },
      ],
    },
    {
      id: "company",
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "Pricing", href: "/pricing" },
      ],
    },
    {
      id: "legal",
      title: "Legal",
      links: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
      ],
    },
  ],
  social: [
    { label: "X", href: "#" },
    { label: "LinkedIn", href: "#" },
    { label: "GitHub", href: "#" },
    { label: "YouTube", href: "#" },
  ],
  newsletter: {
    enabled: true,
    headline: "Get learning tips in your inbox",
    placeholder: "you@example.com",
  },
};

/**
 * Canonical navigation read path (MES-004 / MES-016).
 * Prefers persisted Navbar Manager data; falls back to seed on failure.
 */
export async function getNavigationConfig(): Promise<NavigationConfig> {
  try {
    const { getPersistedNavigationConfig } = await import(
      "@/services/navigation/navigation"
    );
    const persisted = await getPersistedNavigationConfig();
    if (persisted) return persisted;
  } catch {
    // DB unavailable — seed fallback
  }
  return structuredClone(SEEDED_NAVIGATION_CONFIG);
}

export function getSeededNavigationConfig(): NavigationConfig {
  return SEEDED_NAVIGATION_CONFIG;
}
