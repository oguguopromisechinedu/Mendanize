/**
 * Ask Mendanize AI — MES-019.
 * Tier 1 ephemeral Q&A + Tier 2 persisted conversations.
 * Live provider calls are deferred; replies use the AI Service mock path.
 */

import "server-only";

import type { AskContextType, MessageRole } from "@prisma/client";
import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { getRecommendations } from "@/services/recommendations";
import {
  adminActionsForQuery,
  buildAdminActionMarkdown,
  resolveAdminIntent,
} from "@/features/admin-dashboard/utils/admin-intent";
import type {
  AskConversationRecord,
  AskDashboardPayload,
  AskMessageRecord,
  AskPromptTemplateRecord,
  AskTier1Request,
  AskTier1Result,
  AskContextTypeValue,
  AskSurfaceValue,
} from "./ask-types";

export type {
  AskConversationRecord,
  AskDashboardPayload,
  AskMessageRecord,
  AskPromptTemplateRecord,
  AskTier1Request,
  AskTier1Result,
  AskContextTypeValue,
  AskSurfaceValue,
} from "./ask-types";

const AI_SETTINGS_HREF = "/dashboard/settings/ai";
const HANDOFF_TTL_MS = 1000 * 60 * 60 * 6;

const DEFAULT_SUGGESTIONS = [
  "Explain this in simpler terms",
  "What should I learn next?",
  "Give me a short study checklist",
  "How does this relate to AI tools?",
];

const ADMIN_SUGGESTIONS = [
  "Draft an article outline about AI agents",
  "Help me organize article drafts for this week",
  "Suggest SEO title and meta for this topic",
  "Write a featured-image prompt for this article",
  "Plan homepage hero copy and CMS steps",
  "Walk me through Topic → Generate → SEO → Publish",
];

const ADMIN_CMS_LINKS = [
  {
    title: "AI Studio · Generate article",
    href: "/dashboard/ai-studio/article",
    reason: "Claude draft + OpenAI image",
    entityType: "article" as const,
    entityId: "studio-article",
    slug: "studio-article",
    thumbnail: null,
    score: 100,
  },
  {
    title: "AI Studio · Image",
    href: "/dashboard/ai-studio/image",
    reason: "Generate cover art",
    entityType: "article" as const,
    entityId: "studio-image",
    slug: "studio-image",
    thumbnail: null,
    score: 95,
  },
  {
    title: "Articles CMS",
    href: "/dashboard/articles",
    reason: "Drafts, review, publish",
    entityType: "article" as const,
    entityId: "articles-cms",
    slug: "articles-cms",
    thumbnail: null,
    score: 90,
  },
  {
    title: "Categories",
    href: "/dashboard/categories",
    reason: "Organize taxonomy",
    entityType: "article" as const,
    entityId: "categories",
    slug: "categories",
    thumbnail: null,
    score: 85,
  },
  {
    title: "Homepage CMS",
    href: "/dashboard/homepage",
    reason: "Hero & home content",
    entityType: "article" as const,
    entityId: "homepage",
    slug: "homepage",
    thumbnail: null,
    score: 82,
  },
  {
    title: "Media Library",
    href: "/dashboard/media",
    reason: "Organize assets",
    entityType: "article" as const,
    entityId: "media",
    slug: "media",
    thumbnail: null,
    score: 80,
  },
  {
    title: "SEO Center",
    href: "/dashboard/seo",
    reason: "Optimize before publish",
    entityType: "article" as const,
    entityId: "seo",
    slug: "seo",
    thumbnail: null,
    score: 70,
  },
  {
    title: "Navigation",
    href: "/dashboard/navigation",
    reason: "Menus & structure",
    entityType: "article" as const,
    entityId: "navigation",
    slug: "navigation",
    thumbnail: null,
    score: 65,
  },
];

