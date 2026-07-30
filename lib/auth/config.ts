/**
 * Auth route constants for proxy/middleware (MES-030).
 * Public and Admin sessions are fully independent.
 */

export const publicProtectedPrefixes = [
  "/account",
  "/ask",
  "/workspace",
  "/onboarding",
  "/learning",
  "/my-learning",
] as const;

export const adminPrefixes = ["/dashboard"] as const;

/** Admin login is public within the dashboard prefix */
export const adminAuthRoutes = [
  "/dashboard/login",
  "/dashboard/forgot-password",
  "/dashboard/reset-password",
  "/dashboard/accept-invite",
] as const;

export const publicAuthRoutes = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
] as const;

/** @deprecated Prefer publicProtectedPrefixes */
export const protectedPrefixes = [
  "/dashboard",
  ...publicProtectedPrefixes,
] as const;

export const authRoutes = publicAuthRoutes;

export function isPublicProtectedRoute(pathname: string) {
  return publicProtectedPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function isAdminRoute(pathname: string) {
  if (
    adminAuthRoutes.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  ) {
    return false;
  }
  return adminPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function isAdminAuthRoute(pathname: string) {
  return adminAuthRoutes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function isProtectedRoute(pathname: string) {
  return isAdminRoute(pathname) || isPublicProtectedRoute(pathname);
}

export function isAuthRoute(pathname: string) {
  return publicAuthRoutes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
