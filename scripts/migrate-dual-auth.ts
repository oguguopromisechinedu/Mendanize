/**
 * MES-030 dual-auth data migration (idempotent).
 *
 * Prerequisites:
 * 1. Review prisma/migrations/20260719220000_mes030_dual_auth/migration.sql
 * 2. Apply it (or `prisma migrate deploy`) so PublicUser/Admin/RBAC tables exist
 * 3. Legacy "User" table must still exist with role column
 *
 * This script:
 * - Copies LEARNER/USER rows -> PublicUser (same id)
 * - Copies EDITOR/ADMIN/SUPER_ADMIN rows -> Admin (same id) with role mapping
 * - Renames/repoints FK columns from userId -> publicUserId (learner tables)
 *   and author/admin authorship columns to Admin
 * - Does NOT drop User (manual verification step)
 *
 * Usage: npx tsx scripts/migrate-dual-auth.ts
 * Do NOT run until you have a DB backup.
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

const ROLE_MAP: Record<string, string> = {
  SUPER_ADMIN: "role_super_admin",
  ADMIN: "role_admin",
  EDITOR: "role_editor",
};

/** Tables that owned learner data via userId -> publicUserId */
const LEARNER_TABLES: Array<{
  table: string;
  oldCol: string;
  newCol: string;
  uniqueRename?: Array<{ old: string; next: string }>;
}> = [
  { table: "Profile", oldCol: "userId", newCol: "publicUserId" },
  { table: "Subscription", oldCol: "userId", newCol: "publicUserId" },
  { table: "UsageRecord", oldCol: "userId", newCol: "publicUserId" },
  { table: "WorkspaceMember", oldCol: "userId", newCol: "publicUserId" },
  { table: "Project", oldCol: "userId", newCol: "publicUserId" },
  { table: "Chat", oldCol: "userId", newCol: "publicUserId" },
  { table: "Generation", oldCol: "userId", newCol: "publicUserId" },
  { table: "SavedOutput", oldCol: "userId", newCol: "publicUserId" },
  { table: "PromptPreset", oldCol: "userId", newCol: "publicUserId" },
  { table: "NotificationPreference", oldCol: "userId", newCol: "publicUserId" },
  { table: "UserSettings", oldCol: "userId", newCol: "publicUserId" },
  { table: "UserInterest", oldCol: "userId", newCol: "publicUserId" },
  { table: "SavedContent", oldCol: "userId", newCol: "publicUserId" },
  { table: "LearningHistory", oldCol: "userId", newCol: "publicUserId" },
  { table: "LearningGoal", oldCol: "userId", newCol: "publicUserId" },
  { table: "LearningProgress", oldCol: "userId", newCol: "publicUserId" },
  { table: "GuideProgress", oldCol: "userId", newCol: "publicUserId" },
  { table: "Conversation", oldCol: "userId", newCol: "publicUserId" },
  { table: "CommunicationLog", oldCol: "userId", newCol: "publicUserId" },
  { table: "UserPreference", oldCol: "userId", newCol: "publicUserId" },
];

const AUTHOR_TABLES: Array<{ table: string; col: string }> = [
  { table: "Article", col: "authorId" },
  { table: "Guide", col: "authorId" },
  { table: "Post", col: "authorId" },
  { table: "ArticleRevision", col: "createdById" },
  { table: "GuideRevision", col: "createdById" },
];

async function tableExists(client: pg.Client, name: string) {
  const r = await client.query(
    `SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1`,
    [name],
  );
  return (r.rowCount ?? 0) > 0;
}

async function columnExists(client: pg.Client, table: string, column: string) {
  const r = await client.query(
    `SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 AND column_name=$2`,
    [table, column],
  );
  return (r.rowCount ?? 0) > 0;
}

async function renameColumnIfNeeded(
  client: pg.Client,
  table: string,
  oldCol: string,
  newCol: string,
) {
  if (!(await tableExists(client, table))) {
    console.log(`  skip ${table} (missing)`);
    return;
  }
  if (await columnExists(client, table, newCol)) {
    console.log(`  ok ${table}.${newCol} already present`);
    return;
  }
  if (!(await columnExists(client, table, oldCol))) {
    console.log(`  skip ${table}.${oldCol} (missing)`);
    return;
  }
  await client.query(
    `ALTER TABLE "${table}" RENAME COLUMN "${oldCol}" TO "${newCol}"`,
  );
  console.log(`  renamed ${table}.${oldCol} -> ${newCol}`);
}

