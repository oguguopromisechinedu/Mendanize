/**
 * Rename UserPreference.userId -> publicUserId and attach FK (MES-030 gap fix).
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

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
  const url =
    process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("DATABASE_URL / DIRECT_URL required");
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const cols = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='UserPreference'`,
    );
    console.log(
      "UserPreference columns:",
      cols.rows.map((r) => r.column_name),
    );

    const hasUserId = cols.rows.some((r) => r.column_name === "userId");
    const hasPublic = cols.rows.some((r) => r.column_name === "publicUserId");

    await client.query("BEGIN");
    if (hasUserId && !hasPublic) {
      await client.query(
        `ALTER TABLE "UserPreference" DROP CONSTRAINT IF EXISTS "UserPreference_userId_fkey"`,
      );
      await client.query(
        `ALTER TABLE "UserPreference" RENAME COLUMN "userId" TO "publicUserId"`,
      );
      console.log("renamed UserPreference.userId -> publicUserId");
    }

    // purge orphans then add FK
    await client.query(`
      DELETE FROM "UserPreference" t
      WHERE t."publicUserId" IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM "PublicUser" pu WHERE pu.id = t."publicUserId")
    `);
    await client.query(
      `ALTER TABLE "UserPreference" DROP CONSTRAINT IF EXISTS "UserPreference_publicUserId_fkey"`,
    );
    await client.query(`
      ALTER TABLE "UserPreference"
      ADD CONSTRAINT "UserPreference_publicUserId_fkey"
      FOREIGN KEY ("publicUserId") REFERENCES "PublicUser"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
    console.log("UserPreference_publicUserId_fkey attached");
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
