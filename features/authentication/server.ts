/** Server-only session helpers — features/authentication (MES-030) */

export {
  getSession,
  getPublicSession,
  getAdminSession,
  requireUser,
  requirePublicUser,
  requireAdmin,
  requireEditor,
  requirePermission,
  getUserProfileFoundation,
  adminHasPermission,
  isSuperAdministrator,
  isAdminRole,
  isStaffRole,
  isLearnerRole,
  isAdminRoleKey,
  isStaffRoleKey,
  PERMISSIONS,
} from "./services/service";

export { logAuthorization } from "./services/audit";
