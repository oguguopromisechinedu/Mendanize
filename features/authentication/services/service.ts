/**
 * Canonical dual-domain session helpers (MES-030).
 * PublicUser and Admin sessions are fully independent.
 */

import { publicAuth } from "@/lib/auth/public";
import { adminAuth } from "@/lib/auth/admin";
import type { AdminRoleKey } from "@prisma/client";
import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import {
  isAdminRoleKey,
  isStaffRoleKey,
  type PermissionKey,
} from "../roles";
import type {
  AdminSession,
  PublicSession,
  PublicUserProfile,
} from "../types/types";

export {
  isAdminRole,
  isAdminRoleKey,
  isLearnerRole,
  isStaffRole,
  isStaffRoleKey,
  PERMISSIONS,
} from "../roles";

export async function getPublicSession(): Promise<PublicSession | null> {
  const session = await publicAuth();
  if (!session?.user?.id || !session.user.email) return null;
  if (session.user.domain !== "public") return null;

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      domain: "public",
    },
    expires: session.expires,
  };
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await adminAuth();
  if (!session?.admin?.id || !session.admin.email) return null;

  return {
    admin: {
      id: session.admin.id,
      email: session.admin.email,
      name: session.admin.name,
      image: session.admin.image,
      domain: "admin",
      roleKey: session.admin.roleKey,
      roleName: session.admin.roleName,
      permissions: session.admin.permissions,
    },
    expires: session.expires,
  };
}

/** Authenticated PublicUser or null. */
export async function requirePublicUser() {
  return getPublicSession();
}

/** Authenticated Admin with administrator-tier role (ADMINISTRATOR+). */
export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) return null;
  if (!isAdminRoleKey(session.admin.roleKey)) return null;
  return session;
}

/** Authenticated Admin with SUPER_ADMINISTRATOR role only. */
export async function requireSuperAdministrator() {
  const session = await getAdminSession();
  if (!session) return null;
  if (session.admin.roleKey !== "SUPER_ADMINISTRATOR") return null;
  return session;
}

/** Admin with dashboard.access (or any staff role). */
export async function requireEditor() {
  const session = await getAdminSession();
  if (!session) return null;
  if (
    !isStaffRoleKey(session.admin.roleKey) &&
    !session.admin.permissions.includes("dashboard.access")
  ) {
    return null;
  }
  return session;
}

/** Admin with a specific permission key (server-side RBAC). */
export async function requirePermission(permission: PermissionKey | string) {
  const session = await getAdminSession();
  if (!session) return null;
  if (session.admin.roleKey === "SUPER_ADMINISTRATOR") return session;
  if (!session.admin.permissions.includes(permission)) return null;
  return session;
}

/**
 * @deprecated Use requirePublicUser or requireAdmin explicitly.
 * Returns a public session when present (never an admin session).
 */
export async function getSession() {
  return getPublicSession();
}

/**
 * @deprecated Use requirePublicUser.
 */
export async function requireUser() {
  return getPublicSession();
}

export async function getUserProfileFoundation(
  publicUserId: string,
): Promise<PublicUserProfile | null> {
  if (!isDatabaseConfigured()) return null;

  const user = await getPrisma().publicUser.findUnique({
    where: { id: publicUserId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    fullName: user.name,
    email: user.email,
    image: user.image,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    accountStatus: user.emailVerified ? "active" : "unverified",
  };
}

export function adminHasPermission(
  session: AdminSession,
  permission: string,
) {
  if (session.admin.roleKey === "SUPER_ADMINISTRATOR") return true;
  return session.admin.permissions.includes(permission);
}

export function isSuperAdministrator(roleKey: AdminRoleKey) {
  return roleKey === "SUPER_ADMINISTRATOR";
}

export { isAdminRoleKey as isAdminPlus };
