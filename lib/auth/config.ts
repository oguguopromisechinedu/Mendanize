/**
 * Auth scaffold — wire Clerk or NextAuth here when ready.
 * Do not import auth providers until credentials are configured.
 */

export type AuthProvider = "clerk" | "nextauth" | "supabase" | "none";

export const authConfig = {
  provider: (process.env.AUTH_PROVIDER ?? "none") as AuthProvider,
  /** Routes that require authentication once auth is enabled */
  protectedRoutes: [
    "/dashboard",
    "/dashboard/content",
    "/dashboard/analytics",
    "/dashboard/settings",
  ],
  publicRoutes: ["/", "/pricing", "/learn", "/blog", "/tools/blog-generator"],
} as const;

/** Placeholder — replace with real session check when auth is integrated */
export async function getSession(): Promise<null> {
  return null;
}

export function isProtectedRoute(pathname: string): boolean {
  return authConfig.protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}
