/**
 * Canonical session / authorization helpers (MES-006).
 * All modules must use these — do not invent parallel session logic.
 */

import { auth } from "@/auth";
import type { AuthSession, UserProfileFoundation } from "../types/types";
import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { isAdminRole, isStaffRole } from "../roles";

export { isAdminRole, isLearnerRole, isStaffRole } from "../roles";

export async function getSession(): Promise<AuthSession | null> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return null;

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      role: session.user.role,
    },
    expires: session.expires,
  };
}

/** Returns session or null when unauthenticated. */
export async function requireUser() {
  return getSession();
}

/** Admin or Super Admin — used by dashboard surfaces. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session || !isAdminRole(session.user.role)) return null;
  return session;
}

/** Editor and above. */
export async function requireEditor() {
  const session = await getSession();
  if (!session || !isStaffRole(session.user.role)) return null;
  return session;
}

export async function getUserProfileFoundation(
  userId: string
): Promise<UserProfileFoundation | null> {
  if (!isDatabaseConfigured()) return null;

  const user = await getPrisma().user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
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
    role: user.role,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    accountStatus: user.emailVerified ? "active" : "unverified",
  };
}
