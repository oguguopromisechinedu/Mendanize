/** Shared cookie helpers for dual Auth.js instances (MES-030). */

const isProd = process.env.NODE_ENV === "production";

export function sessionCookieOptions(name: string) {
  return {
    sessionToken: {
      name,
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: isProd,
      },
    },
  };
}

export const PUBLIC_SESSION_COOKIE = "mendanize.public.session-token";
export const ADMIN_SESSION_COOKIE = "mendanize.admin.session-token";
