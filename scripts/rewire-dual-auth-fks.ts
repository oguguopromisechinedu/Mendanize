/**
 * MES-030 follow-up: drop legacy FKs that still target "User" after column renames,
 * then attach FKs to PublicUser / Admin. Safe to re-run.
 *
 * Usage: npx tsx scripts/rewire-dual-auth-fks.ts
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

type FkSpec = {
  table: string;
  column: string;
  refTable: "PublicUser" | "Admin";
  onDelete: "CASCADE" | "SET NULL" | "RESTRICT";
  nullable?: boolean;
};

const PUBLIC_FKS: FkSpec[] = [
  { table: "Account", column: "publicUserId", refTable: "PublicUser", onDelete: "CASCADE" },
  { table: "Profile", column: "publicUserId", refTable: "PublicUser", onDelete: "CASCADE" },
  { table: "Subscription", column: "publicUserId", refTable: "PublicUser", onDelete: "CASCADE" },
  { table: "UsageRecord", column: "publicUserId", refTable: "PublicUser", onDelete: "CASCADE" },
  { table: "WorkspaceMember", column: "publicUserId", refTable: "PublicUser", onDelete: "CASCADE" },
  { table: "Project", column: "publicUserId", refTable: "PublicUser", onDelete: "CASCADE" },
  { table: "Chat", column: "publicUserId", refTable: "PublicUser", onDelete: "CASCADE" },
  { table: "Generation", column: "publicUserId", refTable: "PublicUser", onDelete: "CASCADE" },
  { table: "SavedOutput", column: "publicUserId", refTable: "PublicUser", onDelete: "CASCADE" },
  { table: "PromptPreset", column: "publicUserId", refTable: "PublicUser", onDelete: "CASCADE" },
  {
    table: "NotificationPreference",
    column: "publicUserId",
    refTable: "PublicUser",
    onDelete: "CASCADE",
  },
  { table: "UserSettings", column: "publicUserId", refTable: "PublicUser", onDelete: "CASCADE" },
  { table: "UserInterest", column: "publicUserId", refTable: "PublicUser", onDelete: "CASCADE" },
  { table: "SavedContent", column: "publicUserId", refTable: "PublicUser", onDelete: "CASCADE" },
  { table: "LearningHistory", column: "publicUserId", refTable: "PublicUser", onDelete: "CASCADE" },
  { table: "LearningGoal", column: "publicUserId", refTable: "PublicUser", onDelete: "CASCADE" },
  { table: "LearningProgress", column: "publicUserId", refTable: "PublicUser", onDelete: "CASCADE" },
  { table: "GuideProgress", column: "publicUserId", refTable: "PublicUser", onDelete: "CASCADE" },
  { table: "Conversation", column: "publicUserId", refTable: "PublicUser", onDelete: "CASCADE" },
  { table: "UserPreference", column: "publicUserId", refTable: "PublicUser", onDelete: "CASCADE" },
  {
    table: "CommunicationLog",
    column: "publicUserId",
    refTable: "PublicUser",
    onDelete: "SET NULL",
    nullable: true,
  },
  {
    table: "Notification",
    column: "publicUserId",
    refTable: "PublicUser",
    onDelete: "CASCADE",
    nullable: true,
  },
];

const ADMIN_FKS: FkSpec[] = [
  { table: "Article", column: "authorId", refTable: "Admin", onDelete: "CASCADE" },
  { table: "Guide", column: "authorId", refTable: "Admin", onDelete: "CASCADE" },
  { table: "Post", column: "authorId", refTable: "Admin", onDelete: "CASCADE" },
  {
    table: "ArticleRevision",
    column: "createdById",
    refTable: "Admin",
    onDelete: "SET NULL",
    nullable: true,
  },
  {
    table: "GuideRevision",
    column: "createdById",
    refTable: "Admin",
    onDelete: "SET NULL",
    nullable: true,
  },
  { table: "AIGeneration", column: "adminId", refTable: "Admin", onDelete: "CASCADE" },
  {
    table: "Notification",
    column: "adminId",
    refTable: "Admin",
    onDelete: "CASCADE",
    nullable: true,
  },
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

async function dropFksPointingAtUser(client: pg.Client) {
  const r = await client.query(`
    SELECT DISTINCT tc.table_name, tc.constraint_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
     AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND ccu.table_name = 'User'
  `);
  for (const row of r.rows) {
    await client.query(
      `ALTER TABLE "${row.table_name}" DROP CONSTRAINT IF EXISTS "${row.constraint_name}"`,
    );
    console.log(`dropped ${row.table_name}.${row.constraint_name}`);
  }
  if ((r.rowCount ?? 0) === 0) {
    console.log("no FKs still pointing at User");
  }
}

/** Remove learner-table rows that still point at Admin ids after the split. */
async function purgeOrphanPublicRefs(client: pg.Client) {
  const tables = [
    "Profile",
    "Subscription",
    "UsageRecord",
    "WorkspaceMember",
    "Project",
    "Chat",
    "Generation",
    "SavedOutput",
    "PromptPreset",
    "NotificationPreference",
    "UserSettings",
    "UserInterest",
    "SavedContent",
    "LearningHistory",
    "LearningGoal",
    "LearningProgress",
    "GuideProgress",
    "Conversation",
    "CommunicationLog",
    "Account",
    "UserPreference",
    "Notification",
  ];

  for (const table of tables) {
    if (!(await tableExists(client, table))) continue;
    if (!(await columnExists(client, table, "publicUserId"))) continue;
    const result = await client.query(`
      DELETE FROM "${table}" t
      WHERE t."publicUserId" IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM "PublicUser" pu WHERE pu.id = t."publicUserId"
        )
    `);
    console.log(
      `purged ${result.rowCount ?? 0} orphan row(s) from ${table}`,
    );
  }
}

async function ensureFk(client: pg.Client, spec: FkSpec) {
  if (!(await tableExists(client, spec.table))) {
    console.log(`skip missing table ${spec.table}`);
    return;
  }
  if (!(await columnExists(client, spec.table, spec.column))) {
    console.log(`skip missing column ${spec.table}.${spec.column}`);
    return;
  }

  const name = `${spec.table}_${spec.column}_fkey`;
  await client.query(
    `ALTER TABLE "${spec.table}" DROP CONSTRAINT IF EXISTS "${name}"`,
  );
  // Also drop common legacy names
  await client.query(
    `ALTER TABLE "${spec.table}" DROP CONSTRAINT IF EXISTS "${spec.table}_userId_fkey"`,
  );

  await client.query(`
    ALTER TABLE "${spec.table}"
    ADD CONSTRAINT "${name}"
    FOREIGN KEY ("${spec.column}") REFERENCES "${spec.refTable}"("id")
    ON DELETE ${spec.onDelete} ON UPDATE CASCADE
  `);
  console.log(`added ${name} -> ${spec.refTable}`);
}

async function main() {
  const url =
    process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("DATABASE_URL / DIRECT_URL required");

  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query("BEGIN");
    await dropFksPointingAtUser(client);
    await purgeOrphanPublicRefs(client);
    for (const spec of [...PUBLIC_FKS, ...ADMIN_FKS]) {
      await ensureFk(client, spec);
    }
    await client.query("COMMIT");
    console.log("\nFK rewire complete.");
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
