/**
 * User Learning Shared Service types — MES-022.
 */

import type { RecommendationEntityType, RecommendationItem } from "@/services/recommendations";

export type LearningEntityType = Extract<
  RecommendationEntityType,
  "article" | "guide" | "ai_tool"
>;

export type SavedContentItem = {
  id: string;
  entityType: LearningEntityType;
  entityId: string;
  title: string;
  slug: string;
  href: string;
  savedAt: string;
};

export type HistoryItem = {
  id: string;
  entityType: LearningEntityType | RecommendationEntityType;
  entityId: string;
  title: string;
  slug: string;
  href: string;
  viewedAt: string;
};

export type ContinueLearningCard = {
  id: string;
  guideId: string;
  title: string;
  slug: string;
  href: string;
  lastLessonTitle: string;
  completedLessons: number;
  totalLessons: number;
  remainingLessons: number;
  estimatedMinutesLeft: number | null;
  percentComplete: number;
  lastOpenedAt: string;
};

export type InterestOption = {
  id: string;
  name: string;
  slug: string;
  kind: "category" | "topic";
  categoryId?: string | null;
};

export type UserInterestRecord = {
  id: string;
  categoryId: string | null;
  topicId: string | null;
  categoryName?: string | null;
  topicName?: string | null;
  createdAt: string;
};

export type LearningGoalRecord = {
  id: string;
  title: string;
  description: string | null;
  targetNote: string | null;
  isActive: boolean;
  createdAt: string;
};

export type UserPreferenceRecord = {
  id: string;
  preferredDifficulty: string;
  dailyReminderEnabled: boolean;
  preferredCategoryIds: string[];
  preferredTopicIds: string[];
  themePreference: string;
  updatedAt: string;
};

export type LearningStats = {
  savedCount: number;
  historyCount: number;
  interestCount: number;
  continueCount: number;
  streakDaysPlaceholder: number;
  weeklyGoalPlaceholder: string;
};

export type LearningDashboard = {
  userName: string | null;
  stats: LearningStats;
  continueLearning: ContinueLearningCard[];
  recentlyViewed: HistoryItem[];
  savedPreview: SavedContentItem[];
  recommendations: RecommendationItem[];
};
