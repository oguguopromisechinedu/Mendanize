import { randomBytes } from "crypto";

import { getPrisma } from "@/lib/db/prisma";

const VERIFY_PREFIX = "verify:";

export function verificationIdentifier(email: string) {
  return `${VERIFY_PREFIX}${email.toLowerCase()}`;
}

export async function createEmailVerificationToken(email: string) {
  const normalized = email.toLowerCase();
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);

  const prisma = getPrisma();
  await prisma.verificationToken.deleteMany({
    where: { identifier: verificationIdentifier(normalized) },
  });
  await prisma.verificationToken.create({
    data: {
      identifier: verificationIdentifier(normalized),
      token,
      expires,
    },
  });

  return token;
}

export async function sendEmailVerification(params: {
  userId: string;
  email: string;
  name?: string | null;
}) {
  const token = await createEmailVerificationToken(params.email);
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";
  const verifyUrl = `${base}/verify-email?token=${token}&email=${encodeURIComponent(params.email)}`;

  const { dispatch } = await import("@/services/notification");
  await dispatch({
    channel: "email",
    template: "email_verification",
    userId: params.userId,
    email: params.email,
    payload: {
      verifyUrl,
      name: params.name ?? "there",
    },
  });

  if (process.env.NODE_ENV !== "production") {
    console.info(`[auth] email verification for ${params.email}: ${verifyUrl}`);
  }

  return verifyUrl;
}

export async function verifyEmailToken(email: string, token: string) {
  const normalized = email.toLowerCase();
  const record = await getPrisma().verificationToken.findFirst({
    where: {
      identifier: verificationIdentifier(normalized),
      token,
    },
  });

  if (!record || record.expires < new Date()) {
    return { ok: false as const, message: "Verification link is invalid or expired." };
  }

  await getPrisma().publicUser.update({
    where: { email: normalized },
    data: { emailVerified: new Date() },
  });
  await getPrisma().verificationToken.deleteMany({
    where: { identifier: verificationIdentifier(normalized) },
  });

  return { ok: true as const, message: "Email verified. You can sign in now." };
}
