import {
  getRecommendations,
  getRecommendedForUser,
  getRelated,
  type GetRecommendationsParams,
  type RecommendationParams,
} from "@/services/recommendations";

export async function loadRecommendations(params: GetRecommendationsParams) {
  return getRecommendations(params);
}

export async function loadRelated(params: RecommendationParams) {
  return getRelated(params);
}

export async function loadRecommendedForUser(
  userId: string,
  limit?: number,
) {
  return getRecommendedForUser(userId, {
    entityType: "article",
    entityId: userId,
    limit,
  });
}
