/** MES-030 dual-domain authentication types */

import type { AdminRoleKey } from "@prisma/client";

export type { AdminRoleKey };

/** @deprecated Use AdminRoleKey — kept for transitional imports */
export type UserRole = AdminRoleKey | "LEARNER" | "USER";

export type PublicUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  domain: "public";
};

export type AdminUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  domain: "admin";
  roleKey: AdminRoleKey;
  roleName: string;
  permissions: string[];
};

export type PublicSession = {
  user: PublicUser;
  expires: string;
};

export type AdminSession = {
  admin: AdminUser;
  expires: string;
};

/** @deprecated Prefer PublicSession | AdminSession */
export type AuthUser = PublicUser | (AdminUser & { role?: UserRole });

/** @deprecated Prefer PublicSession */
export type AuthSession = PublicSession;

export type PublicUserProfile = {
  id: string;
  fullName: string | null;
  email: string;
  image: string | null;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
  accountStatus: "active" | "unverified";
};

/** @deprecated Prefer PublicUserProfile */
export type UserProfileFoundation = PublicUserProfile & {
  role?: UserRole;
};

export type SignInInput = {
  email: string;
  password: string;
};

export type SignUpInput = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type ForgotPasswordInput = {
  email: string;
};

export type ResetPasswordInput = {
  token: string;
  email: string;
  password: string;
  confirmPassword: string;
};
