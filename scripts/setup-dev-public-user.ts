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

const USER_EMAIL = "learner@mendanize.com";
const USER_PASSWORD = "MendanizeLearner123!";
const USER_NAME = "Promise";

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const prisma = getPrisma();
  const passwordHash = await bcrypt.hash(USER_PASSWORD, 12);

  const existing = await prisma.publicUser.findUnique({
    where: { email: USER_EMAIL },
  });

  const user = existing
    ? await prisma.publicUser.update({
        where: { email: USER_EMAIL },
        data: {
          name: USER_NAME,
          passwordHash,
          emailVerified: new Date(),
        },
      })
    : await prisma.publicUser.create({
        data: {
          name: USER_NAME,
          email: USER_EMAIL,
          passwordHash,
          emailVerified: new Date(),
          profile: { create: {} },
          subscription: { create: { plan: "FREE" } },
          settings: { create: {} },
        },
      });

  console.log("Dev PublicUser ready:", {
    id: user.id,
    email: USER_EMAIL,
    name: user.name,
    emailVerified: Boolean(user.emailVerified),
  });
  console.log(`Sign in at /sign-in with ${USER_EMAIL}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    resetPrismaClient();
  });