const DEFAULT_TEMPLATES: Array<Omit<AskPromptTemplateRecord, "id">> = [
  {
    slug: "explain-simply",
    name: "Explain simply",
    description: "Plain-language walkthrough",
    category: "learning",
    promptText: "Explain this topic in plain language for a beginner.",
  },
  {
    slug: "study-plan",
    name: "Study plan",
    description: "Next steps checklist",
    category: "learning",
    promptText: "Create a short study plan with 5 concrete next steps.",
  },
  {
    slug: "compare",
    name: "Compare ideas",
    description: "Contrasts and trade-offs",
    category: "analysis",
    promptText: "Compare the key ideas here and call out trade-offs.",
  },
  {
    slug: "quiz-me",
    name: "Quiz me",
    description: "Check understanding",
    category: "practice",
    promptText: "Ask me 3 questions to check my understanding, one at a time.",
  },
];

function db() {
  return getPrisma();
}

function mapMessage(row: {
  id: string;
  role: MessageRole;
  content: string;
  model: string | null;
  createdAt: Date;
}): AskMessageRecord {
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    model: row.model,
    createdAt: row.createdAt.toISOString(),
  };
}

function mapConversation(row: {
  id: string;
  title: string;
  contextType: AskContextType;
  contextId: string | null;
  contextTitle: string | null;
  handoffId: string | null;
  updatedAt: Date;
  createdAt: Date;
  messages: Array<{
    id: string;
    role: MessageRole;
    content: string;
    model: string | null;
    createdAt: Date;
  }>;
}): AskConversationRecord {
  return {
    id: row.id,
    title: row.title,
    contextType: row.contextType,
    contextId: row.contextId,
    contextTitle: row.contextTitle,
    handoffId: row.handoffId,
    updatedAt: row.updatedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    messages: row.messages.map(mapMessage),
  };
}

async function ensureTemplates(): Promise<void> {
  if (!isDatabaseConfigured()) return;
  const count = await db().askPromptTemplate.count();
  if (count > 0) return;
  await db().askPromptTemplate.createMany({
    data: DEFAULT_TEMPLATES.map((t, sortOrder) => ({
      ...t,
      sortOrder,
      updatedAt: new Date(),
    })),
  });
}

function buildSystemPrompt(input: {
  contextType: AskContextTypeValue;
  contextTitle?: string | null;
  contextExcerpt?: string | null;
  surface?: AskSurfaceValue;
}): string {
  const title = input.contextTitle?.trim() || "Mendanize learning content";
  const excerpt = input.contextExcerpt?.trim();
  const surface = input.surface ?? "public";

  if (surface === "admin") {
    return [
      "You are Ask Mendanize Admin, the dashboard assistant for editors and admins.",
      "You handle BOTH generating content AND organizing the CMS/system.",
      "Generate: article outlines, full drafts, image prompts, video briefs, SEO copy, publish checklists.",
      "Organize: prioritize drafts, taxonomy (categories/topics), homepage/nav, media library, SEO queues, analytics review, subscriber messaging, settings guidance.",
      "Never treat the public live website as the source of truth.",
      "Do not recommend or cite public frontend URLs (/blog, /guides, /tools) as content inventory.",
      "Prefer admin CMS workflows: AI Studio → Article Editor → SEO → Review → Publish.",
      "When suggesting next steps, name concrete dashboard routes (e.g. /dashboard/articles, /dashboard/categories).",
      "If the request is organizational, give a clear action plan with ordered CMS steps.",
      "If the request is generative, produce paste-ready markdown the editor can use in AI Studio or the Article Editor.",
      `Context type: ${input.contextType}.`,
      `Current admin context: ${title}.`,
      excerpt ? `Working excerpt / brief:\n${excerpt.slice(0, 2000)}` : null,
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    "You are Ask Mendanize, an educational article writer for learners.",
    "Write a short, clear mini-article in markdown (not a chatty reply).",
    "Structure: title heading, 2–4 short sections, one practical example, and a quick next-steps list.",
    "Be accurate and encouraging. Prefer teaching over hype.",
    `Context type: ${input.contextType}.`,
    `Current page / topic: ${title}.`,
    excerpt ? `Context excerpt:\n${excerpt.slice(0, 2000)}` : null,
    "If information is missing, say what you would need. Do not invent citations.",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Fast Ask replies: optional OpenAI with short timeout, else local placeholder.
 * Avoids the Studio article-generation path so public Ask stays responsive.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(fallback);
      });
  });
}

