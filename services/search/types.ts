/** Search Shared Service types (MES-017). */

export type SearchEntityType =
  | "article"
  | "guide"
  | "ai_tool"
  | "category"
  | "topic"
  | "discussion"
  | "study_group"
  | "team"
  | "showcase_project";

export type SearchDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type SearchParams = {
  query: string;
  page?: number;
  pageSize?: number;
  types?: SearchEntityType[];
  categorySlug?: string | null;
  topicSlug?: string | null;
  difficulty?: SearchDifficulty | null;
  featured?: boolean | null;
  recentlyUpdated?: boolean | null;
  publishedAfter?: string | null;
  publishedBefore?: string | null;
  recordHistory?: boolean;
  userId?: string | null;
  sessionKey?: string | null;
  /** Account scope keeps learners inside /account/* result links. */
  hrefScope?: "public" | "account";
};

export type SearchHit = {
  type: SearchEntityType;
  id: string;
  slug: string;
  href: string;
  title: string;
  excerpt?: string | null;
  thumbnailUrl?: string | null;
  categoryName?: string | null;
  topicName?: string | null;
  difficulty?: SearchDifficulty | null;
  readingTimeMin?: number | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  featured?: boolean;
};

export type SearchResultGroup = {
  type: SearchEntityType;
  label: string;
  hits: SearchHit[];
};

export type SearchResult = {
  query: string;
  hits: SearchHit[];
  groups: SearchResultGroup[];
  total: number;
  page: number;
  pageSize: number;
};

export type SearchSuggestionItem = {
  query: string;
  label: string;
  source: "suggestion" | "trending" | "recent" | "recommendation";
};

export type SearchDiscoveryPayload = {
  suggestions: SearchSuggestionItem[];
  recent: SearchSuggestionItem[];
  trending: SearchSuggestionItem[];
  recommended: SearchSuggestionItem[];
};

export type SearchConfigurationRecord = {
  id: string;
  key: string;
  enabled: boolean;
  minQueryLength: number;
  resultsPerPage: number;
  rankingRulesNote: string | null;
  synonymsPlaceholder: string | null;
  stopWordsPlaceholder: string | null;
  analyticsPlaceholder: string | null;
  includeArticles: boolean;
  includeGuides: boolean;
  includeTools: boolean;
  includeCategories: boolean;
  includeTopics: boolean;
  updatedAt: string;
};

export type SearchConfigurationWrite = Partial<
  Omit<SearchConfigurationRecord, "id" | "key" | "updatedAt">
>;

export type SearchFilterRecord = {
  id: string;
  key: string;
  label: string;
  kind: string;
  enabled: boolean;
  sortOrder: number;
  optionsJson: string | null;
};

export type SearchSettingsOverview = {
  configuration: SearchConfigurationRecord;
  filters: SearchFilterRecord[];
  suggestionCount: number;
  trendingCount: number;
  historyCount: number;
};
