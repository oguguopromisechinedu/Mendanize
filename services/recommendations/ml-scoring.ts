/**
 * ML Scoring layer — MES-049.
 * Sits behind the MES-018 facade; never imported by outside modules.
 *
 * Shadow → canary → default rollout via RecommendationModel.status + rolloutPercent.
 * Falls back to rules scoring when no model is active or when the model endpoint is unreachable.
 */

import "server-only";

import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import type { RecommendationItem } from "./types";

type ModelRecord = {
  id: string;
  name: string;
  description: string | null;
  status: "SHADOW" | "CANARY" | "DEFAULT" | "DISABLED";
  endpoint: string | null;
  rolloutPercent: number;
  configJson: string | null;
};

type MlScoreRequest = {
  userId?: string;
  contextType: string;
  contextId?: string;
  candidates: RecommendationItem[];
};

type MlScoreResult = {
  /** Re-ranked items with model-assigned scores. */
  items: RecommendationItem[];
  modelId: string;
  modelName: string;
};

function db() {
  return getPrisma();
}

/**
 * Returns the currently active model for scoring, respecting rollout rules.
 * Priority: DEFAULT > CANARY (with percentage gate) > SHADOW (log-only, never returned as "use").
 */
export async function getActiveModel(
  sessionHash?: string,
): Promise<ModelRecord | null> {
  if (!isDatabaseConfigured()) return null;

  const models = await db().recommendationModel.findMany({
    where: { status: { in: ["DEFAULT", "CANARY"] } },
    orderBy: { status: "asc" }, // CANARY before DEFAULT alphabetically
  });

  // Prefer DEFAULT model
  const defaultModel = models.find((m) => m.status === "DEFAULT");
  if (defaultModel) return defaultModel;

  // Canary: use session hash for deterministic bucketing
  const canary = models.find((m) => m.status === "CANARY");
  if (canary && canary.rolloutPercent > 0) {
    const bucket = sessionHash
      ? Math.abs(hashCode(sessionHash)) % 100
      : Math.floor(Math.random() * 100);
    if (bucket < canary.rolloutPercent) return canary;
  }

  return null;
}

/**
 * Returns the SHADOW model for comparison logging (never affects user-facing results).
 */
export async function getShadowModel(): Promise<ModelRecord | null> {
  if (!isDatabaseConfigured()) return null;
  return db().recommendationModel.findFirst({
    where: { status: "SHADOW" },
  });
}

/**
 * Call an external ML model endpoint to re-rank candidates.
 * Returns null on any failure so the caller can fall back to rules.
 */
export async function scoreWithModel(
  model: ModelRecord,
  request: MlScoreRequest,
): Promise<MlScoreResult | null> {
  if (!model.endpoint) return null;

  const config = model.configJson
    ? safeJsonParse(model.configJson)
    : ({} as Record<string, unknown>);
  const timeoutMs =
    typeof config.timeoutMs === "number" && Number.isFinite(config.timeoutMs)
      ? config.timeoutMs
      : 2000;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(model.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
      },
      body: JSON.stringify({
        userId: request.userId,
        contextType: request.contextType,
        contextId: request.contextId,
        candidates: request.candidates.map((c) => ({
          entityType: c.entityType,
          entityId: c.entityId,
          score: c.score,
        })),
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) return null;

    const data = (await res.json()) as {
      scores?: Array<{ entityId: string; score: number }>;
    };

    if (!data.scores?.length) return null;

    const scoreMap = new Map(data.scores.map((s) => [s.entityId, s.score]));

    const reranked = request.candidates
      .map((item) => ({
        ...item,
        score: scoreMap.get(item.entityId) ?? item.score ?? 0,
      }))
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    return { items: reranked, modelId: model.id, modelName: model.name };
  } catch {
    return null; // Timeout or network error — fall back to rules
  }
}

