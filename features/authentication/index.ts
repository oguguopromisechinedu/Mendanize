/** Client-safe exports — features/authentication (MES-006)
 * Session/require helpers: `@/features/authentication/server`
 */

export {
  isAdminRole,
  isStaffRole,
  isLearnerRole,
} from "./roles"

export {
  signInWithCredentials,
  signUpWithCredentials,
  signOutAction,
  requestPasswordReset,
  resetPassword,
  verifyEmailWithToken,
  resendVerificationEmail,
} from "./actions/actions"

export {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./validators/schema"

export type {
  AuthSession,
  AuthUser,
  UserProfileFoundation,
  UserRole,
} from "./types/types"
