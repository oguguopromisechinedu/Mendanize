/**
 * Seed well-known AI tools into the marketplace catalog (Tool model).
 * Uses factual names/websites + short original blurbs. Logos/covers are
 * placeholders so admins can replace assets later.
 *
 * Usage: npm run db:seed:ai-tools
 */
import "../prisma/load-env";
import { getPrisma } from "../lib/db/prisma";
import type { MarketplaceListingSource, ToolPricing } from "@prisma/client";

const prisma = getPrisma();

type SeedTool = {
  name: string
  slug: string
  developer: string
  websiteUrl: string
  documentationUrl?: string
  shortDescription: string
  pricing: ToolPricing
  platforms: string[]
  aiCapabilities: string[]
  tags: string[]
  source: MarketplaceListingSource
  featured?: boolean
  verified?: boolean
}

const SEED_TOOLS: SeedTool[] = [
  {
    name: "ChatGPT",
    slug: "chatgpt",
    developer: "OpenAI",
    websiteUrl: "https://chatgpt.com",
    documentationUrl: "https://platform.openai.com/docs",
    shortDescription: "General-purpose conversational AI for writing, coding, and research.",
    pricing: "FREEMIUM",
    platforms: ["Web", "Windows", "macOS", "iOS", "Android", "API"],
    aiCapabilities: ["Chat", "Code assistance", "Writing"],
    tags: ["LLM", "Chat"],
    source: "THIRD_PARTY",
    featured: true,
    verified: true,
  },
  {
    name: "Claude",
    slug: "claude",
    developer: "Anthropic",
    websiteUrl: "https://claude.ai",
    documentationUrl: "https://docs.anthropic.com",
    shortDescription: "Long-context assistant for careful analysis, writing, and coding.",
    pricing: "FREEMIUM",
    platforms: ["Web", "API"],
    aiCapabilities: ["Chat", "Long-context reasoning", "Writing"],
    tags: ["LLM", "Writing"],
    source: "THIRD_PARTY",
    featured: true,
    verified: true,
  },
  {
    name: "Gemini",
    slug: "gemini",
    developer: "Google",
    websiteUrl: "https://gemini.google.com",
    documentationUrl: "https://ai.google.dev/docs",
    shortDescription: "Google’s multimodal AI assistant across text, images, and apps.",
    pricing: "FREEMIUM",
    platforms: ["Web", "Android", "iOS", "API"],
    aiCapabilities: ["Chat", "Multimodal", "Search assistance"],
    tags: ["LLM", "Multimodal"],
    source: "THIRD_PARTY",
    featured: true,
    verified: true,
  },
  {
    name: "Perplexity",
    slug: "perplexity",
    developer: "Perplexity AI",
    websiteUrl: "https://www.perplexity.ai",
    shortDescription: "Answer engine that cites sources while researching topics.",
    pricing: "FREEMIUM",
    platforms: ["Web", "iOS", "Android"],
    aiCapabilities: ["Research", "Cited answers", "Chat"],
    tags: ["Search", "Research"],
    source: "THIRD_PARTY",
    featured: true,
    verified: true,
  },
  {
    name: "Midjourney",
    slug: "midjourney",
    developer: "Midjourney",
    websiteUrl: "https://www.midjourney.com",
    shortDescription: "Text-to-image generation for concept art and visual exploration.",
    pricing: "PAID",
    platforms: ["Web"],
    aiCapabilities: ["Image generation"],
    tags: ["Image", "Design"],
    source: "THIRD_PARTY",
    verified: true,
  },
  {
    name: "Canva AI",
    slug: "canva-ai",
    developer: "Canva",
    websiteUrl: "https://www.canva.com",
    shortDescription: "Design suite with AI helpers for layouts, copy, and image edits.",
    pricing: "FREEMIUM",
    platforms: ["Web", "Windows", "macOS", "iOS", "Android"],
    aiCapabilities: ["Design assistance", "Image editing", "Copywriting"],
    tags: ["Design", "Marketing"],
    source: "THIRD_PARTY",
    verified: true,
  },
  {
    name: "Cursor",
    slug: "cursor",
    developer: "Anysphere",
    websiteUrl: "https://cursor.com",
    documentationUrl: "https://docs.cursor.com",
    shortDescription: "AI-native code editor for editing, refactoring, and agentic coding.",
    pricing: "FREEMIUM",
    platforms: ["Windows", "macOS", "Linux"],
    aiCapabilities: ["Code generation", "Code chat", "Refactoring"],
    tags: ["IDE", "Coding"],
    source: "THIRD_PARTY",
    featured: true,
    verified: true,
  },
  {
    name: "GitHub Copilot",
    slug: "github-copilot",
    developer: "GitHub",
    websiteUrl: "https://github.com/features/copilot",
    documentationUrl: "https://docs.github.com/copilot",
    shortDescription: "AI pair programmer that suggests code inside popular editors.",
    pricing: "PAID",
    platforms: ["Windows", "macOS", "Linux", "Web"],
    aiCapabilities: ["Code completion", "Code chat"],
    tags: ["Coding", "IDE"],
    source: "THIRD_PARTY",
    featured: true,
    verified: true,
  },
  {
    name: "ElevenLabs",
    slug: "elevenlabs",
    developer: "ElevenLabs",
    websiteUrl: "https://elevenlabs.io",
    documentationUrl: "https://elevenlabs.io/docs",
    shortDescription: "Voice synthesis and cloning for narration, agents, and media.",
    pricing: "FREEMIUM",
    platforms: ["Web", "API"],
    aiCapabilities: ["Text to speech", "Voice cloning"],
    tags: ["Audio", "Voice"],
    source: "THIRD_PARTY",
    verified: true,
  },
  {
    name: "Runway",
    slug: "runway",
    developer: "Runway",
    websiteUrl: "https://runwayml.com",
    shortDescription: "Generative video tools for creators and production teams.",
    pricing: "FREEMIUM",
    platforms: ["Web"],
    aiCapabilities: ["Video generation", "Video editing"],
    tags: ["Video", "Creative"],
    source: "THIRD_PARTY",
    verified: true,
  },
  {
    name: "NotebookLM",
    slug: "notebooklm",
    developer: "Google",
    websiteUrl: "https://notebooklm.google",
    shortDescription: "Research notebook that grounds answers in your uploaded sources.",
    pricing: "FREE",
    platforms: ["Web"],
    aiCapabilities: ["Document Q&A", "Summarization", "Audio overviews"],
    tags: ["Research", "Notes"],
    source: "THIRD_PARTY",
    verified: true,
  },
  {
    name: "Grammarly",
    slug: "grammarly",
    developer: "Grammarly",
    websiteUrl: "https://www.grammarly.com",
    shortDescription: "Writing assistant for grammar, clarity, and tone suggestions.",
    pricing: "FREEMIUM",
    platforms: ["Web", "Windows", "macOS", "iOS", "Android"],
    aiCapabilities: ["Writing assistance", "Grammar checking"],
    tags: ["Writing", "Productivity"],
    source: "THIRD_PARTY",
    verified: true,
  },
  {
    name: "Notion AI",
    slug: "notion-ai",
    developer: "Notion",
    websiteUrl: "https://www.notion.com/product/ai",
    shortDescription: "Workspace AI for drafting, summarizing, and organizing notes.",
    pricing: "PAID",
    platforms: ["Web", "Windows", "macOS", "iOS", "Android"],
    aiCapabilities: ["Writing", "Summarization", "Knowledge Q&A"],
    tags: ["Productivity", "Notes"],
    source: "THIRD_PARTY",
    verified: true,
  },
  {
    name: "Gamma",
    slug: "gamma",
    developer: "Gamma",
    websiteUrl: "https://gamma.app",
    shortDescription: "AI-assisted presentations and docs with modern layouts.",
    pricing: "FREEMIUM",
    platforms: ["Web"],
    aiCapabilities: ["Presentation generation", "Writing"],
    tags: ["Presentations", "Design"],
    source: "THIRD_PARTY",
    verified: true,
  },
  {
    name: "Zapier AI",
    slug: "zapier-ai",
    developer: "Zapier",
    websiteUrl: "https://zapier.com/ai",
    shortDescription: "Automation platform with AI helpers for building workflows.",
    pricing: "FREEMIUM",
    platforms: ["Web"],
    aiCapabilities: ["Automation", "Workflow building"],
    tags: ["Automation", "Productivity"],
    source: "THIRD_PARTY",
    verified: true,
  },
  {
    name: "Lovable",
    slug: "lovable",
    developer: "Lovable",
    websiteUrl: "https://lovable.dev",
    shortDescription: "AI app builder for turning product ideas into working UIs.",
    pricing: "FREEMIUM",
    platforms: ["Web"],
    aiCapabilities: ["App generation", "Code generation"],
    tags: ["No-code", "Coding"],
    source: "THIRD_PARTY",
    verified: true,
  },
  {
    name: "Bolt",
    slug: "bolt",
    developer: "StackBlitz",
    websiteUrl: "https://bolt.new",
    shortDescription: "Browser-based AI coding environment for rapid prototypes.",
    pricing: "FREEMIUM",
    platforms: ["Web"],
    aiCapabilities: ["Code generation", "Full-stack scaffolding"],
    tags: ["Coding", "Prototyping"],
    source: "THIRD_PARTY",
    verified: true,
  },
  {
    name: "Replit AI",
    slug: "replit-ai",
    developer: "Replit",
    websiteUrl: "https://replit.com/ai",
    shortDescription: "Cloud IDE with AI assistance for building and deploying apps.",
    pricing: "FREEMIUM",
    platforms: ["Web"],
    aiCapabilities: ["Code generation", "Debugging", "Deployment help"],
    tags: ["Coding", "Cloud IDE"],
    source: "THIRD_PARTY",
    verified: true,
  },
  {
    name: "Figma AI",
    slug: "figma-ai",
    developer: "Figma",
    websiteUrl: "https://www.figma.com",
    shortDescription: "Design platform features that accelerate UI ideation with AI.",
    pricing: "FREEMIUM",
    platforms: ["Web", "Windows", "macOS"],
    aiCapabilities: ["Design assistance", "Asset generation"],
    tags: ["Design", "UI"],
    source: "THIRD_PARTY",
    verified: true,
  },
  {
    name: "Leonardo AI",
    slug: "leonardo-ai",
    developer: "Leonardo Interactive",
    websiteUrl: "https://leonardo.ai",
    shortDescription: "Creative image generation platform for game and media assets.",
    pricing: "FREEMIUM",
    platforms: ["Web"],
    aiCapabilities: ["Image generation", "Asset creation"],
    tags: ["Image", "Creative"],
    source: "THIRD_PARTY",
    verified: true,
  },
  {
    name: "Mendanize Ask",
    slug: "mendanize-ask",
    developer: "Mendanize",
    websiteUrl: "https://mendanize.com",
    shortDescription: "In-product AI tutor for guided learning on the Mendanize platform.",
    pricing: "FREEMIUM",
    platforms: ["Web"],
    aiCapabilities: ["Tutoring", "Q&A", "Learning guidance"],
    tags: ["Education", "Official"],
    source: "OFFICIAL",
    featured: true,
    verified: true,
  },
  {
    name: "Mendanize Prompt Studio",
    slug: "mendanize-prompt-studio",
    developer: "Mendanize",
    websiteUrl: "https://mendanize.com",
    shortDescription: "Prompt library and practice flows built into the learner workspace.",
    pricing: "FREE",
    platforms: ["Web"],
    aiCapabilities: ["Prompting practice", "Template reuse"],
    tags: ["Education", "Prompts"],
    source: "BUILT_ON_MENDANIZE",
    featured: true,
    verified: true,
  },
  {
    name: "Sora",
    slug: "sora",
    developer: "OpenAI",
    websiteUrl: "https://openai.com/sora",
    shortDescription: "Text-to-video research product for cinematic generative clips.",
    pricing: "PAID",
    platforms: ["Web"],
    aiCapabilities: ["Video generation"],
    tags: ["Video"],
    source: "THIRD_PARTY",
  },
  {
    name: "Adobe Firefly",
    slug: "adobe-firefly",
    developer: "Adobe",
    websiteUrl: "https://www.adobe.com/products/firefly.html",
    shortDescription: "Generative creative tools integrated across Adobe apps.",
    pricing: "FREEMIUM",
    platforms: ["Web", "Windows", "macOS"],
    aiCapabilities: ["Image generation", "Creative editing"],
    tags: ["Design", "Creative"],
    source: "THIRD_PARTY",
    verified: true,
  },
  {
    name: "Hugging Face",
    slug: "hugging-face",
    developer: "Hugging Face",
    websiteUrl: "https://huggingface.co",
    documentationUrl: "https://huggingface.co/docs",
    shortDescription: "Open model hub and tooling for hosting, demos, and inference.",
    pricing: "FREEMIUM",
    platforms: ["Web", "API"],
    aiCapabilities: ["Model hosting", "Inference", "Datasets"],
    tags: ["Open source", "MLOps"],
    source: "THIRD_PARTY",
    verified: true,
  },
]