function placeholderAskReply(input: {
  question: string;
  contextTitle?: string | null;
  providerNote?: string | null;
}): { content: string; model: string; placeholder: boolean } {
  const title = input.contextTitle?.trim() || "this topic";
  const note = input.providerNote?.trim();
  return {
    content: [
      `### ${title}`,
      ``,
      `> ${input.question.trim()}`,
      ``,
      note ? `_${note}_` : null,
      note ? `` : null,
      `Here's a clear starting point:`,
      ``,
      `**What it means**`,
      `Break the question into the core idea, why it matters, and one practical example you can try next.`,
      ``,
      `**Suggested approach**`,
      `1. Restate the concept in one sentence.`,
      `2. Compare it to something you already know.`,
      `3. Open a related guide below and apply one step today.`,
      ``,
      `Sign in to continue this conversation with full Ask Mendanize history and prompt templates.`,
    ]
      .filter((line) => line !== null)
      .join("\n"),
    model: "local_mock",
    placeholder: true,
  };
}

type LiveAskReply = {
  content: string;
  model: string;
  placeholder: boolean;
  provider: "anthropic" | "openai" | "local_mock";
};

type AskImageResult = {
  url: string;
  alt: string;
  model: string;
  placeholder: boolean;
};

async function openaiAskReply(input: {
  prompt: string;
  system: string;
}): Promise<LiveAskReply | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({
      apiKey: key,
      timeout: 25_000,
      maxRetries: 1,
    });
    const completion = await client.chat.completions.create({
      model:
        process.env.OPENAI_ASK_MODEL ||
        process.env.OPENAI_STUDIO_MODEL ||
        "gpt-4o-mini",
      messages: [
        { role: "system", content: input.system },
        { role: "user", content: input.prompt },
      ],
    });
    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) return null;
    return {
      content,
      model: completion.model,
      placeholder: false,
      provider: "openai",
    };
  } catch (error) {
    console.error(
      "[ask] OpenAI article reply failed:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

async function anthropicAskReply(input: {
  prompt: string;
  system: string;
}): Promise<LiveAskReply | null> {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) return null;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45_000);
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:
          process.env.ANTHROPIC_ASK_MODEL ||
          process.env.ANTHROPIC_MODEL ||
          "claude-3-5-sonnet-latest",
        max_tokens: 2200,
        system: input.system,
        messages: [{ role: "user", content: input.prompt }],
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[ask] Anthropic article failed:", res.status, detail.slice(0, 240));
      return null;
    }

    const json = (await res.json()) as {
      model?: string;
      content?: Array<{ type?: string; text?: string }>;
    };
    const content = json.content
      ?.filter((part) => part.type === "text" && part.text)
      .map((part) => part.text!)
      .join("\n")
      .trim();
    if (!content) return null;

    return {
      content,
      model: json.model ?? "claude",
      placeholder: false,
      provider: "anthropic",
    };
  } catch (error) {
    console.error(
      "[ask] Anthropic article failed:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

/** OpenAI DALL·E image for the Ask question — runs alongside Anthropic article generation. */
async function openaiAskImage(input: {
  question: string;
  contextTitle?: string | null;
}): Promise<AskImageResult | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const topic = input.contextTitle?.trim() || "AI learning";
  const prompt = [
    `Educational illustration for a learning article about: ${input.question.trim()}.`,
    `Topic context: ${topic}.`,
    "Clean modern digital art, clear focal subject, no text overlays, no logos, no watermarks.",
  ].join(" ");

  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({
      apiKey: key,
      timeout: 45_000,
      maxRetries: 0,
    });
    const result = await client.images.generate({
      model: process.env.OPENAI_ASK_IMAGE_MODEL || "dall-e-3",
      prompt: prompt.slice(0, 900),
      n: 1,
      size: "1024x1024",
    });
    const url = result.data?.[0]?.url?.trim();
    if (!url) return null;
    return {
      url,
      alt: `Illustration for: ${input.question.trim()}`,
      model: process.env.OPENAI_ASK_IMAGE_MODEL || "dall-e-3",
      placeholder: false,
    };
  } catch (error) {
    console.error(
      "[ask] OpenAI image failed:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

async function generateAskArticle(input: {
  prompt: string;
  system: string;
  question: string;
  contextTitle?: string | null;
}): Promise<LiveAskReply> {
  // Anthropic owns article text; OpenAI text is fallback only.
  const anthropic = await anthropicAskReply(input);
  if (anthropic) return anthropic;

  const openai = await openaiAskReply(input);
  if (openai) return openai;

  return {
    ...placeholderAskReply({
      question: input.question,
      contextTitle: input.contextTitle,
      providerNote: Boolean(
        process.env.ANTHROPIC_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim(),
      )
        ? "Live AI providers are configured but did not return an article (check Anthropic credits / OpenAI key)."
        : null,
    }),
    provider: "local_mock",
  };
}

export async function generateAskReply(input: {
  question: string;
  contextType: AskContextTypeValue;
  contextTitle?: string | null;
  contextExcerpt?: string | null;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  surface?: AskSurfaceValue;
}): Promise<{
  content: string;
  model: string;
  placeholder: boolean;
  provider: "anthropic" | "openai" | "local_mock";
  images: AskImageResult[];
  imageProvider: "openai" | "local_mock" | "none";
}> {
  const surface = input.surface ?? "public";
  const system = buildSystemPrompt({ ...input, surface });
  const historyBlock =
    input.history
      ?.slice(-6)
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n") ?? "";

  const prompt = [
    historyBlock ? `Recent conversation:\n${historyBlock}` : null,
    surface === "admin"
      ? `Editor request / CMS topic:\n${input.question.trim()}`
      : `Learner question / article topic:\n${input.question.trim()}`,
    "",
    surface === "admin"
      ? "Respond with CMS-ready markdown. For generate requests: paste-ready draft/outline. For organize requests: ordered CMS action plan with dashboard destinations."
      : "Write a helpful educational mini-article in markdown.",
  ]
    .filter(Boolean)
    .join("\n");

  const [article, image] = await Promise.all([
    withTimeout(
      generateAskArticle({
        prompt,
        system,
        question: input.question,
        contextTitle: input.contextTitle,
      }),
      50_000,
      {
        ...placeholderAskReply({
          question: input.question,
          contextTitle: input.contextTitle,
          providerNote: "Article generation timed out — showing a local outline.",
        }),
        provider: "local_mock" as const,
      },
    ),
    withTimeout(
      openaiAskImage({
        question: input.question,
        contextTitle: input.contextTitle,
      }),
      50_000,
      null,
    ),
  ]);

  const images = image ? [image] : [];

  return {
    content: article.content,
    model: article.model,
    placeholder: article.placeholder,
    provider: article.provider,
    images,
    imageProvider: image
      ? image.placeholder
        ? "local_mock"
        : "openai"
      : "none",
  };
}

async function relatedAdminCms(limit = 4, question?: string) {
  const intentLinks = question
    ? adminActionsForQuery(question).map((a, i) => ({
        title: a.title,
        href: a.href,
        reason: a.reason,
        entityType: "article" as const,
        entityId: `intent-${i}`,
        slug: `intent-${i}`,
        thumbnail: null,
        score: 300 - i,
      }))
    : [];

  const links = [...intentLinks, ...ADMIN_CMS_LINKS].slice(0, limit);
  if (!isDatabaseConfigured()) return links;

  try {
    // Admin inventory only — drafts/review/scheduled first; never public frontend URLs.
    const drafts = await db().article.findMany({
      where: { status: { in: ["DRAFT", "REVIEW", "SCHEDULED"] } },
      orderBy: { updatedAt: "desc" },
      take: Math.max(1, limit - intentLinks.length),
      select: { id: true, title: true, status: true },
    });

    const draftLinks = drafts.map((article, i) => ({
      title: article.title,
      href: `/dashboard/articles/${article.id}`,
      reason: `CMS ${article.status.toLowerCase()}`,
      entityType: "article" as const,
      entityId: article.id,
      slug: article.id,
      thumbnail: null,
      score: 200 - i,
    }));

    const merged = [...intentLinks, ...draftLinks, ...ADMIN_CMS_LINKS];
    const seen = new Set<string>();
    return merged
      .filter((l) => {
        if (seen.has(l.href)) return false;
        seen.add(l.href);
        return true;
      })
      .slice(0, limit);
  } catch {
    return links;
  }
}

async function relatedForContext(input: {
  contextType: AskContextTypeValue;
  contextId?: string | null;
  surface?: AskSurfaceValue;
  question?: string;
}) {
  const limit = 4;
  const surface = input.surface ?? "public";

  // Admin Ask must never pull live frontend / published catalog recommendations.
  if (surface === "admin") {
    return relatedAdminCms(limit, input.question);
  }

  try {
    if (input.contextType === "HOMEPAGE" || !input.contextId) {
      return [
        {
          title: "Browse learning guides",
          href: "/guides",
          reason: "Structured learning paths",
          entityType: "guide" as const,
          entityId: "guides",
          slug: "guides",
          thumbnail: null,
          score: 100,
        },
        {
          title: "Explore AI tools",
          href: "/tools",
          reason: "Curated directory",
          entityType: "ai_tool" as const,
          entityId: "tools",
          slug: "tools",
          thumbnail: null,
          score: 90,
        },
        {
          title: "Latest articles",
          href: "/blog",
          reason: "Fresh insights",
          entityType: "article" as const,
          entityId: "blog",
          slug: "blog",
          thumbnail: null,
          score: 80,
        },
        {
          title: "Search the library",
          href: "/search",
          reason: "Find any topic",
          entityType: "article" as const,
          entityId: "search",
          slug: "search",
          thumbnail: null,
          score: 70,
        },
      ].slice(0, limit);
    }
    if (input.contextType === "ARTICLE" && input.contextId) {
      const { items } = await getRecommendations({
        contextType: "article",
        contextId: input.contextId,
        limit,
      });
      return items;
    }
    if (input.contextType === "GUIDE" && input.contextId) {
      const { items } = await getRecommendations({
        contextType: "guide",
        contextId: input.contextId,
        limit,
      });
      return items;
    }
    if (input.contextType === "AI_TOOL" && input.contextId) {
      const { items } = await getRecommendations({
        contextType: "tool",
        contextId: input.contextId,
        limit,
      });
      return items;
    }
    return [];
  } catch {
    return [];
  }
}

export async function askTier1(input: AskTier1Request): Promise<AskTier1Result> {
  const question = input.question.trim();
  if (!question) {
    throw new Error("Question is required.");
  }

  const surface = input.surface ?? "public";

  // MES-031 — prefer existing knowledge before generation
  const { searchExistingKnowledge, enqueueKnowledgeGeneration } = await import(
    "./knowledge-pipeline"
  );
  const knowledgeHits = await withTimeout(
    searchExistingKnowledge(question),
    3_000,
    [],
  );
  const hasKnowledge = knowledgeHits.length > 0;

  const groundedExcerpt = hasKnowledge
    ? knowledgeHits
        .map((h, i) => `${i + 1}. ${h.title} (${h.type}) — ${h.href}`)
        .join("\n")
    : input.contextExcerpt;

  const [reply, related] = await Promise.all([
    generateAskReply({
      question,
      contextType: input.contextType,
      contextTitle: hasKnowledge
        ? "Mendanize knowledge base"
        : input.contextTitle,
      contextExcerpt: groundedExcerpt ?? input.contextExcerpt,
      surface,
    }),
    withTimeout(
      relatedForContext({
        contextType: input.contextType,
        contextId: input.contextId,
        surface,
        question,
      }),
      4_000,
      [],
    ),
  ]);

  // Knowledge gap → enqueue AI Draft asynchronously (never blocks the visitor)
  if (!hasKnowledge) {
    void enqueueKnowledgeGeneration({
      question,
      sourceSeed: `${surface}:${input.contextType ?? "none"}:${question.slice(0, 40)}`,
    });
  }

  let handoffId = `local-${Date.now()}`;
  // Persist handoff when DB is healthy; skip for homepage to keep Tier-1 instant.
  if (isDatabaseConfigured() && input.contextType !== "HOMEPAGE") {
    try {
      const handoff = await withTimeout(
        db().askHandoff.create({
          data: {
            question,
            answer: reply.content,
            contextType: input.contextType,
            contextId: input.contextId ?? null,
            contextTitle: input.contextTitle ?? null,
            expiresAt: new Date(Date.now() + HANDOFF_TTL_MS),
          },
        }),
        2_000,
        null,
      );
      if (handoff) handoffId = handoff.id;
    } catch {
      /* keep local handoff id */
    }
  }

  return {
    answer: reply.content,
    model: reply.model,
    placeholder: reply.placeholder,
    handoffId,
    images: reply.images,
    providers: {
      text: reply.provider,
      image: reply.imageProvider,
    },
    related: related.map((r) => ({
      title: r.title,
      href: r.href,
      reason: r.reason,
    })),
  };
}

export async function listAskPromptTemplates(): Promise<AskPromptTemplateRecord[]> {
  await ensureTemplates();
  if (!isDatabaseConfigured()) {
    return DEFAULT_TEMPLATES.map((t, i) => ({ ...t, id: `tpl-${i}` }));
  }
  const rows = await db().askPromptTemplate.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    category: r.category,
    promptText: r.promptText,
  }));
}

