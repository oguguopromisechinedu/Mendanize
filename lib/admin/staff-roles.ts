import type { AdminRoleKey } from "@prisma/client"

/** Human labels for founder dashboard staff management. */
export const STAFF_ROLE_LABELS: Record<AdminRoleKey, string> = {
  SUPER_ADMINISTRATOR: "Founder",
  ADMINISTRATOR: "Admin",
  EDITOR: "Editor",
  CONTENT_MANAGER: "Moderator",
  ANALYTICS_MANAGER: "Analytics",
  SUPPORT_MANAGER: "Support Staff",
}

/** Roles a founder can assign when inviting staff. */
export const INVITABLE_STAFF_ROLES: AdminRoleKey[] = [
  "ADMINISTRATOR",
  "EDITOR",
  "CONTENT_MANAGER",
  "SUPPORT_MANAGER",
]

export function staffRoleLabel(role: AdminRoleKey | string): string {
  return STAFF_ROLE_LABELS[role as AdminRoleKey] ?? role
}
