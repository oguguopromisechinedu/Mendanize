export type LearnArticle = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  readMinutes: number;
  publishedAt: string;
};

export const learnArticles: LearnArticle[] = [
  {
    slug: "ai-blogging-fundamentals",
    title: "AI Blogging Fundamentals",
    excerpt:
      "Learn how to use AI responsibly to draft, edit, and publish content that ranks and converts.",
    category: "Getting started",
    tags: ["AI", "Basics", "Workflow"],
    author: "Mendanize Team",
    readMinutes: 8,
    publishedAt: "2026-01-15",
  },
  {
    slug: "seo-for-beginners",
    title: "SEO for Beginners",
    excerpt:
      "A practical guide to keywords, on-page SEO, and content structure for new bloggers.",
    category: "SEO",
    tags: ["SEO", "Keywords", "Traffic"],
    author: "Mendanize Team",
    readMinutes: 12,
    publishedAt: "2026-02-01",
  },
  {
    slug: "monetize-your-blog",
    title: "How to Monetize Your Blog",
    excerpt:
      "Affiliate marketing, digital products, and sponsorships — strategies that work in 2026.",
    category: "Monetization",
    tags: ["Revenue", "Affiliates", "Growth"],
    author: "Mendanize Team",
    readMinutes: 10,
    publishedAt: "2026-02-20",
  },
];

export function getArticleBySlug(slug: string): LearnArticle | undefined {
  return learnArticles.find((a) => a.slug === slug);
}
