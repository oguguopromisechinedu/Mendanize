import {
  getAIAnalyticsDomain,
  getAnalyticsOverview,
  getContentAnalyticsDomain,
  getLearningAnalyticsDomain,
  getSearchAnalyticsDomain,
  getTrafficAnalyticsDomain,
  getUserAnalyticsDomain,
  listAnalyticsReports,
  getAnalyticsConfiguration,
} from "@/services/analytics";

export async function loadOverview() {
  return getAnalyticsOverview();
}

export async function loadContentDomain() {
  return getContentAnalyticsDomain();
}

export async function loadLearningDomain() {
  return getLearningAnalyticsDomain();
}

export async function loadAiDomain() {
  return getAIAnalyticsDomain();
}

export async function loadSearchDomain() {
  return getSearchAnalyticsDomain();
}

export async function loadUserDomain() {
  return getUserAnalyticsDomain();
}

export async function loadTrafficDomain() {
  return getTrafficAnalyticsDomain();
}

export async function loadReports() {
  const [reports, config] = await Promise.all([
    listAnalyticsReports(),
    getAnalyticsConfiguration(),
  ]);
  return { reports, config };
}
