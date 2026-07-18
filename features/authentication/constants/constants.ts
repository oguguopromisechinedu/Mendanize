/** Auth feature constants (MES-006) */

export const AUTH_ROUTES = {
  signIn: "/sign-in",
  signUp: "/sign-up",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyEmail: "/verify-email",
} as const;

export const DEFAULT_LEARNER_ROLE = "LEARNER" as const;
