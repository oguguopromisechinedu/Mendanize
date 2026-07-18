export const NOTIFICATIONS_NAV = [
  { label: "Dashboard", href: "/dashboard/notifications" },
  { label: "Center", href: "/dashboard/notifications/center" },
  { label: "Templates", href: "/dashboard/notifications/templates" },
  { label: "Email templates", href: "/dashboard/notifications/email-templates" },
  { label: "Announcements", href: "/dashboard/notifications/announcements" },
  { label: "History", href: "/dashboard/notifications/history" },
  { label: "Delivery", href: "/dashboard/notifications/delivery" },
  { label: "Preferences", href: "/dashboard/notifications/preferences" },
] as const;

export const TYPE_FILTERS = [
  "ALL",
  "INFO",
  "SUCCESS",
  "WARNING",
  "ERROR",
  "SECURITY",
  "SYSTEM",
  "LEARNING",
  "AI",
  "ANNOUNCEMENT",
  "BILLING",
] as const;

export const STATUS_FILTERS = ["ALL", "UNREAD", "READ", "ARCHIVED"] as const;
