/**
 * Push SEEDED_HOMEPAGE_CONTENT into the dashboard Homepage CMS as DRAFT.
 *
 * Requires DATABASE_URL. Does not publish — open /dashboard/homepage and click Publish.
 *
 * Usage: npx tsx scripts/seed-homepage-cms.ts
 *    or: npm run db:seed:homepage
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { resetPrismaClient } from "../lib/db/prisma";
import { syncHomepageFromSeed } from "../services/content/homepage";

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
    throw new Error("DATABASE_URL is not configured.");
  }

  const record = await syncHomepageFromSeed();

  console.log("Homepage CMS synced from seed (DRAFT):", {
    id: record.id,
    key: record.key,
    status: record.status,
    sections: record.sections.length,
    activeSections: record.activeSectionCount,
    statistics: record.statistics.length,
    faqs: record.faqs.length,
    featured: record.featured.length,
    testimonials: record.testimonials.length,
  });
  console.log(
    "Open /dashboard/homepage and click Publish to make this the live public homepage.",
  );
}

main()
  .catch((error) => {
    console.error("Failed to sync homepage seed into CMS:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await resetPrismaClient({ immediate: true });
  });
