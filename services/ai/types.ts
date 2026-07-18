/** AI Shared Service types (MES-002 / MES-011). */

export type AiProviderId =
  | "claude"
  | "openai"
  | "gemini"
  | "grok"
  | "dalle"
  | "video_tbd"
  | "local_mock";

export type AiProviderStatus = {
  provider: AiProviderId;
  connected: boolean;
  message?: string;
};

export type AiGenerateParams = {
  provider?: AiProviderId;
  prompt: string;
  system?: string;
  model?: string;
  meta?: Record<string, unknown>;
};

export type AiGenerateResult = {
  provider: AiProviderId;
  content: string;
  urls?: string[];
  model?: string;
  usage?: Record<string, unknown>;
};

export type AIGenerationTypeValue = "ARTICLE" | "IMAGE" | "VIDEO";
export type AIGenerationProviderValue =
  | "CLAUDE"
  | "OPENAI"
  | "GEMINI"
  | "GROK"
  | "DALLE"
  | "VIDEO_TBD"
  | "LOCAL_MOCK";
export type AIGenerationStatusValue =
  | "PENDING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "ACCEPTED";

export type AIGenerationRecord = {
  id: string;
  userId: string;
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
  createdAt: string;
  updatedAt: string;
};

export type AIGenerationListParams = {
  page?: number;
  pageSize?: number;
  query?: string;
  type?: AIGenerationTypeValue | "ALL";
  status?: AIGenerationStatusValue | "ALL";
};

export type AIGenerationListResult = {
  items: AIGenerationRecord[];
  total: number;
  page: number;
  pageSize: number;
};

export type StudioArticleParams = {
  userId: string;
  topic: string;
  categoryId?: string | null;
  topicId?: string | null;
  tone?: string;
  targetLength?: "short" | "medium" | "long";
  provider?: AiProviderId;
};

export type StudioImageParams = {
  userId: string;
  prompt: string;
  style?: string;
  aspectRatio?: "1:1" | "16:9" | "4:3" | "9:16";
  provider?: AiProviderId;
};

export type StudioVideoParams = {
  userId: string;
  prompt: string;
  durationSec?: number;
  style?: string;
};
