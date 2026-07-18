export type {
  GetRecommendationsParams,
  RecommendationContextType,
  RecommendationEntityType,
  RecommendationItem,
  RecommendationParams,
  RecommendationsResult,
} from "./types";

export {
  getRecommendations,
  getRecommendedForUser,
  getRelated,
  recordContentView,
} from "./service";
