/**
 * Auth route constants for proxy/middleware (MES-006).
 * Session resolution lives in `features/authentication` + root `auth.ts` (Auth.js / NextAuth).
 */

export const protectedPrefixes = [
  "/dashboard",
  "/workspace",
  "/onboarding",
  "/learning",
  "/ask",
] as const

export const adminPrefixes = ["/dashboard"] as const

export const authRoutes = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
] as const

export function isProtectedRoute(pathname: string) {
  return protectedPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )
}

export function isAuthRoute(pathname: string) {
  return authRoutes.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}
