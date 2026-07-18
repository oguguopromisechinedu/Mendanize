/**
 * AI Shared Service (MES-002 / MES-011)
 * Multi-provider client + Admin AI Studio orchestration.
 */

import type {
  AiGenerateParams,
  AiGenerateResult,
  AiProviderId,
  AiProviderStatus,
} from "./types";
import {
  generateStudioArticle,
  generateStudioImage,
} from "./studio";

export {
  listGenerations,
  getGenerationById,
  generateStudioArticle,
  generateStudioImage,
  prepareStudioVideo,
  linkGenerationToArticle,
  linkGenerationToMedia,
} from "./studio";

export async function generateText(
  params: AiGenerateParams
): Promise<AiGenerateResult> {
  const result = await generateStudioArticle({
    userId: "system",
    topic: params.prompt,
    tone: typeof params.meta?.tone === "string" ? params.meta.tone : undefined,
    provider: params.provider,
  });
  const provider: AiProviderId =
    result.provider === "CLAUDE"
      ? "claude"
      : result.provider === "OPENAI"
        ? "openai"
        : "local_mock";
  return {
    provider,
    content: result.outputText ?? "",
    urls: result.outputUrls,
    model: result.model ?? undefined,
  };
}

export async function generateImage(
  params: AiGenerateParams
): Promise<AiGenerateResult> {
  const result = await generateStudioImage({
    userId: "system",
    prompt: params.prompt,
    provider: params.provider === "dalle" ? "dalle" : params.provider,
  });
  return {
    provider: "dalle",
    content: result.outputUrls[0] ?? "",
    urls: result.outputUrls,
    model: result.model ?? undefined,
  };
}

/**
 * Article CMS AI entry point — uses the same Studio generation path.
 */
export async function assistArticleAuthoring(params: {
  mode: "draft" | "rewrite" | "summarize";
  prompt: string;
  content?: string;
}): Promise<
  | { ok: true; content: string; provider: AiProviderId }
  | { ok: false; message: string }
> {
  try {
    const topic =
      params.mode === "draft"
        ? params.prompt
        : params.mode === "rewrite"
          ? `Rewrite for clarity:\n${params.content || params.prompt}`
          : `Summarize:\n${params.content || params.prompt}`;
    const result = await generateStudioArticle({
      userId: "system",
      topic,
      targetLength: params.mode === "summarize" ? "short" : "medium",
    });
    if (result.status === "FAILED" || !result.outputText) {
      return {
        ok: false,
        message: result.errorMessage || "Generation failed",
      };
    }
    return {
      ok: true,
      content: result.outputText,
      provider:
        result.provider === "OPENAI"
          ? "openai"
          : result.provider === "CLAUDE"
            ? "claude"
            : "local_mock",
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "AI assist failed",
    };
  }
}

export async function getProviderStatuses(): Promise<AiProviderStatus[]> {
  const [
    openai,
    claude,
    dalle,
    gemini,
    grok,
  ] = await Promise.all([
    import("./providers/openai").then((m) => m.status()),
    import("./providers/claude").then((m) => m.status()),
    import("./providers/dalle").then((m) => m.status()),
    import("./providers/gemini").then((m) => m.status()),
    import("./providers/grok").then((m) => m.status()),
  ])
  return [openai, claude, dalle, gemini, grok]
}

export async function getProviderStatus(
  provider: AiProviderId
): Promise<AiProviderStatus> {
  const all = await getProviderStatuses();
  return (
    all.find((p) => p.provider === provider) ?? {
      provider,
      connected: false,
      message: "Unknown provider",
    }
  );
}
