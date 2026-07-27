import {
  getLearningDashboard,
  getRecommendedForLearner,
  getUserPreferences,
  listContinueLearning,
  listInterestTaxonomy,
  listLearningGoals,
  listLearningHistory,
  listSavedContent,
  listUserInterests,
} from "@/services/learning";

export async function loadLearningDashboard(userId: string, userName?: string | null) {
  return getLearningDashboard({ userId, userName });
}

export async function loadContinueLearning(userId: string) {
  return listContinueLearning(userId);
}

export async function loadSaved(
  userId: string,
  opts?: Parameters<typeof listSavedContent>[1],
) {
  return listSavedContent(userId, opts);
}

export async function loadHistory(userId: string, query?: string) {
  return listLearningHistory(userId, { query, limit: 50 });
}

export async function loadRecommended(userId: string) {
  return getRecommendedForLearner(userId, 12);
}

export async function loadInterestsPage(userId: string) {
  const [interests, taxonomy] = await Promise.all([
    listUserInterests(userId),
    listInterestTaxonomy(),
  ]);
  return { interests, taxonomy };
}

export async function loadPreferencesPage(userId: string) {
  const [preferences, goals, taxonomy] = await Promise.all([
    getUserPreferences(userId),
    listLearningGoals(userId),
    listInterestTaxonomy(),
  ]);
  return { preferences, goals, taxonomy };
}

export {
  loadLearnerEcosystemExtras,
  type LearnerEcosystemSnapshot,
} from "./ecosystem-dashboard";
