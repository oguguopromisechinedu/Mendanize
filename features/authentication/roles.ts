/** Role helpers without session/DB imports — safe for client + proxy. */

import type { UserRole } from "@prisma/client";

const LEARNER_ROLES: UserRole[] = ["LEARNER", "USER"];
const STAFF_ROLES: UserRole[] = ["EDITOR", "ADMIN", "SUPER_ADMIN"];
const ADMIN_ROLES: UserRole[] = ["ADMIN", "SUPER_ADMIN"];

export function isLearnerRole(role: UserRole) {
  return LEARNER_ROLES.includes(role);
}

export function isStaffRole(role: UserRole) {
  return STAFF_ROLES.includes(role);
}

export function isAdminRole(role: UserRole) {
  return ADMIN_ROLES.includes(role);
}