export async function listConversationsForUser(
  userId: string,
): Promise<AskDashboardPayload["conversations"]> {
  if (!isDatabaseConfigured()) return [];
  const rows = await db().conversation.findMany({
    where: { publicUserId: userId },
    orderBy: { updatedAt: "desc" },
    take: 40,
  });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    updatedAt: r.updatedAt.toISOString(),
    contextType: r.contextType,
    contextTitle: r.contextTitle,
  }));
}

export async function getConversationForUser(
  userId: string,
  conversationId: string,
): Promise<AskConversationRecord | null> {
  if (!isDatabaseConfigured()) return null;
  const row = await db().conversation.findFirst({
    where: { id: conversationId, publicUserId: userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  return row ? mapConversation(row) : null;
}

export async function createConversation(input: {
  userId: string;
  title?: string;
  contextType?: AskContextTypeValue;
  contextId?: string | null;
  contextTitle?: string | null;
  handoffId?: string | null;
}): Promise<AskConversationRecord> {
  if (!isDatabaseConfigured()) {
    throw new Error("Database not configured.");
  }
  const row = await db().conversation.create({
    data: {
      publicUserId: input.userId,
      title: input.title?.trim() || "New conversation",
      contextType: input.contextType ?? "GENERAL",
      contextId: input.contextId ?? null,
      contextTitle: input.contextTitle ?? null,
      handoffId: input.handoffId ?? null,
    },
    include: { messages: true },
  });
  return mapConversation(row);
}

export async function claimHandoff(input: {
  userId: string;
  handoffId: string;
}): Promise<AskConversationRecord | null> {
  if (!isDatabaseConfigured()) return null;
  const handoff = await db().askHandoff.findUnique({
    where: { id: input.handoffId },
  });
  if (!handoff || handoff.claimedAt || handoff.expiresAt < new Date()) {
    return null;
  }

  const title =
    handoff.question.slice(0, 60) + (handoff.question.length > 60 ? "…" : "");

  const conversation = await db().conversation.create({
    data: {
      publicUserId: input.userId,
      title,
      contextType: handoff.contextType,
      contextId: handoff.contextId,
      contextTitle: handoff.contextTitle,
      handoffId: handoff.id,
      messages: {
        create: [
          { role: "USER", content: handoff.question },
          ...(handoff.answer
            ? [
                {
                  role: "ASSISTANT" as const,
                  content: handoff.answer,
                  model: "handoff",
                },
              ]
            : []),
        ],
      },
    },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  await db().askHandoff.update({
    where: { id: handoff.id },
    data: { claimedAt: new Date() },
  });

  return mapConversation(conversation);
}

export async function sendConversationMessage(input: {
  userId: string;
  conversationId: string;
  content: string;
}): Promise<AskConversationRecord> {
  if (!isDatabaseConfigured()) {
    throw new Error("Database not configured.");
  }
  const conversation = await db().conversation.findFirst({
    where: { id: input.conversationId, publicUserId: input.userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!conversation) {
    throw new Error("Conversation not found.");
  }

  const question = input.content.trim();
  if (!question) throw new Error("Message is required.");

  await db().message.create({
    data: {
      conversationId: conversation.id,
      role: "USER",
      content: question,
    },
  });

  if (conversation.title === "New conversation") {
    await db().conversation.update({
      where: { id: conversation.id },
      data: {
        title: question.slice(0, 60) + (question.length > 60 ? "…" : ""),
      },
    });
  }

  const history = [
    ...conversation.messages.map((m) => ({
      role:
        m.role === "USER"
          ? ("user" as const)
          : ("assistant" as const),
      content: m.content,
    })),
    { role: "user" as const, content: question },
  ];

  const reply = await generateAskReply({
    question,
    contextType: conversation.contextType,
    contextTitle: conversation.contextTitle,
    history,
    surface: "admin",
  });

  const imageMarkdown = reply.images
    .map((image) => `\n\n![${image.alt}](${image.url})`)
    .join("");

  const intent = resolveAdminIntent(question);
  const cmsActions = buildAdminActionMarkdown(adminActionsForQuery(question));
  const intentNote =
    intent.kind !== "ask_general"
      ? `\n\n_Routed as **${intent.label}** — open [${intent.label}](${intent.href.split("?")[0]})._\n`
      : "";

  await db().message.create({
    data: {
      conversationId: conversation.id,
      role: "ASSISTANT",
      content: `${reply.content}${imageMarkdown}${intentNote}${cmsActions}`,
      model: reply.model,
    },
  });

  await db().conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });

  const fresh = await getConversationForUser(input.userId, conversation.id);
  if (!fresh) throw new Error("Conversation missing after send.");
  return fresh;
}

export async function submitAskFeedback(input: {
  userId?: string | null;
  conversationId?: string | null;
  messageId?: string | null;
  rating: number;
  comment?: string | null;
}): Promise<void> {
  if (!isDatabaseConfigured()) return;
  const rating = Math.min(5, Math.max(1, Math.round(input.rating)));
  await db().askFeedback.create({
    data: {
      userId: input.userId ?? null,
      conversationId: input.conversationId ?? null,
      messageId: input.messageId ?? null,
      rating,
      comment: input.comment?.trim() || null,
    },
  });
}

export async function getAskDashboard(input: {
  userId: string;
  conversationId?: string | null;
  handoffId?: string | null;
}): Promise<AskDashboardPayload> {
  await ensureTemplates();

  let active: AskConversationRecord | null = null;
  if (input.handoffId) {
    active = await claimHandoff({
      userId: input.userId,
      handoffId: input.handoffId,
    });
  }
  if (!active && input.conversationId) {
    active = await getConversationForUser(input.userId, input.conversationId);
  }

  const [conversations, templates] = await Promise.all([
    listConversationsForUser(input.userId),
    listAskPromptTemplates(),
  ]);

  if (!active && conversations[0]) {
    active = await getConversationForUser(input.userId, conversations[0].id);
  }

  return {
    conversations,
    active,
    templates,
    suggestions: ADMIN_SUGGESTIONS,
    aiSettingsHref: AI_SETTINGS_HREF,
    surface: "admin",
  };
}

export { AI_SETTINGS_HREF, DEFAULT_SUGGESTIONS, ADMIN_SUGGESTIONS };
