import bcrypt from "bcryptjs";
import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { rateLimit } from "@/lib/rate-limit";
import {
  handleApiError,
  ValidationError,
  EmailAlreadyExistsError,
  RateLimitError,
} from "@/lib/api/errors";
import { ok, fail } from "@/lib/api/response";
import { signUpSchema } from "@/features/authentication/validators/schema";

/**
 * Public registration API — creates PublicUser only (MES-030).
 * Admin accounts cannot be self-created.
 * MES-042: sends the same verification email as the server-action register path.
 */
export async function POST(req: Request) {
  try {
    if (!isDatabaseConfigured()) {
      return fail(
        "SERVICE_UNAVAILABLE",
        "Database not configured. Please contact support.",
        503,
      );
    }

    const { getAuthenticationSettings } = await import(
      "@/services/settings/platform"
    );
    const authSettings = await getAuthenticationSettings();
    if (!authSettings.registrationEnabled) {
      return fail(
        "FORBIDDEN",
        "Public registration is currently disabled by an administrator.",
        403,
      );
    }

    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const { success, reset } = await rateLimit(`register-${ip}`, 5);
    if (!success) {
      throw new RateLimitError(
        `Too many registration attempts. Try again in ${Math.ceil((reset - Date.now()) / 1000)} seconds.`,
      );
    }

    const body = await req.json();
    const parsed = signUpSchema.safeParse({
      ...body,
      confirmPassword: body.confirmPassword ?? body.password,
    });
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid registration data",
        parsed.error.flatten().fieldErrors,
      );
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();
    const prisma = getPrisma();

    const existing = await prisma.publicUser.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      throw new EmailAlreadyExistsError(normalizedEmail);
    }

    const adminCollision = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
    });
    if (adminCollision) {
      throw new EmailAlreadyExistsError(normalizedEmail);
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
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (authSettings.emailVerification) {
      try {
        const { requireEmailConfiguredInProduction } = await import(
          "@/lib/email/mes042"
        );
        await requireEmailConfiguredInProduction("api-register-verification");
        const { sendEmailVerification } = await import(
          "@/features/authentication/services/verification"
        );
        await sendEmailVerification({
          userId: user.id,
          email: normalizedEmail,
          name,
        });
      } catch (error) {
        const { logEmailEvent } = await import("@/lib/email/mes042");
        await logEmailEvent({
          level: "ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Verification email failed after API register",
          template: "email_verification",
          email: normalizedEmail,
        });
        if (process.env.NODE_ENV === "production") {
          return fail(
            "EMAIL_DELIVERY_FAILED",
            "Account was created but verification email could not be sent. Configure email delivery or contact support.",
            503,
          );
        }
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
    } catch {
      /* welcome must not block registration */
    }

    try {
      const { readReferralCookieFromHeader } = await import(
        "@/services/referrals/cookie-read"
      );
      const { attributeSignup } = await import("@/services/referrals");
      const ref = readReferralCookieFromHeader(req.headers.get("cookie"));
      await attributeSignup({
        referredUserId: user.id,
        referralCode: ref.code,
        cookieCapturedAt: ref.capturedAt,
        ipAddress:
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          req.headers.get("x-real-ip") ||
          null,
        userAgent: req.headers.get("user-agent"),
        landingPath: "/api/auth/register",
      });
    } catch {
      /* referral attribution must not block registration */
    }

    return ok(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          domain: "public" as const,
        },
      },
      undefined,
      201,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