/** Record a click for quality metrics. */
export async function recordRecommendationClick(input: {
  publicUserId?: string;
  sessionId?: string;
  contextType: string;
  contextId?: string;
  entityType: string;
  entityId: string;
  position?: number;
  modelId?: string;
  scoredByRules: boolean;
}): Promise<void> {
  if (!isDatabaseConfigured()) return;
  await db().recommendationClick.create({ data: input });
}

/** Admin: list all registered models. */
export async function listRecommendationModels(): Promise<ModelRecord[]> {
  if (!isDatabaseConfigured()) return [];
  return db().recommendationModel.findMany({
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });
}

/** Admin: create or update a model entry. */
export async function upsertRecommendationModel(input: {
  id?: string;
  name: string;
  description?: string;
  status: "SHADOW" | "CANARY" | "DEFAULT" | "DISABLED";
  endpoint?: string;
  rolloutPercent?: number;
  configJson?: string;
  adminId?: string;
}): Promise<ModelRecord> {
  // If setting to DEFAULT, disable any other DEFAULT model first
  if (input.status === "DEFAULT") {
    await db().recommendationModel.updateMany({
      where: { status: "DEFAULT", id: input.id ? { not: input.id } : undefined },
      data: { status: "DISABLED" },
    });
  }

  if (input.id) {
    return db().recommendationModel.update({
      where: { id: input.id },
      data: {
        name: input.name,
        description: input.description,
        status: input.status,
        endpoint: input.endpoint,
        rolloutPercent: input.rolloutPercent ?? 0,
        configJson: input.configJson,
        managedByAdminId: input.adminId,
      },
    });
  }

  return db().recommendationModel.create({
    data: {
      name: input.name,
      description: input.description,
      status: input.status,
      endpoint: input.endpoint,
      rolloutPercent: input.rolloutPercent ?? 0,
      configJson: input.configJson,
      managedByAdminId: input.adminId,
    },
  });
}

/** Admin: disable a model instantly (rollback switch). */
export async function disableRecommendationModel(modelId: string): Promise<void> {
  if (!isDatabaseConfigured()) return;
  await db().recommendationModel.update({
    where: { id: modelId },
    data: { status: "DISABLED", rolloutPercent: 0 },
  });
}

/** Quality dashboard: click-through rate proxy metrics. */
export async function getRecommendationQualityMetrics(input?: {
  modelId?: string;
  sinceDaysAgo?: number;
}): Promise<{
  totalClicks: number;
  ruleClicks: number;
  modelClicks: number;
  avgPosition: number | null;
  byDay: Array<{ date: string; clicks: number }>;
}> {
  if (!isDatabaseConfigured()) {
    return { totalClicks: 0, ruleClicks: 0, modelClicks: 0, avgPosition: null, byDay: [] };
  }

  const since = new Date();
  since.setDate(since.getDate() - (input?.sinceDaysAgo ?? 30));

  const where: Record<string, unknown> = { clickedAt: { gte: since } };
  if (input?.modelId) where.modelId = input.modelId;

  const clicks = await db().recommendationClick.findMany({
    where,
    select: { scoredByRules: true, position: true, clickedAt: true },
    orderBy: { clickedAt: "asc" },
  });

  const totalClicks = clicks.length;
  const ruleClicks = clicks.filter((c) => c.scoredByRules).length;
  const modelClicks = totalClicks - ruleClicks;
  const positions = clicks.map((c) => c.position).filter((p): p is number => p != null);
  const avgPosition = positions.length ? positions.reduce((a, b) => a + b, 0) / positions.length : null;

  const dayMap = new Map<string, number>();
  for (const c of clicks) {
    const day = c.clickedAt.toISOString().slice(0, 10);
    dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
  }
  const byDay = [...dayMap.entries()].map(([date, count]) => ({ date, clicks: count }));

  return { totalClicks, ruleClicks, modelClicks, avgPosition, byDay };
}

// Helpers

function hashCode(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) | 0;
  }
  return hash;
}

function safeJsonParse(s: string): Record<string, unknown> {
  try {
    const v = JSON.parse(s);
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}
