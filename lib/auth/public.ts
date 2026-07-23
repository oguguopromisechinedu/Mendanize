/**
 * Public-domain Auth.js instance (MES-030).
 * Cookie: mendanize.public.session-token — authorizes PublicUser only.
 */

import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import {
  PUBLIC_SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth/cookies";

function buildPublicProviders(): NextAuthConfig["providers"] {
  const providers: NextAuthConfig["providers"] = [];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
      }),
    );
  }

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    providers.push(
      GitHub({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
      }),
    );
  }

  providers.push(
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!isDatabaseConfigured()) return null;

        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) return null;

        try {
          const prisma = getPrisma();
          const user = await prisma.publicUser.findUnique({ where: { email } });
          if (!user?.passwordHash) return null;

          const valid = await bcrypt.compare(password, user.passwordHash);
          if (!valid) return null;

          const { getAuthenticationSettings } = await import(
            "@/services/settings/platform"
          );
          const authSettings = await getAuthenticationSettings();
          if (authSettings.emailVerification && !user.emailVerified) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            domain: "public" as const,
          };
        } catch (error) {
          console.error("[publicAuth] credentials authorize failed:", error);
          return null;
        }
      },
    }),
  );

  return providers;
}

export const {
  handlers: publicHandlers,
  auth: publicAuth,
  signIn: publicSignIn,
  signOut: publicSignOut,
} = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
    newUser: "/onboarding",
  },
  cookies: sessionCookieOptions(PUBLIC_SESSION_COOKIE),
  providers: buildPublicProviders(),
  callbacks: {
    async signIn({ user, account }) {
      if (!account || account.provider === "credentials") return true;
      if (!isDatabaseConfigured() || !user.email) return false;

      const prisma = getPrisma();
      const email = user.email.toLowerCase();
      let existing = await prisma.publicUser.findUnique({ where: { email } });
      if (!existing) {
        existing = await prisma.publicUser.create({
          data: {
            email,
            name: user.name,
            image: user.image,
            emailVerified: new Date(),
            profile: { create: {} },
            subscription: { create: { plan: "FREE" } },
            settings: { create: {} },
          },
        });
      }

      const linked = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        },
      });
      if (!linked) {
        await prisma.account.create({
          data: {
            publicUserId: existing.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state:
              typeof account.session_state === "string"
                ? account.session_state
                : undefined,
          },
        });
      }

      user.id = existing.id;
      user.domain = "public";
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.domain = "public";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.domain === "public") {
        session.user.id = token.id as string;
        session.user.domain = "public";
      }
      return session;
    },
  },
  trustHost: true,
});
