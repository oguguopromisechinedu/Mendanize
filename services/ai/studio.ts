/**
 * Admin AI Studio generation + history (MES-011).
 * Uses live providers when keys exist; otherwise deterministic local drafts.
 */

import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import type {
  AIGenerationListParams,
  AIGenerationListResult,
  AIGenerationProviderValue,
  AIGenerationRecord,
  AIGenerationStatusValue,
  AIGenerationTypeValue,
  AiGenerateResult,
  AiProviderId,
  StudioArticleParams,
  StudioImageParams,
  StudioVideoParams,
} from "./types";

const memory: { generations: AIGenerationRecord[] } = { generations: [] };

function nowIso() {
  return new Date().toISOString();
}

function providerEnum(id: AiProviderId): AIGenerationProviderValue {
  const map: Record<AiProviderId, AIGenerationProviderValue> = {
    claude: "CLAUDE",
    openai: "OPENAI",
    gemini: "GEMINI",
    grok: "GROK",
    video_tbd: "VIDEO_TBD",
    local_mock: "LOCAL_MOCK",
  };
  return map[id];
}

function mapRow(row: {
  id: string;
  adminId: string;
  type: AIGenerationTypeValue;
  provider: AIGenerationProviderValue;
  status: AIGenerationStatusValue;
  prompt: string;
  systemPrompt: string | null;
  outputText: string | null;
  outputUrls: string[];
  model: string | null;
  tone: string | null;
  targetLength: string | null;
  aspectRatio: string | null;
  durationSec: number | null;
  categoryId: string | null;
  topicId: string | null;
  articleId: string | null;
  mediaAssetId: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}): AIGenerationRecord {
  return {
    id: row.id,
    userId: row.adminId,
    type: row.type,
    provider: row.provider,
    status: row.status,
    prompt: row.prompt,
    systemPrompt: row.systemPrompt,
    outputText: row.outputText,
    outputUrls: row.outputUrls,
    model: row.model,
    tone: row.tone,
    targetLength: row.targetLength,
    aspectRatio: row.aspectRatio,
    durationSec: row.durationSec,
    categoryId: row.categoryId,
    topicId: row.topicId,
    articleId: row.articleId,
    mediaAssetId: row.mediaAssetId,
    errorMessage: row.errorMessage,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function hasOpenAi() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function hasAnthropic() {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

function inlineImageCount(length?: StudioArticleParams["targetLength"]): number {
  if (length === "short") return 1;
  if (length === "long") return 3;
  return 2;
}

function articleSystemPrompt(inlineCount: number): string {
  return [
    "You write educational HTML article drafts for Mendanize.",
    "Use h2/h3/p/ul/li/figure/figcaption only. No markdown fences.",
    "Anthropic owns article prose only — never invent image URLs.",
    `Insert exactly ${inlineCount} in-article image placeholders on their own lines using this exact format:`,
    "<!--MNZ_IMAGE: concise visual description for an educational illustration -->",
    "Placeholders describe cover-quality figures, diagrams, or scene illustrations for OpenAI to generate.",
  ].join(" ");
}

function mockArticleHtml(params: StudioArticleParams): string {
  const length =
    params.targetLength === "short"
      ? "a concise overview"
      : params.targetLength === "long"
        ? "a deep-dive walkthrough"
        : "a practical guide";
  const tone = params.tone || "clear and educational";
  const slots = Array.from({ length: inlineImageCount(params.targetLength) }, (_, i) =>
    `<!--MNZ_IMAGE: Educational illustration ${i + 1} about ${params.topic}-->`,
  );
  return [
    `<h2>${params.topic}</h2>`,
    `<p>This draft was produced in Admin AI Studio as ${length}, written in a ${tone} tone.</p>`,
    slots[0] ?? "",
    `<h3>Why it matters</h3>`,
    `<p>${params.topic} sits at the intersection of understanding and practice. Learners need concrete mental models before tooling.</p>`,
    slots[1] ?? "",
    `<h3>Core ideas</h3>`,
    `<ul><li>Start with the problem, not the acronym.</li><li>Show one worked example early.</li><li>Close with a checkpoint question.</li></ul>`,
    slots[2] ?? "",
    `<h3>Next steps</h3>`,
    `<p>Review this draft in the Article editor, attach taxonomy from MES-009, then schedule for publish.</p>`,
  ]
    .filter(Boolean)
    .join("");
}

function figureHtml(url: string, alt: string): string {
  const safeAlt = alt.replace(/"/g, "'").slice(0, 160);
  return `<figure><img src="${url}" alt="${safeAlt}" /><figcaption>${safeAlt}</figcaption></figure>`;
}

async function fillArticleImages(input: {
  html: string;
  topic: string;
  userId: string;
  categoryId?: string | null;
  topicId?: string | null;
}): Promise<{ html: string; urls: string[] }> {
  const coverPrompt = [
    `Educational featured cover illustration for an article titled: ${input.topic}.`,
    "Clean modern digital art, clear focal subject, no text overlays, no logos, no watermarks.",
  ].join(" ");

  const slots = [...input.html.matchAll(/<!--MNZ_IMAGE:\s*(.+?)-->/g)].map((m) =>
    (m[1] ?? input.topic).trim(),
  );

  async function oneImage(
    prompt: string,
    kind: "cover" | "inline",
  ): Promise<{ url: string; model: string | null }> {
    if (!hasOpenAi()) {
      return {
        url: mockImageUrls(prompt, "16:9")[0]!,
        model: "local-mock-image",
      };
    }
    try {
      const result = await openaiImage(prompt, "1792x1024");
      const url = result.urls?.[0] ?? "";
      if (url) {
        void persistGeneration({
          id: `aigen_img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          userId: input.userId,
          type: "IMAGE",
          provider: providerEnum("openai"),
          status: "COMPLETED",
          prompt,
          systemPrompt:
            kind === "cover"
              ? "Featured cover image for Studio article draft"
              : "In-article / body image for Studio article draft",
          outputText: url,
          outputUrls: [url],
          model: result.model ?? "dall-e-3",
          tone: null,
          targetLength: null,
          aspectRatio: "16:9",
          durationSec: null,
          categoryId: input.categoryId ?? null,
          topicId: input.topicId ?? null,
          articleId: null,
          mediaAssetId: null,
          errorMessage: null,
        }).catch(() => {});
      }
      return { url, model: result.model ?? "dall-e-3" };
    } catch (error) {
      console.error(
        `[studio] OpenAI ${kind} image failed:`,
        error instanceof Error ? error.message : error,
      );
      return { url: "", model: null };
    }
  }

  const cover = await oneImage(coverPrompt, "cover");
  const inlines = await Promise.all(
    slots.map((desc) =>
      oneImage(
        [
          `In-article educational illustration: ${desc}.`,
          `Article topic: ${input.topic}.`,
          "Clean modern digital art, clear focal subject, no text overlays, no logos, no watermarks.",
        ].join(" "),
        "inline",
      ).then((img) => ({ desc, ...img })),
    ),
  );

  let html = input.html;
  for (const item of inlines) {
    html = html.replace(/<!--MNZ_IMAGE:\s*(.+?)-->/, () =>
      item.url ? figureHtml(item.url, item.desc) : "",
    );
  }
  html = html.replace(/<!--MNZ_IMAGE:\s*(.+?)-->/g, "");

  const urls = [
    ...(cover.url ? [cover.url] : []),
    ...inlines.map((r) => r.url).filter(Boolean),
  ];
  return { html, urls };
}

function mockImageUrls(prompt: string, aspectRatio: string): string[] {
  const seed = encodeURIComponent(prompt.slice(0, 40) || "mendanize");
  const size =
    aspectRatio === "16:9"
      ? "1200x675"
      : aspectRatio === "9:16"
        ? "675x1200"
        : aspectRatio === "4:3"
          ? "1200x900"
          : "1024x1024";
  return [
    `https://picsum.photos/seed/${seed}a/${size}`,
    `https://picsum.photos/seed/${seed}b/${size}`,
    `https://picsum.photos/seed/${seed}c/${size}`,
    `https://picsum.photos/seed/${seed}d/${size}`,
  ];
}

async function anthropicText(
  prompt: string,
  system?: string,
): Promise<AiGenerateResult> {
  const key = process.env.ANTHROPIC_API_KEY!.trim();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90_000);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:
          process.env.ANTHROPIC_STUDIO_MODEL ||
          process.env.ANTHROPIC_ASK_MODEL ||
          process.env.ANTHROPIC_MODEL ||
          "claude-3-5-sonnet-latest",
        max_tokens: 4000,
        system:
          system ||
          "You write educational HTML article drafts for Mendanize. Use h2/h3/p/ul/li only. No markdown fences.",
        messages: [{ role: "user", content: prompt }],
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Anthropic ${res.status}: ${detail.slice(0, 200)}`);
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
    if (!content) throw new Error("Anthropic returned empty article content");
    return {
      provider: "claude",
      content,
      model: json.model ?? "claude",
    };
  } finally {
    clearTimeout(timer);
  }
}

async function openaiImage(
  prompt: string,
  size: "1024x1024" | "1792x1024" | "1024x1792" = "1024x1024"
): Promise<AiGenerateResult> {
  const key = process.env.OPENAI_API_KEY!.trim();
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: key });
  const result = await client.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size,
  });
  const url = result.data?.[0]?.url ?? "";
  return {
    provider: "openai",
    content: url,
    urls: url ? [url] : [],
    model: "dall-e-3",
  };
}

async function persistGeneration(
  record: Omit<AIGenerationRecord, "createdAt" | "updatedAt"> & {
    createdAt?: string;
    updatedAt?: string;
  }
): Promise<AIGenerationRecord> {
  const t = nowIso();
  const full: AIGenerationRecord = {
    ...record,
    createdAt: record.createdAt ?? t,
    updatedAt: record.updatedAt ?? t,
  };

  if (!isDatabaseConfigured()) {
    memory.generations.unshift(full);
    return full;
  }

  const created = await getPrisma().aIGeneration.create({
    data: {
      id: full.id,
      adminId: full.userId,
      type: full.type,
      provider: full.provider,
      status: full.status,
      prompt: full.prompt,
      systemPrompt: full.systemPrompt,
      outputText: full.outputText,
      outputUrls: full.outputUrls,
      model: full.model,
      tone: full.tone,
      targetLength: full.targetLength,
      aspectRatio: full.aspectRatio,
      durationSec: full.durationSec,
      categoryId: full.categoryId,
      topicId: full.topicId,
      articleId: full.articleId,
      mediaAssetId: full.mediaAssetId,
      errorMessage: full.errorMessage,
    },
  });
  return mapRow(created as Parameters<typeof mapRow>[0]);
}

async function patchGeneration(
  id: string,
  patch: Partial<AIGenerationRecord>
): Promise<AIGenerationRecord | null> {
  if (!isDatabaseConfigured()) {
    const idx = memory.generations.findIndex((g) => g.id === id);
    if (idx < 0) return null;
    memory.generations[idx] = {
      ...memory.generations[idx],
      ...patch,
      updatedAt: nowIso(),
    };
    return memory.generations[idx];
  }
  const updated = await getPrisma().aIGeneration.update({
    where: { id },
    data: {
      status: patch.status,
      outputText: patch.outputText,
      outputUrls: patch.outputUrls,
      model: patch.model,
      articleId: patch.articleId,
      mediaAssetId: patch.mediaAssetId,
      errorMessage: patch.errorMessage,
      provider: patch.provider,
    },
  });
  return mapRow(updated as Parameters<typeof mapRow>[0]);
}

export async function listGenerations(
  params: AIGenerationListParams = {}
): Promise<AIGenerationListResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));

  if (!isDatabaseConfigured()) {
    let items = [...memory.generations];
    if (params.type && params.type !== "ALL") {
      items = items.filter((g) => g.type === params.type);
    }
    if (params.status && params.status !== "ALL") {
      items = items.filter((g) => g.status === params.status);
    }
    if (params.query?.trim()) {
      const q = params.query.trim().toLowerCase();
      items = items.filter((g) => g.prompt.toLowerCase().includes(q));
    }
    const total = items.length;
    const start = (page - 1) * pageSize;
    return {
      items: items.slice(start, start + pageSize),
      total,
      page,
      pageSize,
    };
  }

  const where: Record<string, unknown> = {};
  if (params.type && params.type !== "ALL") where.type = params.type;
  if (params.status && params.status !== "ALL") where.status = params.status;
  if (params.query?.trim()) {
    where.prompt = { contains: params.query.trim(), mode: "insensitive" };
  }

  const prisma = getPrisma();
  const [total, rows] = await Promise.all([
    prisma.aIGeneration.count({ where }),
    prisma.aIGeneration.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: rows.map((r) => mapRow(r as Parameters<typeof mapRow>[0])),
    total,
    page,
    pageSize,
  };
}

export async function getGenerationById(
  id: string
): Promise<AIGenerationRecord | null> {
  if (!isDatabaseConfigured()) {
    return memory.generations.find((g) => g.id === id) ?? null;
  }
  const row = await getPrisma().aIGeneration.findUnique({ where: { id } });
  return row ? mapRow(row as Parameters<typeof mapRow>[0]) : null;
}

export async function generateStudioArticle(
  params: StudioArticleParams
): Promise<AIGenerationRecord> {
  const id = `aigen_${Date.now()}`;
  const inlineCount = inlineImageCount(params.targetLength);
  const prompt = `Write an educational article draft about: ${params.topic}. Tone: ${params.tone || "clear"}. Length: ${params.targetLength || "medium"}. Include exactly ${inlineCount} <!--MNZ_IMAGE: ...--> placeholders for in-article illustrations.`;

  // Ownership: Anthropic = article prose only. OpenAI = every image.
  const textProvider: AiProviderId = hasAnthropic() ? "claude" : "local_mock";

  const pending = await persistGeneration({
    id,
    userId: params.userId,
    type: "ARTICLE",
    provider: providerEnum(textProvider),
    status: "RUNNING",
    prompt,
    systemPrompt:
      "Anthropic owns article text; OpenAI owns cover + inline images",
    outputText: null,
    outputUrls: [],
    model: null,
    tone: params.tone ?? null,
    targetLength: params.targetLength ?? "medium",
    aspectRatio: null,
    durationSec: null,
    categoryId: params.categoryId ?? null,
    topicId: params.topicId ?? null,
    articleId: null,
    mediaAssetId: null,
    errorMessage: null,
  });

  try {
    let textResult: AiGenerateResult;
    if (hasAnthropic()) {
      textResult = await anthropicText(prompt, articleSystemPrompt(inlineCount));
    } else {
      textResult = {
        provider: "local_mock",
        content: mockArticleHtml(params),
        model: "local-mock-v1",
      };
    }

    const filled = await fillArticleImages({
      html: textResult.content,
      topic: params.topic,
      userId: params.userId,
      categoryId: params.categoryId,
      topicId: params.topicId,
    });

    const updated = await patchGeneration(pending.id, {
      status: "COMPLETED",
      outputText: filled.html,
      outputUrls: filled.urls,
      model: textResult.model ?? null,
      provider: providerEnum(textResult.provider),
    });
    return updated ?? pending;
  } catch (error) {
    const updated = await patchGeneration(pending.id, {
      status: "FAILED",
      errorMessage:
        error instanceof Error ? error.message : "Article generation failed",
    });
    return updated ?? pending;
  }
}

export async function generateStudioImage(
  params: StudioImageParams
): Promise<AIGenerationRecord> {
  const id = `aigen_${Date.now()}`;
  const aspect = params.aspectRatio ?? "1:1";
  const fullPrompt = params.style
    ? `${params.prompt}. Style: ${params.style}`
    : params.prompt;

  const pending = await persistGeneration({
    id,
    userId: params.userId,
    type: "IMAGE",
    provider: providerEnum(hasOpenAi() ? "openai" : "local_mock"),
    status: "RUNNING",
    prompt: fullPrompt,
    systemPrompt: "OpenAI owns all image generation",
    outputText: null,
    outputUrls: [],
    model: null,
    tone: null,
    targetLength: null,
    aspectRatio: aspect,
    durationSec: null,
    categoryId: null,
    topicId: null,
    articleId: null,
    mediaAssetId: null,
    errorMessage: null,
  });

  try {
    let urls: string[];
    let model: string | null = null;
    let provider: AiProviderId = "local_mock";

    if (hasOpenAi()) {
      const size =
        aspect === "16:9"
          ? "1792x1024"
          : aspect === "9:16"
            ? "1024x1792"
            : "1024x1024";
      const result = await openaiImage(fullPrompt, size);
      urls = result.urls?.length ? result.urls : mockImageUrls(fullPrompt, aspect);
      model = result.model ?? "dall-e-3";
      provider = "openai";
    } else {
      urls = mockImageUrls(fullPrompt, aspect);
      model = "local-mock-image";
    }

    const updated = await patchGeneration(pending.id, {
      status: "COMPLETED",
      outputUrls: urls,
      outputText: urls[0] ?? null,
      model,
      provider: providerEnum(provider),
    });
    return updated ?? pending;
  } catch (error) {
    const updated = await patchGeneration(pending.id, {
      status: "FAILED",
      errorMessage:
        error instanceof Error ? error.message : "Image generation failed",
    });
    return updated ?? pending;
  }
}

/** Video UI architecture only — records intent without provider call. */
export async function prepareStudioVideo(
  params: StudioVideoParams
): Promise<AIGenerationRecord> {
  const id = `aigen_${Date.now()}`;
  return persistGeneration({
    id,
    userId: params.userId,
    type: "VIDEO",
    provider: "VIDEO_TBD",
    status: "COMPLETED",
    prompt: params.prompt,
    systemPrompt: params.style ?? null,
    outputText:
      "Video provider wiring is deferred. This generation records the request for architecture and history.",
    outputUrls: [],
    model: "video-provider-tbd",
    tone: null,
    targetLength: null,
    aspectRatio: null,
    durationSec: params.durationSec ?? 30,
    categoryId: null,
    topicId: null,
    articleId: null,
    mediaAssetId: null,
    errorMessage: null,
  });
}

export async function linkGenerationToArticle(
  generationId: string,
  articleId: string
): Promise<AIGenerationRecord | null> {
  return patchGeneration(generationId, {
    articleId,
    status: "ACCEPTED",
  });
}

export async function linkGenerationToMedia(
  generationId: string,
  mediaAssetId: string
): Promise<AIGenerationRecord | null> {
  return patchGeneration(generationId, {
    mediaAssetId,
    status: "ACCEPTED",
  });
}
