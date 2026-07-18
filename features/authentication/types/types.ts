/** MES-006 authentication types — single session contract. */

import type { UserRole } from "@prisma/client";

export type { UserRole };

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: UserRole;
};

export type AuthSession = {
  user: AuthUser;
  expires: string;
};

/** Profile foundation fields (MES-006) — editing UI is out of scope. */
export type UserProfileFoundation = {
  id: string;
  fullName: string | null;
  email: string;
  image: string | null;
  role: UserRole;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
  accountStatus: "active" | "unverified";
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
