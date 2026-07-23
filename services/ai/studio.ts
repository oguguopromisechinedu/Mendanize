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
    dalle: "DALLE",
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

function mockArticleHtml(params: StudioArticleParams): string {
  const length =
    params.targetLength === "short"
      ? "a concise overview"
      : params.targetLength === "long"
        ? "a deep-dive walkthrough"
        : "a practical guide";
  const tone = params.tone || "clear and educational";
  return [
    `<h2>${params.topic}</h2>`,
    `<p>This draft was produced in Admin AI Studio as ${length}, written in a ${tone} tone.</p>`,
    `<h3>Why it matters</h3>`,
    `<p>${params.topic} sits at the intersection of understanding and practice. Learners need concrete mental models before tooling.</p>`,
    `<h3>Core ideas</h3>`,
    `<ul><li>Start with the problem, not the acronym.</li><li>Show one worked example early.</li><li>Close with a checkpoint question.</li></ul>`,
    `<h3>Next steps</h3>`,
    `<p>Review this draft in the Article editor, attach taxonomy from MES-009, then schedule for publish.</p>`,
  ].join("");
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

async function openaiText(prompt: string, system?: string): Promise<AiGenerateResult> {
  const key = process.env.OPENAI_API_KEY!.trim();
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: key });
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_STUDIO_MODEL || "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          system ||
          "You write educational HTML article drafts for Mendanize. Use h2/h3/p/ul/li only.",
      },
      { role: "user", content: prompt },
    ],
  });
  const content = completion.choices[0]?.message?.content ?? "";
  return {
    provider: "openai",
    content,
    model: completion.model,
    usage: completion.usage as unknown as Record<string, unknown>,
  };
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
    provider: "dalle",
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
  const prompt = `Write an educational article draft about: ${params.topic}. Tone: ${params.tone || "clear"}. Length: ${params.targetLength || "medium"}.`;
  const preferredTextProvider: AiProviderId =
    params.provider === "openai"
      ? "openai"
      : params.provider === "claude"
        ? "claude"
        : hasAnthropic()
          ? "claude"
          : hasOpenAi()
            ? "openai"
            : "local_mock";

  const pending = await persistGeneration({
    id,
    userId: params.userId,
    type: "ARTICLE",
    provider: providerEnum(preferredTextProvider),
    status: "RUNNING",
    prompt,
    systemPrompt: "Mendanize educational article draft (Claude) + featured image (OpenAI)",
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
    const imagePrompt = [
      `Educational featured illustration for an article titled: ${params.topic}.`,
      "Clean modern digital art, clear focal subject, no text overlays, no logos, no watermarks.",
    ].join(" ");

    // Anthropic writes the article; OpenAI generates the image — in parallel.
    const [textResult, imageResult] = await Promise.all([
      (async (): Promise<AiGenerateResult> => {
        if (preferredTextProvider === "claude" && hasAnthropic()) {
          try {
            return await anthropicText(prompt);
          } catch (error) {
            console.error(
              "[studio] Anthropic article failed, trying OpenAI fallback:",
              error instanceof Error ? error.message : error,
            );
            if (hasOpenAi()) return openaiText(prompt);
            throw error;
          }
        }
        if (hasOpenAi()) return openaiText(prompt);
        return {
          provider: "local_mock",
          content: mockArticleHtml(params),
          model: "local-mock-v1",
        };
      })(),
      (async (): Promise<AiGenerateResult | null> => {
        if (!hasOpenAi()) return null;
        try {
          return await openaiImage(imagePrompt, "1792x1024");
        } catch (error) {
          console.error(
            "[studio] OpenAI article image failed:",
            error instanceof Error ? error.message : error,
          );
          return null;
        }
      })(),
    ]);

    const imageUrls = imageResult?.urls?.filter(Boolean) ?? [];

    // Keep a separate IMAGE history row when DALL·E succeeds.
    if (imageResult && imageUrls.length > 0) {
      void persistGeneration({
        id: `aigen_img_${Date.now()}`,
        userId: params.userId,
        type: "IMAGE",
        provider: providerEnum("dalle"),
        status: "COMPLETED",
        prompt: imagePrompt,
        systemPrompt: "Featured image for Studio article draft",
        outputText: imageUrls[0] ?? null,
        outputUrls: imageUrls,
        model: imageResult.model ?? "dall-e-3",
        tone: null,
        targetLength: null,
        aspectRatio: "16:9",
        durationSec: null,
        categoryId: params.categoryId ?? null,
        topicId: params.topicId ?? null,
        articleId: null,
        mediaAssetId: null,
        errorMessage: null,
      }).catch(() => {
        /* history image row is best-effort */
      });
    }

    const updated = await patchGeneration(pending.id, {
      status: "COMPLETED",
      outputText: textResult.content,
      outputUrls: imageUrls,
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
    provider: providerEnum(params.provider || (hasOpenAi() ? "dalle" : "local_mock")),
    status: "RUNNING",
    prompt: fullPrompt,
    systemPrompt: null,
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

    if (hasOpenAi() && (!params.provider || params.provider === "dalle" || params.provider === "openai")) {
      const size =
        aspect === "16:9"
          ? "1792x1024"
          : aspect === "9:16"
            ? "1024x1792"
            : "1024x1024";
      const result = await openaiImage(fullPrompt, size);
      urls = result.urls?.length ? result.urls : mockImageUrls(fullPrompt, aspect);
      model = result.model ?? "dall-e-3";
      provider = "dalle";
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
