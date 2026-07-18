/**
 * Analytics Shared Service types — MES-023.
 */

export type AnalyticsEventKindValue =
  | "PAGE_VIEW"
  | "CONTENT_VIEW"
  | "GUIDE_START"
  | "TOOL_VIEW"
  | "SEARCH_QUERY"
  | "ASK_MESSAGE"
  | "SESSION_START"
  | "SESSION_END"
  | "USER_SIGN_IN"
  | "OTHER";

export type CaptureAnalyticsEventInput = {
  kind: AnalyticsEventKindValue;
  entityType?: string | null;
  entityId?: string | null;
  userId?: string | null;
  sessionKey?: string | null;
  path?: string | null;
  query?: string | null;
  metadata?: Record<string, unknown> | null;
  occurredAt?: Date;
};

export type AnalyticsStat = {
  id: string;
  label: string;
  value: string;
  hint?: string;
  delta?: string;
};

export type AnalyticsTableRow = {
  id: string;
  label: string;
  value: string;
  meta?: string;
};

export type AnalyticsOverview = {
  stats: AnalyticsStat[];
  engagement: AnalyticsStat[];
  periodKey: string;
  instrumentationEnabled: boolean;
  sourceNote: string;
};

export type DomainAnalyticsPayload = {
  title: string;
  description: string;
  stats: AnalyticsStat[];
  rows: AnalyticsTableRow[];
  chartPlaceholder: string;
};

export type AnalyticsReportRecord = {
  id: string;
  name: string;
  reportType: string;
  dateFrom: string | null;
  dateTo: string | null;
  status: string;
  exportNote: string | null;
  scheduleNote: string | null;
  createdAt: string;
};

export type AnalyticsConfigRecord = {
  retentionDays: number;
  privacyMode: boolean;
  auditLoggingNote: string | null;
  allowedRoles: string[];
  instrumentationEnabled: boolean;
};

export type DashboardAnalyticsSlice = {
  visitors: string;
  pageViews: string;
  avgSession: string;
  returningUsers: string;
  publishedArticles: string;
  guideViews: string;
  toolViews: string;
  searchQueries: string;
  askConversations: string;
};

export type PublicFacingStats = {
  articles: string;
  guides: string;
  tools: string;
  categories: string;
  readers: string;
};

export type AnalyticsChartPoint = {
  label: string;
  value: number;
};

export type DashboardAnalyticsChart = {
  id: string;
  label: string;
  value: string;
  delta: string;
  points: AnalyticsChartPoint[];
};
