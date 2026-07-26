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
