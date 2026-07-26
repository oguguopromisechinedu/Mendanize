/** Recommendations Shared Service types (MES-018). */

export type RecommendationEntityType =
  | "article"
  | "guide"
  | "ai_tool"
  | "category"
  | "topic";

/** Spec context types (tool aliases ai_tool). */
export type RecommendationContextType =
  | "article"
  | "guide"
  | "tool"
  | "user"
  | "trending";

export type RecommendationParams = {
  entityType: RecommendationEntityType;
  entityId: string;
  limit?: number;
};

export type GetRecommendationsParams = {
  contextType: RecommendationContextType;
  contextId: string;
  limit?: number;
  /** Account scope keeps learners inside /account/* while reading. */
  hrefScope?: "public" | "account";
};

export type RecommendationItem = {
  entityType: RecommendationEntityType;
  entityId: string;
  title: string;
  slug: string;
  href: string;
  thumbnail?: string | null;
  reason?: string;
  score?: number;
};

export type RecommendationsResult = {
  items: RecommendationItem[];
};
