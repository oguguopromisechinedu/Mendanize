import bcrypt from "bcryptjs";
import { z } from "zod";
import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { rateLimit } from "@/lib/rate-limit";
import {
  handleApiError,
  ValidationError,
  EmailAlreadyExistsError,
} from "@/lib/api/errors";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export async function POST(req: Request) {
  try {
    // Check if database is configured
    if (!isDatabaseConfigured()) {
      return Response.json(
        {
          error: {
            code: "SERVICE_UNAVAILABLE",
            message: "Database not configured. Please contact support.",
          },
        },
        { status: 503 }
      );
    }

    // Get client IP for rate limiting
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Rate limit: 5 attempts per minute per IP
    const { success, reset } = await rateLimit(`register-${ip}`, 5);
    if (!success) {
      return Response.json(
        {
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: `Too many registration attempts. Try again in ${Math.ceil((reset - Date.now()) / 1000)} seconds.`,
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.flatten().fieldErrors;
      throw new ValidationError("Invalid registration data", details);
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    // Check if email already exists
    const existing = await getPrisma().user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      throw new EmailAlreadyExistsError(normalizedEmail);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with profile, subscription, and settings
    const user = await getPrisma().user.create({
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

    return Response.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
