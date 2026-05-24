import bcrypt from "bcryptjs";
import { z } from "zod";
import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  if (!isDatabaseConfigured()) {
    return Response.json(
      { error: "Database not configured. Set DATABASE_URL." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existing = await getPrisma().user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return Response.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await getPrisma().user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        profile: { create: {} },
        subscription: { create: { plan: "FREE" } },
        settings: { create: {} },
      },
    });

    return Response.json({ id: user.id, email: user.email }, { status: 201 });
  } catch {
    return Response.json({ error: "Registration failed" }, { status: 500 });
  }
}
