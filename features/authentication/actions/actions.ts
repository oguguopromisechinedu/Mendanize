"use server";

import { randomBytes } from "crypto";
import { AuthError } from "next-auth";
import { z } from "zod";
import { publicSignIn, publicSignOut } from "@/lib/auth/public";
import { adminSignIn, adminSignOut } from "@/lib/auth/admin";
import { hashPassword } from "@/lib/auth/password";
import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "../validators/schema";

export type ActionResult =
  | { ok: true; message?: string }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string[]>;
      needsTotp?: boolean;
    };

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
  const parsed = signInSchema
    .extend({
      totp: z.string().max(12).optional(),
    })
    .safeParse(input);
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

  const email = parsed.data.email.toLowerCase();
  const totp = parsed.data.totp?.trim();
  const { rateLimit } = await import("@/lib/rate-limit");
  const { getRequestIpAddress } = await import("@/lib/auth/request-ip");
  const { logAuthorization } = await import("../services/audit");
  const ip = (await getRequestIpAddress()) ?? "unknown";

  const limited = await rateLimit(`admin-login:${ip}:${email}`, 8);
  if (!limited.success) {
    await logAuthorization({
      actorEmail: email,
      action: "admin.sign_in_rate_limited",
      summary: `Admin login rate-limited for ${email}`,
      ipAddress: ip,
      metadata: { reset: limited.reset },
    });
    return {
      ok: false,
      message: "Too many sign-in attempts. Try again in a minute.",
    };
  }

  if (isDatabaseConfigured() && !totp) {
    const admin = await getPrisma().admin.findUnique({
      where: { email },
      select: { totpEnabled: true, passwordHash: true, active: true },
    });
    if (admin?.passwordHash && admin.active && admin.totpEnabled) {
      const { verifyPassword } = await import("@/lib/auth/password");
      const valid = await verifyPassword(
        parsed.data.password,
        admin.passwordHash,
      );
      if (valid) {
        return {
          ok: false,
          message: "Enter your authenticator code",
          needsTotp: true,
        };
      }
    }
  }

  try {
    await adminSignIn("admin-credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      totp: totp ?? "",
      redirect: false,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      await logAuthorization({
        actorEmail: email,
        action: "admin.sign_in_failed",
        summary: `Failed admin sign-in for ${email}`,
        ipAddress: ip,
      });
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

  const { getAuthenticationSettings } = await import(
    "@/services/settings/platform"
  );
  const authSettings = await getAuthenticationSettings();
  if (!authSettings.registrationEnabled) {
    return {
      ok: false,
      message: "Public registration is currently disabled by an administrator.",
    };
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

  const passwordHash = await hashPassword(password);
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
    const { getAuthenticationSettings } = await import(
      "@/services/settings/platform"
    );
    const authSettings = await getAuthenticationSettings();
    if (authSettings.emailVerification) {
      const { sendEmailVerification } = await import("../services/verification");
      await sendEmailVerification({
        userId: user.id,
        email: normalizedEmail,
        name,
      });
    }
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

  try {
    await publicSignIn("credentials", {
      email: normalizedEmail,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        ok: false,
        message:
          "Account created, but automatic sign-in failed. Please sign in with your new credentials.",
      };
    }
    throw error;
  }

  return {
    ok: true,
    message: "Account created. You are signed in.",
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

  const passwordHash = await hashPassword(parsed.data.password);
  await getPrisma().publicUser.update({
    where: { email },
    data: { passwordHash },
  });
  await getPrisma().verificationToken.deleteMany({
    where: { identifier: `reset:${email}` },
  });

  return { ok: true, message: "Password updated. You can sign in." };
}

export async function requestAdminPasswordReset(
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

  const { rateLimit } = await import("@/lib/rate-limit");
  const { getRequestIpAddress } = await import("@/lib/auth/request-ip");
  const ip = (await getRequestIpAddress()) ?? "unknown";
  const email = parsed.data.email.toLowerCase();
  const limited = await rateLimit(`admin-reset:${ip}:${email}`, 5);
  if (!limited.success) {
    return {
      ok: false,
      message: "Too many reset attempts. Try again in a minute.",
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      ok: true,
      message: "If an admin account exists, reset instructions have been sent.",
    };
  }

  const admin = await getPrisma().admin.findUnique({ where: { email } });
  if (admin?.passwordHash && admin.active) {
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60);
    await getPrisma().verificationToken.deleteMany({
      where: { identifier: `admin-reset:${email}` },
    });
    await getPrisma().verificationToken.create({
      data: {
        identifier: `admin-reset:${email}`,
        token,
        expires,
      },
    });
    try {
      const base =
        process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
        process.env.AUTH_URL?.replace(/\/$/, "") ||
        "http://localhost:3000";
      const resetUrl = `${base}/dashboard/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
      const { sendEmail } = await import("@/lib/email/send");
      const result = await sendEmail({
        to: email,
        subject: "Reset your Mendanize admin password",
        text: `Hi ${admin.name ?? "there"},\n\nReset your admin password: ${resetUrl}\n\nThis link expires in 1 hour.`,
        html: `<p>Hi ${admin.name ?? "there"},</p><p><a href="${resetUrl}">Reset your admin password</a></p><p>This link expires in 1 hour.</p>`,
      });
      if (!result.ok && process.env.NODE_ENV !== "production") {
        console.info(`[auth] admin reset token for ${email}: ${token}`);
      }
    } catch {
      if (process.env.NODE_ENV !== "production") {
        console.info(`[auth] admin reset token for ${email}: ${token}`);
      }
    }
  }

  return {
    ok: true,
    message: "If an admin account exists, reset instructions have been sent.",
  };
}

export async function resetAdminPassword(
  input: unknown,
): Promise<ActionResult> {
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
      identifier: `admin-reset:${email}`,
      token: parsed.data.token,
    },
  });

  if (!record || record.expires < new Date()) {
    return { ok: false, message: "Reset link is invalid or expired" };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await getPrisma().admin.update({
    where: { email },
    data: { passwordHash },
  });
  await getPrisma().verificationToken.deleteMany({
    where: { identifier: `admin-reset:${email}` },
  });

  try {
    const { logAuthorization } = await import("../services/audit");
    await logAuthorization({
      actorEmail: email,
      action: "admin.password_reset",
      summary: `Admin password reset via email for ${email}`,
    });
  } catch {
    /* audit must not block */
  }

  return { ok: true, message: "Password updated. You can sign in." };
}

export async function beginAdminTotpEnrollAction(): Promise<
  | { ok: true; uri: string; qrUrl: string; secret: string }
  | { ok: false; message: string }
> {
  const { requireEditor } = await import("../server");
  const session = await requireEditor();
  if (!session?.admin?.id) return { ok: false, message: "Unauthorized" };
  if (!isDatabaseConfigured()) {
    return { ok: false, message: "Database required" };
  }

  const { createTotpSecret, encryptTotpSecret } = await import(
    "@/lib/auth/totp"
  );
  const created = createTotpSecret(session.admin.email);
  await getPrisma().admin.update({
    where: { id: session.admin.id },
    data: {
      totpSecret: encryptTotpSecret(created.secret),
      totpEnabled: false,
    },
  });
  return {
    ok: true,
    uri: created.uri,
    qrUrl: created.qrUrl,
    secret: created.secret,
  };
}

export async function confirmAdminTotpEnrollAction(
  token: string,
): Promise<ActionResult> {
  const { requireEditor } = await import("../server");
  const session = await requireEditor();
  if (!session?.admin?.id) return { ok: false, message: "Unauthorized" };
  if (!isDatabaseConfigured()) {
    return { ok: false, message: "Database required" };
  }

  const admin = await getPrisma().admin.findUnique({
    where: { id: session.admin.id },
  });
  if (!admin?.totpSecret) {
    return { ok: false, message: "Start enrollment first" };
  }

  const { decryptTotpSecret, verifyTotpToken } = await import("@/lib/auth/totp");
  try {
    const secret = decryptTotpSecret(admin.totpSecret);
    if (!verifyTotpToken(secret, token)) {
      return { ok: false, message: "Invalid authenticator code" };
    }
  } catch {
    return { ok: false, message: "Invalid TOTP secret" };
  }

  await getPrisma().admin.update({
    where: { id: session.admin.id },
    data: { totpEnabled: true },
  });
  return { ok: true, message: "Two-factor authentication enabled" };
}

export async function disableAdminTotpAction(
  token: string,
): Promise<ActionResult> {
  const { requireEditor } = await import("../server");
  const session = await requireEditor();
  if (!session?.admin?.id) return { ok: false, message: "Unauthorized" };
  if (!isDatabaseConfigured()) {
    return { ok: false, message: "Database required" };
  }

  const admin = await getPrisma().admin.findUnique({
    where: { id: session.admin.id },
  });
  if (!admin?.totpSecret || !admin.totpEnabled) {
    return { ok: false, message: "2FA is not enabled" };
  }

  const { decryptTotpSecret, verifyTotpToken } = await import("@/lib/auth/totp");
  try {
    const secret = decryptTotpSecret(admin.totpSecret);
    if (!verifyTotpToken(secret, token)) {
      return { ok: false, message: "Invalid authenticator code" };
    }
  } catch {
    return { ok: false, message: "Invalid TOTP secret" };
  }

  await getPrisma().admin.update({
    where: { id: session.admin.id },
    data: { totpSecret: null, totpEnabled: false },
  });
  return { ok: true, message: "Two-factor authentication disabled" };
}
