"use server";

import { requireAdmin } from "@/features/authentication/server";
import {
  listRecommendationModels,
  upsertRecommendationModel,
  disableRecommendationModel,
  getRecommendationQualityMetrics,
  recordRecommendationClick,
} from "@/services/recommendations";

async function requireAdminSession() {
  const session = await requireAdmin();
  if (!session?.admin?.id) throw new Error("Unauthorized");
  return session;
}

/** Record a click from a recommendation rail (learner-facing, no auth required). */
export async function recordRecommendationClickAction(input: {
  publicUserId?: string;
  sessionId?: string;
  contextType: string;
  contextId?: string;
  entityType: string;
  entityId: string;
  position?: number;
  modelId?: string;
  scoredByRules: boolean;
}) {
  await recordRecommendationClick(input);
  return { ok: true };
}

/** Admin: list all ML models. */
export async function listModelsAction() {
  await requireAdminSession();
  return listRecommendationModels();
}

/** Admin: create or update a model. */
export async function upsertModelAction(input: {
  id?: string;
  name: string;
  description?: string;
  status: "SHADOW" | "CANARY" | "DEFAULT" | "DISABLED";
  endpoint?: string;
  rolloutPercent?: number;
  configJson?: string;
}) {
  const session = await requireAdminSession();
  return upsertRecommendationModel({
    ...input,
    adminId: session.admin.id,
  });
}

/** Admin: instant disable (rollback switch). */
export async function disableModelAction(modelId: string) {
  await requireAdminSession();
  await disableRecommendationModel(modelId);
  return { ok: true };
}

/** Admin: quality dashboard data. */
export async function getQualityMetricsAction(input?: {
  modelId?: string;
  sinceDaysAgo?: number;
}) {
  await requireAdminSession();
  return getRecommendationQualityMetrics(input);
}
