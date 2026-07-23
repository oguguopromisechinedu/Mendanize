/** Homepage content types (MES-005) — CMS-shaped for MES-013. */

export type HomepageSectionId =
  | "hero"
  | "ask"
  | "stats"
  | "categories"
  | "paths"
  | "articles"
  | "tools"
  | "why"
  | "testimonials"
  | "newsletter"
  | "faq"
  | "finalCta";

export type HomepageSectionMeta = {
  id: HomepageSectionId;
  visible: boolean;
  order: number;
  title?: string | null;
  spacing?: string;
};

export type HeroContent = {
  brand: string;
  eyebrow?: string;
  headline: string;
  /** Second line before accent, e.g. "Master" → "Master Ai." */
  headlineLead?: string;
  headlineAccent?: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  trustLine: string;
  showAskInHero?: boolean;
  imageUrl?: string | null;
  backgroundGradient?: string | null;
};

export type AskContent = {
  title: string;
  description: string;
  placeholder: string;
  suggestions: string[];
};

export type StatItem = {
  id: string;
  label: string;
  value: string;
  icon?: string;
};

export type CategoryItem = {
  id: string;
  title: string;
  description?: string;
  href: string;
  articleCount?: number;
  icon: string;
  iconColor?: string;
};

export type PathItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  difficulty: string;
  duration: string;
  lessons: number;
};

export type ArticleItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  category: string;
  readingTime: string;
  author: string;
  date: string;
  imageUrl?: string | null;
};

export type ToolItem = {
  id: string;
  name: string;
  description: string;
  href: string;
  category: string;
  rating: string;
};

export type WhyItem = {
  id: string;
  title: string;
  description: string;
  icon?: string;
};

export type TestimonialItem = {
  id: string;
  quote: string;
  name: string;
  role: string;
};

export type NewsletterContent = {
  headline: string;
  description: string;
  privacy: string;
  placeholder: string;
  ctaLabel: string;
  socialProof?: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type FinalCtaContent = {
  headline: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};

export type HomepageContent = {
  sections: HomepageSectionMeta[];
  hero: HeroContent;
  ask: AskContent;
  stats: StatItem[];
  categories: CategoryItem[];
  paths: PathItem[];
  articles: ArticleItem[];
  latestArticles: ArticleItem[];
  tools: ToolItem[];
  why: WhyItem[];
  testimonials: TestimonialItem[];
  newsletter: NewsletterContent;
  faq: FaqItem[];
  finalCta: FinalCtaContent;
};