function placeholderLogo(slug: string) {
  return `https://placehold.co/128x128/png?text=${encodeURIComponent(slug.slice(0, 8))}`
}

function placeholderCover(slug: string) {
  return `https://placehold.co/1200x630/png?text=${encodeURIComponent(slug)}`
}

async function ensureTag(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return prisma.tag.upsert({
    where: { slug },
    create: { name, slug },
    update: { name },
  })
}

async function main() {
  console.log(`[seed:ai-tools] upserting ${SEED_TOOLS.length} tools…`)
  for (const tool of SEED_TOOLS) {
    const tagRows = await Promise.all(tool.tags.map((t) => ensureTag(t)))
    const existing = await prisma.tool.findUnique({ where: { slug: tool.slug } })
    const data = {
      name: tool.name,
      shortDescription: tool.shortDescription,
      fullDescription: `<p>${tool.shortDescription}</p><p>Asset placeholders are intentional — replace logo and cover in Admin when you have licensed artwork.</p>`,
      websiteUrl: tool.websiteUrl,
      documentationUrl: tool.documentationUrl ?? null,
      developer: tool.developer,
      platforms: tool.platforms,
      aiCapabilities: tool.aiCapabilities,
      pricing: tool.pricing,
      featured: tool.featured ?? false,
      verified: tool.verified ?? false,
      source: tool.source,
      status: "PUBLISHED" as const,
      publishedAt: new Date(),
    }

    if (existing) {
      await prisma.toolTag.deleteMany({ where: { toolId: existing.id } })
      await prisma.toolImage.deleteMany({ where: { toolId: existing.id } })
      await prisma.tool.update({
        where: { id: existing.id },
        data: {
          ...data,
          tags: {
            create: tagRows.map((tag) => ({ tagId: tag.id })),
          },
          images: {
            create: [
              {
                url: placeholderLogo(tool.slug),
                alt: `${tool.name} logo placeholder`,
                kind: "LOGO",
                sortOrder: 0,
              },
              {
                url: placeholderCover(tool.slug),
                alt: `${tool.name} cover placeholder`,
                kind: "COVER",
                sortOrder: 0,
              },
            ],
          },
        },
      })
    } else {
      await prisma.tool.create({
        data: {
          slug: tool.slug,
          ...data,
          tags: {
            create: tagRows.map((tag) => ({ tagId: tag.id })),
          },
          images: {
            create: [
              {
                url: placeholderLogo(tool.slug),
                alt: `${tool.name} logo placeholder`,
                kind: "LOGO",
                sortOrder: 0,
              },
              {
                url: placeholderCover(tool.slug),
                alt: `${tool.name} cover placeholder`,
                kind: "COVER",
                sortOrder: 0,
              },
            ],
          },
        },
      })
    }
    console.log(`  ✓ ${tool.name}`)
  }
  console.log("[seed:ai-tools] done.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    // Shared Prisma pool is process-global; exit cleanly after seed.
    process.exit(0)
  })
