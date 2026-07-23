/**
 * Shared NextAuth module augmentation for dual-domain sessions (MES-030).
 */

import type { DefaultSession } from "next-auth";
import type { AdminRoleKey } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      domain: "public" | "admin";
      emailVerified?: Date | null;
    } & DefaultSession["user"];
    admin?: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      domain: "admin";
      roleKey: AdminRoleKey;
      roleName: string;
      permissions: string[];
    };
  }

  interface User {
    domain?: "public" | "admin";
    roleKey?: AdminRoleKey;
    roleName?: string;
    permissions?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    domain?: "public" | "admin";
    roleKey?: AdminRoleKey;
    roleName?: string;
    permissions?: string[];
  }
}
