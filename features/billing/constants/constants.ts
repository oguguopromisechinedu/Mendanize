export const BILLING_PATHS = {
  pricing: "/pricing",
  dashboard: "/dashboard/settings/billing",
  legacyDashboard: "/dashboard/billing",
} as const;

export const PAID_PLAN_OPTIONS = [
  { id: "professional", label: "Professional" },
  { id: "enterprise", label: "Enterprise" },
] as const;
