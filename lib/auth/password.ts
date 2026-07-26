/** Shared password hashing for Admin + PublicUser credentials. */

import bcrypt from "bcryptjs";

/** bcrypt cost factor — keep consistent across auth surfaces. */
export const BCRYPT_COST = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}
