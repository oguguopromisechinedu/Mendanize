import { defineConfig, env } from "@prisma/config";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(fileName: string) {
  const envPath = resolve(process.cwd(), fileName);
  if (!existsSync(envPath)) {
    return;
  }
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const [key, ...valueParts] = trimmed.split("=");
    if (!key) {
      continue;
    }
    const rawValue = valueParts.join("=").trim();
    const value = rawValue.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

/**
 * Prisma CLI (migrate, db push, introspect) must use the direct Postgres
 * connection — not the Supabase transaction pooler.
 *
 * Set DIRECT_URL in .env / .env.local. Falls back to DATABASE_URL only when
 * DIRECT_URL is unset (not when it is an empty string).
 */
const directUrl = process.env.DIRECT_URL?.trim();
const databaseUrl = process.env.DATABASE_URL?.trim();
const resolvedDirectUrl = directUrl || databaseUrl;

if (!resolvedDirectUrl) {
  // `prisma generate` (Vercel build / postinstall) must not fail when env
  // secrets are injected later at runtime. Migrations still need a real URL.
  console.warn(
    "[prisma.config] DIRECT_URL/DATABASE_URL unset — using local placeholder for Prisma CLI generate only. Set DIRECT_URL (and DATABASE_URL) in Vercel Production/Preview.",
  );
  process.env.DIRECT_URL =
    "postgresql://postgres:postgres@localhost:5432/mendanize?schema=public";
} else {
  process.env.DIRECT_URL = resolvedDirectUrl;
  if (!directUrl && databaseUrl) {
    console.warn(
      "[prisma.config] DIRECT_URL is not set; using DATABASE_URL for migrations. Add DIRECT_URL for Supabase pooling.",
    );
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Direct connection for migrations / introspection (not the pooler).
    url: env("DIRECT_URL"),
  },
});
