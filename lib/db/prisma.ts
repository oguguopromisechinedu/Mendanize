import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  var prisma: PrismaClient | undefined;
  var prismaPool: Pool | undefined;
}

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
  prismaPool?: Pool;
};

/** Ensure pooler-friendly query params without rewriting credentials. */
function normalizeDatabaseUrl(raw: string): string {
  try {
    const url = new URL(raw);
    // Silence pg v8 → v9 sslmode deprecation when using sslmode=require.
    if (
      url.searchParams.get("sslmode") === "require" &&
      !url.searchParams.has("uselibpqcompat")
    ) {
      url.searchParams.set("uselibpqcompat", "true");
    }
    // Supabase transaction pooler (6543) should advertise pgbouncer mode.
    if (url.port === "6543" && !url.searchParams.has("pgbouncer")) {
      url.searchParams.set("pgbouncer", "true");
    }
    return url.toString();
  } catch {
    return raw;
  }
}

/**
 * Create a single PrismaClient backed by a pg Pool on DATABASE_URL.
 *
 * For Supabase: DATABASE_URL should be the transaction pooler
 * (port 6543, ?pgbouncer=true). Migrations use DIRECT_URL via prisma.config.ts.
 */
function createPrismaClient() {
  const connectionString = normalizeDatabaseUrl(
    process.env.DATABASE_URL?.trim() ?? "",
  );

  if (!connectionString) {
    throw new Error("Database not configured. Set DATABASE_URL.");
  }

  const isSupabase =
    /supabase\.(co|com)/i.test(connectionString) ||
    /pooler\.supabase\.com/i.test(connectionString);

  const pool = new Pool({
    connectionString,
    // Keep the app-side pool small; Supabase pooler owns the real multiplexing.
    max: 5,
    connectionTimeoutMillis: 20_000,
    idleTimeoutMillis: 60_000,
    keepAlive: true,
    // Supabase pooler TLS often needs this on Windows/Node pg clients.
    ...(isSupabase ? { ssl: { rejectUnauthorized: false } } : {}),
  });

  pool.on("error", (err) => {
    // Remote/idle disconnects should not crash the Node process.
    console.error("[prisma] Unexpected pool error:", err.message);
  });

  // Always retain the pool so resetPrismaClient() can dispose it.
  globalForPrisma.prismaPool = pool;

  return new PrismaClient({
    adapter: new PrismaPg(pool),
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

let prisma: PrismaClient | undefined = globalForPrisma.prisma;

/**
 * Singleton PrismaClient. Reuses one instance across hot reloads (dev)
 * and within the process (production / serverless).
 */
export function getPrisma() {
  if (!prisma) {
    if (!process.env.DATABASE_URL?.trim()) {
      throw new Error("Database not configured. Set DATABASE_URL.");
    }

    prisma = createPrismaClient();
    // Cache on globalThis so Next.js HMR (and duplicate module graphs) share one client.
    globalForPrisma.prisma = prisma;
  }

  return prisma;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

/** True when DIRECT_URL is set for Prisma CLI migrations. */
export function isDirectUrlConfigured(): boolean {
  return Boolean(process.env.DIRECT_URL?.trim());
}

export function isTransientConnectionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const err = error as {
    code?: string;
    message?: string;
  };

  if (err.code === "P1017" || err.code === "P1001" || err.code === "P1008") {
    return true;
  }

  const message = err.message?.toLowerCase() ?? "";
  return (
    message.includes("server has closed the connection") ||
    message.includes("connection terminated") ||
    message.includes("can't reach database server") ||
    message.includes("connection timeout") ||
    message.includes("connect econnreset") ||
    message.includes("connect etimedout") ||
    message.includes("timed out fetching a new connection")
  );
}

/** Drop a dead client/pool so the next getPrisma() opens a fresh connection. */
export async function resetPrismaClient(): Promise<void> {
  const client = prisma;
  const pool = globalForPrisma.prismaPool;

  prisma = undefined;
  globalForPrisma.prisma = undefined;
  globalForPrisma.prismaPool = undefined;

  try {
    await client?.$disconnect();
  } catch {
    // Client may already be closed.
  }

  try {
    await pool?.end();
  } catch {
    // Pool may already be ended.
  }
}
