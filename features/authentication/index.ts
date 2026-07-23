/** Client-safe exports — features/authentication (MES-030)
 * Session/require helpers: `@/features/authentication/server`
 */

export {
  isAdminRole,
  isStaffRole,
  isLearnerRole,
  isAdminRoleKey,
  isStaffRoleKey,
  PERMISSIONS,
} from "./roles";

export {
  signInWithCredentials,
  signUpWithCredentials,
  signOutAction,
  requestPasswordReset,
  resetPassword,
  verifyEmailWithToken,
  resendVerificationEmail,
  adminSignInWithCredentials,
  adminSignOutAction,
} from "./actions/actions";

export {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./validators/schema";

export type {
  AuthSession,
  AuthUser,
  PublicSession,
  AdminSession,
  PublicUser,
  AdminUser,
  PublicUserProfile,
  UserProfileFoundation,
  UserRole,
  AdminRoleKey,
} from "./types/types";
