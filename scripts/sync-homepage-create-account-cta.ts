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

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.log("no-database-url");
    return;
  }

  const prisma = getPrisma();
  const hp = await prisma.homepage.findUnique({
    where: { key: "main" },
    include: { cta: true },
  });

  if (!hp?.cta) {
    console.log("no-db-cta");
    return;
  }

  const updated = await prisma.homepageCTA.update({
    where: { homepageId: hp.id },
    data: {
      headline: "Ready to join Creators Hub?",
      description:
        "Learn AI, create tools and prompts, sell what you build, and get hired — all inside Creators Hub.",
      primaryCtaLabel: "Creators Hub",
      primaryCtaHref: "/sign-up",
      secondaryCtaLabel: "Explore guides",
      secondaryCtaHref: "/guides",
    },
  });

  console.log("updated-cta", {
    label: updated.primaryCtaLabel,
    href: updated.primaryCtaHref,
  });
}

main()
  .catch((error) => {
    console.error("Failed to sync homepage CTA:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await resetPrismaClient({ immediate: true });
  });
