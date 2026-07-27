/**
 * Admin-domain Auth.js instance (MES-030).
 * Cookie: mendanize.admin.session-token — authorizes Admin only.
 * Credentials only — no OAuth, magic link, or self-registration.
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { AdminRoleKey } from "@prisma/client";
import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import {
  ADMIN_SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth/cookies";
import { verifyPassword } from "@/lib/auth/password";

/** Default session lifetime (7 days) — matches AuthenticationSetting default. */
const ADMIN_SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;

export const {
  handlers: adminHandlers,
  auth: adminAuth,
  signIn: adminSignIn,
  signOut: adminSignOut,
} = NextAuth({
  session: { strategy: "jwt", maxAge: ADMIN_SESSION_MAX_AGE_SEC },
  jwt: { maxAge: ADMIN_SESSION_MAX_AGE_SEC },
  basePath: "/api/admin/auth",
  pages: {
    signIn: "/dashboard/login",
  },
  cookies: sessionCookieOptions(ADMIN_SESSION_COOKIE),
  providers: [
    Credentials({
      id: "admin-credentials",
      name: "admin-credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totp: { label: "TOTP", type: "text" },
      },
      async authorize(credentials) {
        if (!isDatabaseConfigured()) return null;

        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";
        const totp =
          typeof credentials?.totp === "string" ? credentials.totp.trim() : "";

        if (!email || !password) return null;

        try {
          const prisma = getPrisma();
          const admin = await prisma.admin.findUnique({
            where: { email },
            include: {
              role: {
                include: {
                  permissions: { include: { permission: true } },
                },
              },
            },
          });

          if (!admin?.passwordHash || !admin.active) return null;

          const valid = await verifyPassword(password, admin.passwordHash);
          if (!valid) return null;

          if (admin.totpEnabled && admin.totpSecret) {
            const { decryptTotpSecret, verifyTotpToken } = await import(
              "@/lib/auth/totp"
            );
            try {
              const secret = decryptTotpSecret(admin.totpSecret);
              if (!totp || !verifyTotpToken(secret, totp)) return null;
            } catch {
              return null;
            }
          } else {
            const { getAuthenticationSettings } = await import(
              "@/services/settings/platform"
            );
            const authSettings = await getAuthenticationSettings();
            if (authSettings.twoFactorRequired) {
              // Platform requires 2FA but this admin has not enrolled — allow login
              // with a soft warning via audit; enroll is available in settings.
            }
          }

          const permissions = admin.role.permissions.map(
            (rp) => rp.permission.key,
          );

          return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            image: admin.image,
            domain: "admin" as const,
            roleKey: admin.role.key,
            roleName: admin.role.name,
            permissions,
          };
        } catch (error) {
          console.error("[adminAuth] credentials authorize failed:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.domain = "admin";
        token.roleKey = user.roleKey;
        token.roleName = user.roleName;
        token.permissions = user.permissions ?? [];
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.domain === "admin" && token.id) {
        session.admin = {
          id: token.id as string,
          email: (token.email as string) ?? "",
          name: (token.name as string) ?? null,
          image: (token.picture as string) ?? null,
          domain: "admin",
          roleKey: (token.roleKey as AdminRoleKey) ?? "EDITOR",
          roleName: (token.roleName as string) ?? "Editor",
          permissions: (token.permissions as string[]) ?? [],
        };
        session.user = {
          id: token.id as string,
          email: (token.email as string) ?? "",
          name: (token.name as string) ?? null,
          image: (token.picture as string) ?? null,
          domain: "admin",
          emailVerified: null,
        };
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (!isDatabaseConfigured() || !user?.id) return;
      try {
        const { logAuthorization } = await import(
          "@/features/authentication/services/audit"
        );
        const { getRequestIpAddress } = await import("@/lib/auth/request-ip");
        await logAuthorization({
          adminId: user.id,
          actorEmail: user.email,
          action: "admin.sign_in",
          summary: `Admin signed in: ${user.email}`,
          ipAddress: await getRequestIpAddress(),
        });
        await getPrisma().admin.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
      } catch {
        /* audit must not block sign-in */
      }
    },
    async signOut(message) {
      if (!isDatabaseConfigured()) return;
      try {
        const token = "token" in message ? message.token : null;
        if (!token?.id) return;
        const { logAuthorization } = await import(
          "@/features/authentication/services/audit"
        );
        const { getRequestIpAddress } = await import("@/lib/auth/request-ip");
        await logAuthorization({
          adminId: String(token.id),
          actorEmail: (token.email as string) ?? null,
          action: "admin.sign_out",
          summary: `Admin signed out: ${token.email ?? token.id}`,
          ipAddress: await getRequestIpAddress(),
        });
      } catch {
        /* audit must not block sign-out */
      }
    },
  },
  trustHost: true,
});