async function main() {
  const url =
    process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("DATABASE_URL / DIRECT_URL required");

  const client = new pg.Client({ connectionString: url });
  await client.connect();

  try {
    if (!(await tableExists(client, "User"))) {
      console.log(
        "Legacy User table not found — assuming dual-auth data already migrated.",
      );
      return;
    }
    if (!(await tableExists(client, "PublicUser"))) {
      throw new Error(
        "PublicUser missing. Apply prisma/migrations/20260719220000_mes030_dual_auth first.",
      );
    }

    await client.query("BEGIN");

    // --- Split users ---
    const learners = await client.query(
      `SELECT id, name, email, "emailVerified", image, "passwordHash", "createdAt", "updatedAt"
       FROM "User" WHERE role IN ('LEARNER','USER')`,
    );
    for (const row of learners.rows) {
      await client.query(
        `INSERT INTO "PublicUser" (id, name, email, "emailVerified", image, "passwordHash", "createdAt", "updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (id) DO UPDATE SET
           name=EXCLUDED.name, email=EXCLUDED.email,
           "emailVerified"=EXCLUDED."emailVerified", image=EXCLUDED.image,
           "passwordHash"=EXCLUDED."passwordHash", "updatedAt"=EXCLUDED."updatedAt"`,
        [
          row.id,
          row.name,
          row.email,
          row.emailVerified,
          row.image,
          row.passwordHash,
          row.createdAt,
          row.updatedAt,
        ],
      );
    }
    console.log(`PublicUser upserted: ${learners.rowCount}`);

    const staff = await client.query(
      `SELECT id, name, email, "emailVerified", image, "passwordHash", role, "createdAt", "updatedAt"
       FROM "User" WHERE role IN ('EDITOR','ADMIN','SUPER_ADMIN')`,
    );
    for (const row of staff.rows) {
      const roleId = ROLE_MAP[row.role as string] ?? "role_admin";
      await client.query(
        `INSERT INTO "Admin" (id, name, email, "emailVerified", image, "passwordHash", active, "roleId", "createdAt", "updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,true,$7,$8,$9)
         ON CONFLICT (id) DO UPDATE SET
           name=EXCLUDED.name, email=EXCLUDED.email,
           "emailVerified"=EXCLUDED."emailVerified", image=EXCLUDED.image,
           "passwordHash"=EXCLUDED."passwordHash", "roleId"=EXCLUDED."roleId",
           "updatedAt"=EXCLUDED."updatedAt"`,
        [
          row.id,
          row.name,
          row.email,
          row.emailVerified,
          row.image,
          row.passwordHash,
          roleId,
          row.createdAt,
          row.updatedAt,
        ],
      );
    }
    console.log(`Admin upserted: ${staff.rowCount}`);

    // --- Account.userId -> publicUserId ---
    await renameColumnIfNeeded(client, "Account", "userId", "publicUserId");

    // --- Session split ---
    if (await tableExists(client, "Session")) {
      if (await columnExists(client, "Session", "userId")) {
        await client.query(
          `INSERT INTO "PublicSession" (id, "sessionToken", "publicUserId", expires)
           SELECT s.id, s."sessionToken", s."userId", s.expires
           FROM "Session" s
           INNER JOIN "PublicUser" pu ON pu.id = s."userId"
           ON CONFLICT (id) DO NOTHING`,
        );
        await client.query(
          `INSERT INTO "AdminSession" (id, "sessionToken", "adminId", expires)
           SELECT s.id, s."sessionToken", s."userId", s.expires
           FROM "Session" s
           INNER JOIN "Admin" a ON a.id = s."userId"
           ON CONFLICT (id) DO NOTHING`,
        );
        console.log("Sessions copied into PublicSession / AdminSession");
      }
    }

    // --- Learner FK renames ---
    for (const t of LEARNER_TABLES) {
      await renameColumnIfNeeded(client, t.table, t.oldCol, t.newCol);
    }

    // Notification: split optional publicUserId + adminId
    if (await tableExists(client, "Notification")) {
      if (
        (await columnExists(client, "Notification", "userId")) &&
        !(await columnExists(client, "Notification", "publicUserId"))
      ) {
        await client.query(
          `ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "publicUserId" TEXT`,
        );
        await client.query(
          `ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "adminId" TEXT`,
        );
        await client.query(
          `UPDATE "Notification" n SET "publicUserId" = n."userId"
           FROM "PublicUser" pu WHERE pu.id = n."userId"`,
        );
        await client.query(
          `UPDATE "Notification" n SET "adminId" = n."userId"
           FROM "Admin" a WHERE a.id = n."userId"`,
        );
        await client.query(
          `ALTER TABLE "Notification" DROP COLUMN IF EXISTS "userId"`,
        );
        console.log("Notification.userId split into publicUserId/adminId");
      }
    }

    // AIGeneration.userId -> adminId
    if (await tableExists(client, "AIGeneration")) {
      if (
        (await columnExists(client, "AIGeneration", "userId")) &&
        !(await columnExists(client, "AIGeneration", "adminId"))
      ) {
        await client.query(
          `ALTER TABLE "AIGeneration" RENAME COLUMN "userId" TO "adminId"`,
        );
        console.log("AIGeneration.userId -> adminId");
      }
    }

    // Author FKs already named authorId/createdById — ensure they only reference Admin ids
    for (const t of AUTHOR_TABLES) {
      if (!(await tableExists(client, t.table))) continue;
      if (!(await columnExists(client, t.table, t.col))) continue;
      const orphans = await client.query(
        `SELECT COUNT(*)::int AS c FROM "${t.table}" t
         LEFT JOIN "Admin" a ON a.id = t."${t.col}"
         WHERE t."${t.col}" IS NOT NULL AND a.id IS NULL`,
      );
      const count = orphans.rows[0]?.c ?? 0;
      if (count > 0) {
        console.warn(
          `  WARN ${t.table}.${t.col}: ${count} rows reference non-Admin ids — set NULL or fix manually`,
        );
        if (t.col === "createdById") {
          await client.query(
            `UPDATE "${t.table}" t SET "${t.col}" = NULL
             WHERE "${t.col}" IS NOT NULL AND NOT EXISTS (
               SELECT 1 FROM "Admin" a WHERE a.id = t."${t.col}"
             )`,
          );
        }
      } else {
        console.log(`  ok ${t.table}.${t.col} references Admin`);
      }
    }

    await client.query("COMMIT");
    console.log("\nMES-030 backfill complete.");
    console.log(
      "Next: verify data, then drop legacy User/Session tables and add FK constraints to PublicUser/Admin.",
    );
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
