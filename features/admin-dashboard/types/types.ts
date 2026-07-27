/** Admin dashboard types (MES-007) */

export type DashboardStat = {
  id: string;
  label: string;
  value: string;
  hint?: string;
  trend?: string;
};

export type OpsShortcutItem = {
  id: string;
  label: string;
  href: string;
  description: string;
};

export type ActivityItem = {
  id: string;
  title: string;
  meta: string;
  time: string;
};

export type RecentArticleRow = {
  id: string;
  title: string;
  status: "draft" | "review" | "scheduled" | "published";
  author: string;
  seoScore: number;
  views: string;
  date: string;
  href?: string;
};

export type ContentSlice = {
  id: string;
  label: string;
  value: number;
  color: string;
};

export type RankedCategory = {
  id: string;
  name: string;
  count: number;
};

export type AnalyticsMetric = {
  id: string;
  label: string;
  value: string;
  delta: string;
};

export type AnalyticsChartPoint = {
  label: string;
  value: number;
};

export type AnalyticsChartCard = {
  id: string;
  label: string;
  value: string;
  delta: string;
  points: AnalyticsChartPoint[];
};

export type ProviderStatus = {
  id: string;
  name: string;
  connected: boolean;
  detail: string;
};

export type SystemMetric = {
  id: string;
  label: string;
  value: string;
  detail: string;
};

export type NotificationPreview = {
  id: string;
  title: string;
  meta: string;
  time: string;
  href?: string;
};

/** Platform operations center — no content CMS widgets. */
export type DashboardHomeData = {
  stats: DashboardStat[];
  opsShortcuts: OpsShortcutItem[];
  activity: ActivityItem[];
  analytics: AnalyticsMetric[];
  analyticsCharts: AnalyticsChartCard[];
  aiStatus: ProviderStatus[];
  system: SystemMetric[];
  notifications: {
    unreadCount: number;
    items: NotificationPreview[];
  };
};
