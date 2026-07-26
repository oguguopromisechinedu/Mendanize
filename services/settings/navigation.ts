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

export type PopularTopic = {
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
  /** Footer chip row (MES-004 Popular Topics). */
  popularTopics: PopularTopic[];
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
    { label: "Community", href: "/community" },
  ],
  signInHref: "/sign-in",
  footer: [
    {
      id: "explore",
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
        { label: "My Learning", href: "/my-learning" },
        { label: "AI Tools", href: "/ai-tools" },
        { label: "Search", href: "/search" },
        { label: "Articles", href: "/articles" },
        { label: "Community", href: "/community" },
        { label: "Prompt Library", href: "/prompt-library" },
        { label: "Newsletter", href: "/newsletter" },
        { label: "Free Resources", href: "/free-resources" },
        { label: "Glossary", href: "/glossary" },
        { label: "AI Courses", href: "/ai-courses" },
      ],
    },
    {
      id: "company",
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "Pricing", href: "/pricing" },
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
  popularTopics: [
    { label: "ChatGPT", href: "/search?q=ChatGPT" },
    { label: "Claude", href: "/search?q=Claude" },
    { label: "Gemini", href: "/search?q=Gemini" },
    { label: "Midjourney", href: "/search?q=Midjourney" },
    { label: "AI Agents", href: "/search?q=AI+Agents" },
    { label: "Prompt Engineering", href: "/search?q=Prompt+Engineering" },
    { label: "OpenAI", href: "/search?q=OpenAI" },
    { label: "Stable Diffusion", href: "/search?q=Stable+Diffusion" },
    { label: "LangChain", href: "/search?q=LangChain" },
    { label: "Llama 2", href: "/search?q=Llama+2" },
    { label: "Fine-tuning", href: "/search?q=Fine-tuning" },
    { label: "Vector DB", href: "/search?q=Vector+DB" },
  ],
  newsletter: {
    enabled: true,
    headline: "Get learning tips in your inbox",
    placeholder: "diana.k@example.org",
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
