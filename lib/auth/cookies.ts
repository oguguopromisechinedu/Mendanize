/** Shared cookie helpers for dual Auth.js instances (MES-030). */

const isProd = process.env.NODE_ENV === "production";

export function sessionCookieOptions(name: string) {
  const isAdminCookie = name.includes(".admin.");
  return {
    sessionToken: {
      name,
      options: {
        httpOnly: true,
        // Admin surface prefers strict CSRF posture; public keeps lax for OAuth returns.
        sameSite: (isAdminCookie ? "strict" : "lax") as "strict" | "lax",
        path: "/",
        secure: isProd,
      },
    },
  };
}

export const PUBLIC_SESSION_COOKIE = "mendanize.public.session-token";
export const ADMIN_SESSION_COOKIE = "mendanize.admin.session-token";
