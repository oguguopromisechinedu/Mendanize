import bcrypt from "bcryptjs";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getPrisma, resetPrismaClient } from "../lib/db/prisma";

function loadEnvFile(fileName: string) {
  const envPath = resolve(process.cwd(), fileName);
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf-8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq);
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const ADMIN_EMAIL = "admin@mendanize.com";
const ADMIN_PASSWORD = "MendanizeAdmin123!";

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const prisma = getPrisma();
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  let role = await prisma.adminRole.findUnique({
    where: { key: "SUPER_ADMINISTRATOR" },
  });
  if (!role) {
    role = await prisma.adminRole.create({
      data: {
        key: "SUPER_ADMINISTRATOR",
        name: "Super Administrator",
        description: "Full platform access",
      },
    });
  }

  const existing = await prisma.admin.findUnique({
    where: { email: ADMIN_EMAIL },
    select: { id: true },
  });

  const admin = existing
    ? await prisma.admin.update({
        where: { email: ADMIN_EMAIL },
        data: {
          roleId: role.id,
          passwordHash,
          emailVerified: new Date(),
          name: "Mendanize Admin",
          active: true,
        },
        select: {
          id: true,
          email: true,
          active: true,
          role: { select: { key: true } },
        },
      })
    : await prisma.admin.create({
        data: {
          name: "Mendanize Admin",
          email: ADMIN_EMAIL,
          roleId: role.id,
          passwordHash,
          emailVerified: new Date(),
          active: true,
        },
        select: {
          id: true,
          email: true,
          active: true,
          role: { select: { key: true } },
        },
      });

  console.log("Dev admin ready:", {
    id: admin.id,
    email: admin.email,
    role: admin.role.key,
    active: admin.active,
  });
}

main()
  .catch((error) => {
    console.error("Failed to create dev admin:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await resetPrismaClient({ immediate: true });
  });
