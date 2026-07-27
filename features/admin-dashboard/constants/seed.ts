import type { DashboardHomeData } from "../types/types";

/** Empty ops dashboard shell — live loaders fill real counts; never invent KPIs. */
export const SEEDED_DASHBOARD_HOME: DashboardHomeData = {
  stats: [
    { id: "visitors", label: "Total Visitors", value: "0", trend: "—" },
    { id: "pageViews", label: "Page Views", value: "0", trend: "—" },
    { id: "subscribers", label: "Subscribers", value: "0", trend: "—" },
    {
      id: "notifications",
      label: "Unread Notifications",
      value: "0",
      trend: "—",
    },
    {
      id: "aiProviders",
      label: "AI Providers Connected",
      value: "0",
      trend: "—",
    },
    {
      id: "storage",
      label: "Storage Usage",
      value: "—",
      trend: "From media library",
    },
  ],
  opsShortcuts: [
    {
      id: "ops1",
      label: "Analytics",
      href: "/dashboard/analytics",
      description: "Traffic & engagement",
    },
    {
      id: "ops2",
      label: "Notifications",
      href: "/dashboard/notifications",
      description: "Platform alerts",
    },
    {
      id: "ops3",
      label: "Activity Log",
      href: "/dashboard/activity-log",
      description: "Admin audit trail",
    },
    {
      id: "ops4",
      label: "System Logs",
      href: "/dashboard/system-logs",
      description: "Runtime & errors",
    },
    {
      id: "ops5",
      label: "AI & Integrations",
      href: "/dashboard/integrations",
      description: "Provider connections",
    },
    {
      id: "ops6",
      label: "Billing overview",
      href: "/dashboard/billing-overview",
      description: "Plans & revenue",
    },
    {
      id: "ops7",
      label: "Founder Dashboard",
      href: "/dashboard/bi",
      description: "Business intelligence",
    },
  ],
  activity: [],
  analytics: [
    { id: "an1", label: "Visitors", value: "0", delta: "—" },
    { id: "an2", label: "Page Views", value: "0", delta: "—" },
    { id: "an3", label: "Avg Read Time", value: "—", delta: "—" },
    { id: "an4", label: "Bounce Rate", value: "—", delta: "—" },
    { id: "an5", label: "SEO Score", value: "—", delta: "—" },
    { id: "an6", label: "New Subscribers", value: "0", delta: "—" },
  ],
  analyticsCharts: [
    {
      id: "an1",
      label: "Visitors",
      value: "0",
      delta: "—",
      points: [],
    },
    {
      id: "an2",
      label: "Page Views",
      value: "0",
      delta: "—",
      points: [],
    },
    {
      id: "an3",
      label: "Avg Read Time",
      value: "—",
      delta: "—",
      points: [],
    },
    {
      id: "an4",
      label: "Bounce Rate",
      value: "—",
      delta: "—",
      points: [],
    },
    {
      id: "an5",
      label: "SEO Score",
      value: "—",
      delta: "—",
      points: [],
    },
    {
      id: "an6",
      label: "New Subscribers",
      value: "0",
      delta: "—",
      points: [],
    },
  ],
  aiStatus: [],
  system: [
    { id: "s1", label: "Storage Usage", value: "—", detail: "No media yet" },
    { id: "s2", label: "Bandwidth Usage", value: "—", detail: "Not tracked" },
    { id: "s3", label: "AI Credits Remaining", value: "—", detail: "Not tracked" },
  ],
  notifications: {
    unreadCount: 0,
    items: [],
  },
};
