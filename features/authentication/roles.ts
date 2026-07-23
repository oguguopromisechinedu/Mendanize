/** Role / permission helpers — safe for client + proxy (MES-030). */

import type { AdminRoleKey } from "@prisma/client";

export const ADMIN_ROLE_KEYS: AdminRoleKey[] = [
  "SUPER_ADMINISTRATOR",
  "ADMINISTRATOR",
  "EDITOR",
  "CONTENT_MANAGER",
  "ANALYTICS_MANAGER",
  "SUPPORT_MANAGER",
];

export const PERMISSIONS = {
  DASHBOARD_ACCESS: "dashboard.access",
  USERS_MANAGE: "users.manage",
  CONTENT_MANAGE: "content.manage",
  SETTINGS_MANAGE: "settings.manage",
  ANALYTICS_VIEW: "analytics.view",
  BILLING_VIEW: "billing.view",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const STAFF_ROLE_KEYS: AdminRoleKey[] = [
  "SUPER_ADMINISTRATOR",
  "ADMINISTRATOR",
  "EDITOR",
  "CONTENT_MANAGER",
  "ANALYTICS_MANAGER",
  "SUPPORT_MANAGER",
];

const ADMIN_PLUS: AdminRoleKey[] = [
  "SUPER_ADMINISTRATOR",
  "ADMINISTRATOR",
];

export function isStaffRoleKey(role: AdminRoleKey | string | null | undefined) {
  return !!role && STAFF_ROLE_KEYS.includes(role as AdminRoleKey);
}

export function isAdminRoleKey(role: AdminRoleKey | string | null | undefined) {
  return !!role && ADMIN_PLUS.includes(role as AdminRoleKey);
}

/** @deprecated Prefer isStaffRoleKey — kept for transitional imports */
export function isStaffRole(role: unknown) {
  return isStaffRoleKey(role as AdminRoleKey);
}

/** @deprecated Prefer isAdminRoleKey */
export function isAdminRole(role: unknown) {
  return isAdminRoleKey(role as AdminRoleKey);
}

/** @deprecated Learners no longer carry a role enum */
export function isLearnerRole(_role?: unknown) {
  return true;
}
