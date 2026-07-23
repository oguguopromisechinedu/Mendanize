export const BILLING_PATHS = {
  pricing: "/pricing",
  /** PublicUser billing management (MES-021 / MES-030) */
  dashboard: "/account/billing",
  /** @deprecated moved out of Admin dashboard */
  legacyDashboard: "/dashboard/settings/billing",
  /** Admin read-only revenue overview */
  adminOverview: "/dashboard/billing-overview",
} as const;

export const PAID_PLAN_OPTIONS = [
  { id: "professional", label: "Professional" },
  { id: "enterprise", label: "Enterprise" },
] as const;
