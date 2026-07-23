"use server";

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { publicSignIn, publicSignOut } from "@/lib/auth/public";
import { adminSignIn, adminSignOut } from "@/lib/auth/admin";
import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "../validators/schema";

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export async function signInWithCredentials(
  input: unknown,
): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Invalid credentials",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  if (isDatabaseConfigured()) {
    const email = parsed.data.email.toLowerCase();
    const user = await getPrisma().publicUser.findUnique({ where: { email } });
    if (user?.passwordHash) {
      const { getAuthenticationSettings } = await import(
        "@/services/settings/platform"
      );
      const authSettings = await getAuthenticationSettings();
      if (authSettings.emailVerification && !user.emailVerified) {
        return {
          ok: false,
          message:
            "Verify your email before signing in. Check your inbox or request a new link.",
        };
      }
    }
  }

  try {
    await publicSignIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, message: "Invalid email or password" };
    }
    throw error;
  }
}

export async function adminSignInWithCredentials(
  input: unknown,
): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Invalid credentials",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  try {
    await adminSignIn("admin-credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, message: "Invalid email or password" };
    }
    throw error;
  }
}

export async function signUpWithCredentials(
  input: unknown,
): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Fix the highlighted fields",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  if (!isDatabaseConfigured()) {
    return { ok: false, message: "Registration is temporarily unavailable" };
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();
  const prisma = getPrisma();

  const existing = await prisma.publicUser.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return { ok: false, message: "An account with this email already exists" };
  }

  // Never allow registering into Admin via public sign-up
  const adminCollision = await prisma.admin.findUnique({
    where: { email: normalizedEmail },
  });
  if (adminCollision) {
    return { ok: false, message: "An account with this email already exists" };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.publicUser.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
      profile: { create: {} },
      subscription: { create: { plan: "FREE" } },
      settings: { create: {} },
    },
  });

  try {
    const { sendEmailVerification } = await import("../services/verification");
    await sendEmailVerification({
      userId: user.id,
      email: normalizedEmail,
      name,
    });
  } catch {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[auth] verification email failed for ${normalizedEmail}`);
    }
  }

  try {
    const { dispatch } = await import("@/services/notification");
    await dispatch({
      channel: "email",
      template: "welcome",
      userId: user.id,
      email: normalizedEmail,
      payload: { name: name ?? "learner" },
    });
    await dispatch({
      channel: "in_app",
      template: "system.info",
      userId: user.id,
      title: "Welcome to Mendanize",
      body: "Your learning space is ready. Explore guides and Ask Mendanize AI anytime.",
      type: "SUCCESS",
      link: "/account",
    });
  } catch {
    /* welcome notification failures must not block signup */
  }

  return {
    ok: true,
    message: "Account created. Check your email to verify your address.",
  };
}

export async function verifyEmailWithToken(input: {
  email: string;
  token: string;
}): Promise<ActionResult> {
  if (!isDatabaseConfigured()) {
    return { ok: false, message: "Verification is temporarily unavailable" };
  }

  const email = input.email?.trim().toLowerCase();
  const token = input.token?.trim();
  if (!email || !token) {
    return { ok: false, message: "Verification link is incomplete." };
  }

  const { verifyEmailToken } = await import("../services/verification");
  const result = await verifyEmailToken(email, token);
  if (!result.ok) return { ok: false, message: result.message };
  return { ok: true, message: result.message };
}

export async function resendVerificationEmail(input: {
  email: string;
}): Promise<ActionResult> {
  if (!isDatabaseConfigured()) {
    return {
      ok: true,
      message: "If an account exists, a verification email has been sent.",
    };
  }

  const email = input.email?.trim().toLowerCase();
  if (!email) {
    return { ok: false, message: "Enter a valid email" };
  }

  const user = await getPrisma().publicUser.findUnique({ where: { email } });
  if (user && !user.emailVerified) {
    try {
      const { sendEmailVerification } = await import(
        "../services/verification"
      );
      await sendEmailVerification({
        userId: user.id,
        email,
        name: user.name,
      });
    } catch {
      if (process.env.NODE_ENV !== "production") {
        console.info(`[auth] resend verification failed for ${email}`);
      }
    }
  }

  return {
    ok: true,
    message:
      "If an account exists and is unverified, a new verification email has been sent.",
  };
}

export async function signOutAction(): Promise<ActionResult> {
  await publicSignOut({ redirect: false });
  return { ok: true };
}

export async function adminSignOutAction(): Promise<ActionResult> {
  await adminSignOut({ redirect: false });
  return { ok: true };
}

export async function requestPasswordReset(
  input: unknown,
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Enter a valid email",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      ok: true,
      message: "If an account exists, reset instructions have been prepared.",
    };
  }

  const email = parsed.data.email.toLowerCase();
  const user = await getPrisma().publicUser.findUnique({ where: { email } });
  if (user?.passwordHash) {
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60);
    await getPrisma().verificationToken.deleteMany({
      where: { identifier: `reset:${email}` },
    });
    await getPrisma().verificationToken.create({
      data: {
        identifier: `reset:${email}`,
        token,
        expires,
      },
    });
    try {
      const base =
        process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
        "http://localhost:3000";
      const resetUrl = `${base}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
      const { dispatch } = await import("@/services/notification");
      await dispatch({
        channel: "email",
        template: "password_reset",
        userId: user.id,
        email,
        payload: { resetUrl, name: user.name ?? "there" },
      });
    } catch {
      if (process.env.NODE_ENV !== "production") {
        console.info(`[auth] password reset token for ${email}: ${token}`);
      }
    }
  }

  return {
    ok: true,
    message: "If an account exists, reset instructions have been prepared.",
  };
}

export async function resetPassword(input: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Fix the highlighted fields",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  if (!isDatabaseConfigured()) {
    return { ok: false, message: "Reset is temporarily unavailable" };
  }

  const email = parsed.data.email.toLowerCase();
  const record = await getPrisma().verificationToken.findFirst({
    where: {
      identifier: `reset:${email}`,
      token: parsed.data.token,
    },
  });

  if (!record || record.expires < new Date()) {
    return { ok: false, message: "Reset link is invalid or expired" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await getPrisma().publicUser.update({
    where: { email },
    data: { passwordHash },
  });
  await getPrisma().verificationToken.deleteMany({
    where: { identifier: `reset:${email}` },
  });

  return { ok: true, message: "Password updated. You can sign in." };
}
