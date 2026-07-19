import "./load-env";
import { getPrisma } from "../lib/db/prisma";

/**
 * Content seed — populates the models the admin dashboard reads live:
 * Article, Guide, Tool, MediaAsset (+ Topic taxonomy). Idempotent: upserts by
 * slug, and replaces media flagged with storageProvider "seed-demo".
 *
 * Uses sequential upserts (no interactive $transaction) so it works over the
 * Supabase transaction pooler.
 */

const prisma = getPrisma();

const DAY = 86_400_000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY);

function seoDescription(text: string): string {
  // Pad to >= 120 chars for a full SEO score when needed.
  return text.length >= 120 ? text : `${text} ${"Practical, up-to-date guidance for learners and builders on Mendanize.".slice(0, 130 - text.length)}`.trim();
}

async function main() {
  console.log("[seed:content] starting…");

  const admin = await prisma.user.upsert({
    where: { email: "admin@mendanize.com" },
    update: {},
    create: {
      name: "Mendanize Admin",
      email: "admin@mendanize.com",
      role: "ADMIN",
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: "editorial@mendanize.com" },
    update: {},
    create: {
      name: "Editorial Team",
      email: "editorial@mendanize.com",
      role: "EDITOR",
    },
  });

  // Categories (reuse existing seed slugs, upsert to be safe).
  const categoryData = [
    { name: "AI Fundamentals", slug: "ai-fundamentals", icon: "🤖", accentColor: "#8B5CF6" },
    { name: "Content Creation", slug: "content-creation", icon: "✍️", accentColor: "#6366F1" },
    { name: "Business Insights", slug: "business-insights", icon: "💼", accentColor: "#22D3EE" },
    { name: "Tutorials", slug: "tutorials", icon: "📚", accentColor: "#EC4899" },
  ];
  const categories: Record<string, string> = {};
  for (const [i, c] of categoryData.entries()) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { status: "ACTIVE", icon: c.icon, accentColor: c.accentColor },
      create: {
        name: c.name,
        slug: c.slug,
        description: `${c.name} — curated articles, guides and tools.`,
        icon: c.icon,
        accentColor: c.accentColor,
        status: "ACTIVE",
        featured: i < 2,
        displayOrder: i,
      },
    });
    categories[c.slug] = row.id;
  }
  console.log("✓ categories:", Object.keys(categories).length);

  // Topics (each needs a category).
  const topicData = [
    { name: "Machine Learning Basics", slug: "machine-learning-basics", cat: "ai-fundamentals" },
    { name: "Neural Networks", slug: "neural-networks", cat: "ai-fundamentals" },
    { name: "AI Writing", slug: "ai-writing", cat: "content-creation" },
    { name: "Prompt Engineering", slug: "prompt-engineering", cat: "content-creation" },
    { name: "AI Strategy", slug: "ai-strategy", cat: "business-insights" },
    { name: "Automation & ROI", slug: "automation-roi", cat: "business-insights" },
    { name: "ChatGPT Tutorials", slug: "chatgpt-tutorials", cat: "tutorials" },
    { name: "Tool Setup", slug: "tool-setup", cat: "tutorials" },
  ];
  const topics: Record<string, string> = {};
  for (const [i, t] of topicData.entries()) {
    const row = await prisma.topic.upsert({
      where: { slug: t.slug },
      update: { status: "ACTIVE", categoryId: categories[t.cat] },
      create: {
        name: t.name,
        slug: t.slug,
        description: `${t.name} explained with examples.`,
        categoryId: categories[t.cat],
        status: "ACTIVE",
        displayOrder: i,
      },
    });
    topics[t.slug] = row.id;
  }
  console.log("✓ topics:", Object.keys(topics).length);

  // Tags.
  const tagData = [
    ["OpenAI", "openai"],
    ["ChatGPT", "chatgpt"],
    ["Machine Learning", "machine-learning"],
    ["Productivity", "productivity"],
    ["Automation", "automation"],
    ["Writing", "writing"],
    ["Prompting", "prompting"],
    ["Business", "business"],
  ];
  const tags: Record<string, string> = {};
  for (const [name, slug] of tagData) {
    const row = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    tags[slug] = row.id;
  }
  console.log("✓ tags:", Object.keys(tags).length);

  // Articles.
  const articleData: Array<{
    title: string;
    slug: string;
    cat: string;
    topic: string;
    tags: string[];
    views: number;
    reading: number;
    featured: boolean;
    status: "PUBLISHED" | "DRAFT" | "SCHEDULED";
    createdDaysAgo: number;
  }> = [
    { title: "ChatGPT Complete Guide: Beginner to Power User", slug: "chatgpt-complete-guide", cat: "tutorials", topic: "chatgpt-tutorials", tags: ["chatgpt", "openai"], views: 2400, reading: 9, featured: true, status: "PUBLISHED", createdDaysAgo: 2 },
    { title: "Building AI Agents: A Step-by-Step Guide", slug: "building-ai-agents-step-by-step", cat: "ai-fundamentals", topic: "neural-networks", tags: ["machine-learning", "automation"], views: 1800, reading: 11, featured: true, status: "PUBLISHED", createdDaysAgo: 3 },
    { title: "How Transformers Actually Work", slug: "how-transformers-actually-work", cat: "ai-fundamentals", topic: "neural-networks", tags: ["machine-learning"], views: 1520, reading: 8, featured: false, status: "PUBLISHED", createdDaysAgo: 4 },
    { title: "Prompt Engineering Basics Every Creator Should Know", slug: "prompt-engineering-basics", cat: "content-creation", topic: "prompt-engineering", tags: ["prompting", "writing"], views: 1310, reading: 7, featured: true, status: "PUBLISHED", createdDaysAgo: 5 },
    { title: "How to Use AI to 10x Your Content Production", slug: "ai-10x-content-production", cat: "content-creation", topic: "ai-writing", tags: ["productivity", "writing", "openai"], views: 980, reading: 10, featured: false, status: "PUBLISHED", createdDaysAgo: 6 },
    { title: "The Business Case for AI Investment in 2026", slug: "business-case-ai-investment-2026", cat: "business-insights", topic: "ai-strategy", tags: ["business", "automation"], views: 870, reading: 12, featured: false, status: "PUBLISHED", createdDaysAgo: 8 },
    { title: "Vector Databases Compared: Pinecone vs Weaviate vs pgvector", slug: "vector-databases-compared", cat: "ai-fundamentals", topic: "machine-learning-basics", tags: ["machine-learning"], views: 760, reading: 9, featured: false, status: "PUBLISHED", createdDaysAgo: 9 },
    { title: "Retrieval-Augmented Generation (RAG) Explained", slug: "rag-explained", cat: "ai-fundamentals", topic: "machine-learning-basics", tags: ["machine-learning", "openai"], views: 690, reading: 8, featured: false, status: "PUBLISHED", createdDaysAgo: 10 },
    { title: "Automating Your Workflow with AI: A Practical Playbook", slug: "automating-workflow-with-ai", cat: "business-insights", topic: "automation-roi", tags: ["automation", "productivity"], views: 540, reading: 7, featured: false, status: "PUBLISHED", createdDaysAgo: 11 },
    { title: "Fine-Tuning vs Prompting: When to Use Which", slug: "fine-tuning-vs-prompting", cat: "content-creation", topic: "prompt-engineering", tags: ["prompting", "machine-learning"], views: 430, reading: 8, featured: false, status: "PUBLISHED", createdDaysAgo: 12 },
    { title: "Measuring ROI on AI Projects", slug: "measuring-roi-on-ai-projects", cat: "business-insights", topic: "automation-roi", tags: ["business", "automation"], views: 320, reading: 6, featured: false, status: "PUBLISHED", createdDaysAgo: 13 },
    { title: "Setting Up Your First AI Writing Assistant", slug: "setting-up-ai-writing-assistant", cat: "tutorials", topic: "tool-setup", tags: ["writing", "productivity"], views: 280, reading: 5, featured: false, status: "PUBLISHED", createdDaysAgo: 15 },
    { title: "Gemini vs ChatGPT: 2026 Comparison", slug: "gemini-vs-chatgpt-2026", cat: "tutorials", topic: "chatgpt-tutorials", tags: ["chatgpt", "openai"], views: 210, reading: 7, featured: false, status: "PUBLISHED", createdDaysAgo: 1 },
    { title: "Neural Networks for Absolute Beginners", slug: "neural-networks-for-beginners", cat: "ai-fundamentals", topic: "neural-networks", tags: ["machine-learning"], views: 160, reading: 9, featured: false, status: "PUBLISHED", createdDaysAgo: 16 },
    { title: "Advanced Prompt Patterns (Draft)", slug: "advanced-prompt-patterns", cat: "content-creation", topic: "prompt-engineering", tags: ["prompting"], views: 0, reading: 8, featured: false, status: "DRAFT", createdDaysAgo: 1 },
    { title: "AI Trends to Watch (Scheduled)", slug: "ai-trends-to-watch", cat: "business-insights", topic: "ai-strategy", tags: ["business"], views: 0, reading: 6, featured: false, status: "SCHEDULED", createdDaysAgo: 0 },
  ];

  let articleCount = 0;
  for (const a of articleData) {
    const body = `# ${a.title}\n\n${a.title} is one of the most searched topics in AI right now. This guide breaks it down with clear explanations, practical examples, and next steps.\n\n## Why it matters\n\nUnderstanding ${a.title.toLowerCase()} helps you build faster and make better decisions.\n\n## Key takeaways\n\n- Start with fundamentals\n- Practice with real examples\n- Iterate and measure results\n\n## Conclusion\n\nApply these ideas today and keep learning on Mendanize.`;
    const excerpt = `A practical, example-driven walkthrough of ${a.title.toLowerCase()} for creators, builders, and teams who want results fast.`;
    const created = daysAgo(a.createdDaysAgo);
    const imageUrl = `https://picsum.photos/seed/${a.slug}/1200/630`;

    const article = await prisma.article.upsert({
      where: { slug: a.slug },
      update: {
        title: a.title,
        status: a.status,
        featured: a.featured,
        viewCount: a.views,
        categoryId: categories[a.cat],
        topicId: topics[a.topic],
      },
      create: {
        title: a.title,
        slug: a.slug,
        excerpt,
        content: body,
        status: a.status,
        featured: a.featured,
        readingTimeMin: a.reading,
        authorId: a.featured ? admin.id : editor.id,
        categoryId: categories[a.cat],
        topicId: topics[a.topic],
        viewCount: a.views,
        publishedAt: a.status === "PUBLISHED" ? created : null,
        scheduledAt: a.status === "SCHEDULED" ? daysAgo(-3) : null,
        createdAt: created,
        seoTitle: `${a.title} | Mendanize`,
        seoDescription: seoDescription(excerpt),
        focusKeyword: a.slug.replace(/-/g, " "),
        socialImageUrl: imageUrl,
      },
    });

    await prisma.featuredImage.upsert({
      where: { articleId: article.id },
      update: { url: imageUrl },
      create: { articleId: article.id, url: imageUrl, alt: a.title },
    });

    for (const tagSlug of a.tags) {
      await prisma.articleTag.upsert({
        where: { articleId_tagId: { articleId: article.id, tagId: tags[tagSlug] } },
        update: {},
        create: { articleId: article.id, tagId: tags[tagSlug] },
      });
    }
    articleCount++;
  }
  console.log("✓ articles:", articleCount);

  // Guides (topicId required).
  const guideData: Array<{
    title: string;
    slug: string;
    cat: string;
    topic: string;
    difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    minutes: number;
    featured: boolean;
    createdDaysAgo: number;
  }> = [
    { title: "AI Literacy Path: From Zero to Confident", slug: "ai-literacy-path", cat: "ai-fundamentals", topic: "machine-learning-basics", difficulty: "BEGINNER", minutes: 120, featured: true, createdDaysAgo: 3 },
    { title: "Master Prompt Engineering", slug: "master-prompt-engineering", cat: "content-creation", topic: "prompt-engineering", difficulty: "INTERMEDIATE", minutes: 90, featured: true, createdDaysAgo: 5 },
    { title: "Build a RAG App End-to-End", slug: "build-a-rag-app", cat: "ai-fundamentals", topic: "neural-networks", difficulty: "ADVANCED", minutes: 180, featured: false, createdDaysAgo: 7 },
    { title: "AI for Business Leaders", slug: "ai-for-business-leaders", cat: "business-insights", topic: "ai-strategy", difficulty: "BEGINNER", minutes: 75, featured: false, createdDaysAgo: 9 },
    { title: "ChatGPT Productivity Bootcamp", slug: "chatgpt-productivity-bootcamp", cat: "tutorials", topic: "chatgpt-tutorials", difficulty: "BEGINNER", minutes: 60, featured: false, createdDaysAgo: 11 },
    { title: "Automate Your Content Pipeline", slug: "automate-content-pipeline", cat: "business-insights", topic: "automation-roi", difficulty: "INTERMEDIATE", minutes: 100, featured: false, createdDaysAgo: 13 },
  ];

  let guideCount = 0;
  for (const g of guideData) {
    const created = daysAgo(g.createdDaysAgo);
    const guide = await prisma.guide.upsert({
      where: { slug: g.slug },
      update: { status: "PUBLISHED", featured: g.featured, categoryId: categories[g.cat], topicId: topics[g.topic] },
      create: {
        title: g.title,
        slug: g.slug,
        shortDescription: `${g.title} — a structured, hands-on learning path.`,
        fullDescription: `This guide walks you through ${g.title.toLowerCase()} with lessons, examples, and checkpoints so you can learn by doing.`,
        coverImageUrl: `https://picsum.photos/seed/${g.slug}/1200/630`,
        coverImageAlt: g.title,
        status: "PUBLISHED",
        difficulty: g.difficulty,
        estimatedMinutes: g.minutes,
        learningObjectives: ["Understand core concepts", "Apply them to real projects", "Ship a working result"],
        prerequisites: ["Basic computer skills", "Curiosity"],
        featured: g.featured,
        authorId: admin.id,
        categoryId: categories[g.cat],
        topicId: topics[g.topic],
        publishedAt: created,
        createdAt: created,
        seoTitle: `${g.title} | Mendanize Guides`,
        seoDescription: seoDescription(`Learn ${g.title.toLowerCase()} step by step with practical lessons and examples.`),
        focusKeyword: g.slug.replace(/-/g, " "),
        sections: {
          create: [
            {
              title: "Getting Started",
              slug: "getting-started",
              description: "Set the foundation.",
              sortOrder: 0,
              lessons: {
                create: [
                  { title: "Introduction", slug: "introduction", content: "Welcome to the guide.", readingTimeMin: 4, sortOrder: 0 },
                  { title: "Core Concepts", slug: "core-concepts", content: "The building blocks you need.", readingTimeMin: 6, sortOrder: 1 },
                ],
              },
            },
            {
              title: "Hands-On",
              slug: "hands-on",
              description: "Apply what you learned.",
              sortOrder: 1,
              lessons: {
                create: [
                  { title: "Your First Project", slug: "first-project", content: "Build something real.", readingTimeMin: 8, sortOrder: 0 },
                ],
              },
            },
          ],
        },
      },
    });
    guideCount++;
    void guide;
  }
  console.log("✓ guides:", guideCount);

  // Tools.
  const toolData: Array<{
    name: string;
    slug: string;
    developer: string;
    pricing: "FREE" | "FREEMIUM" | "PAID" | "ENTERPRISE";
    difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    featured: boolean;
    cats: string[];
  }> = [
    { name: "ChatGPT", slug: "chatgpt", developer: "OpenAI", pricing: "FREEMIUM", difficulty: "BEGINNER", featured: true, cats: ["ai-fundamentals", "content-creation"] },
    { name: "Claude", slug: "claude", developer: "Anthropic", pricing: "FREEMIUM", difficulty: "BEGINNER", featured: true, cats: ["content-creation"] },
    { name: "Gemini", slug: "gemini", developer: "Google", pricing: "FREEMIUM", difficulty: "BEGINNER", featured: false, cats: ["ai-fundamentals"] },
    { name: "Midjourney", slug: "midjourney", developer: "Midjourney", pricing: "PAID", difficulty: "INTERMEDIATE", featured: true, cats: ["content-creation"] },
    { name: "DALL·E 3", slug: "dall-e-3", developer: "OpenAI", pricing: "FREEMIUM", difficulty: "BEGINNER", featured: false, cats: ["content-creation"] },
    { name: "Perplexity", slug: "perplexity", developer: "Perplexity AI", pricing: "FREEMIUM", difficulty: "BEGINNER", featured: false, cats: ["business-insights"] },
    { name: "Cursor", slug: "cursor", developer: "Anysphere", pricing: "FREEMIUM", difficulty: "INTERMEDIATE", featured: false, cats: ["tutorials"] },
    { name: "Zapier AI", slug: "zapier-ai", developer: "Zapier", pricing: "FREEMIUM", difficulty: "INTERMEDIATE", featured: false, cats: ["business-insights"] },
  ];

  let toolCount = 0;
  for (const [i, t] of toolData.entries()) {
    const tool = await prisma.tool.upsert({
      where: { slug: t.slug },
      update: { status: "PUBLISHED", featured: t.featured },
      create: {
        name: t.name,
        slug: t.slug,
        shortDescription: `${t.name} by ${t.developer} — a leading AI tool.`,
        fullDescription: `${t.name} helps you work faster with AI. Learn what it does, who it's for, and how to get started.`,
        websiteUrl: `https://example.com/${t.slug}`,
        developer: t.developer,
        platforms: ["Web", "API"],
        availability: "AVAILABLE",
        pricing: t.pricing,
        difficulty: t.difficulty,
        recommendedFor: ["Creators", "Developers", "Teams"],
        learningOutcomes: ["Understand capabilities", "Use it effectively"],
        featured: t.featured,
        status: "PUBLISHED",
        publishedAt: daysAgo(i + 2),
        createdAt: daysAgo(i + 2),
        seoTitle: `${t.name} Review & Guide | Mendanize`,
        seoDescription: seoDescription(`Everything you need to know about ${t.name}: features, pricing, and how to get started.`),
        focusKeyword: t.name.toLowerCase(),
      },
    });
    for (const catSlug of t.cats) {
      await prisma.toolCategoryRelation.upsert({
        where: { toolId_categoryId: { toolId: tool.id, categoryId: categories[catSlug] } },
        update: {},
        create: { toolId: tool.id, categoryId: categories[catSlug] },
      });
    }
    toolCount++;
  }
  console.log("✓ tools:", toolCount);

  // Media assets — replace previous demo batch so re-runs stay idempotent.
  await prisma.mediaAsset.deleteMany({ where: { storageProvider: "seed-demo" } });

  const mediaAssets: Array<{
    filename: string;
    mime: string;
    width: number;
    height: number;
    size: number;
    createdDaysAgo: number;
  }> = [];

  // 22 images.
  for (let i = 1; i <= 22; i++) {
    mediaAssets.push({
      filename: `demo-image-${i}.webp`,
      mime: "image/webp",
      width: 1200,
      height: 630,
      size: 180_000 + i * 12_000,
      createdDaysAgo: (i % 14) + 1,
    });
  }
  // 6 videos.
  for (let i = 1; i <= 6; i++) {
    mediaAssets.push({
      filename: `demo-video-${i}.mp4`,
      mime: "video/mp4",
      width: 1920,
      height: 1080,
      size: 8_000_000 + i * 1_500_000,
      createdDaysAgo: (i % 14) + 1,
    });
  }

  await prisma.mediaAsset.createMany({
    data: mediaAssets.map((m, i) => ({
      filename: m.filename,
      originalName: m.filename,
      mimeType: m.mime,
      url:
        m.mime.startsWith("image/")
          ? `https://picsum.photos/seed/media-${i}/1200/630`
          : `https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`,
      storageKey: `seed-demo/${m.filename}`,
      storageProvider: "seed-demo",
      width: m.width,
      height: m.height,
      sizeBytes: m.size,
      altText: m.mime.startsWith("image/") ? `Demo image ${i}` : `Demo video ${i}`,
      status: "ACTIVE",
      visibility: "PUBLIC",
      featured: i < 4,
      uploadedById: admin.id,
      createdAt: daysAgo(m.createdDaysAgo),
      lastUsedAt: daysAgo(m.createdDaysAgo),
    })),
  });
  const imageTotal = mediaAssets.filter((m) => m.mime.startsWith("image/")).length;
  const videoTotal = mediaAssets.filter((m) => m.mime.startsWith("video/")).length;
  console.log(`✓ media: ${imageTotal} images, ${videoTotal} videos`);

  // Recent subscribers (activity feed).
  await prisma.subscriber.upsert({
    where: { email: "newlearner@example.com" },
    update: {},
    create: { email: "newlearner@example.com", name: "New Learner", status: "active", categories: ["ai-fundamentals"] },
  });

  console.log("[seed:content] done.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("[seed:content] failed:", e);
    process.exit(1);
  });
