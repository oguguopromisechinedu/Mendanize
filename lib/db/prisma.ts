import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

/** Client + pool created together so they are always swapped atomically. */
type PrismaBundle = {
  client: PrismaClient;
  pool: Pool;
  /** Set when this bundle has been retired by resetPrismaClient(). */
  retired: boolean;
};

const globalForPrisma = globalThis as typeof globalThis & {
  prismaBundle?: PrismaBundle;
  prismaLastResetAt?: number;
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
 * Create a PrismaClient backed by a pg Pool on DATABASE_URL.
 *
 * For Supabase: DATABASE_URL should be the transaction pooler
 * (port 6543, ?pgbouncer=true). Migrations use DIRECT_URL via prisma.config.ts.
 */
function createPrismaBundle(): PrismaBundle {
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
    // App-side pool. Dashboard aggregation fans out into many parallel queries,
    // so allow enough headroom to avoid "timeout exceeded when trying to connect"
    // while still staying well under the Supabase pooler's per-project budget.
    max: Number(process.env.DATABASE_POOL_MAX ?? 12),
    connectionTimeoutMillis: Number(
      process.env.DATABASE_CONNECT_TIMEOUT_MS ?? 20_000,
    ),
    idleTimeoutMillis: 30_000,
    keepAlive: true,
    // Supabase pooler TLS often needs this on Windows/Node pg clients.
    ...(isSupabase ? { ssl: { rejectUnauthorized: false } } : {}),
  });

  pool.on("error", (err) => {
    // Remote/idle disconnects should not crash the Node process.
    console.error("[prisma] Unexpected pool error:", err.message);
  });

  const client = new PrismaClient({
    adapter: new PrismaPg(pool),
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

  return { client, pool, retired: false };
}

/**
 * Singleton PrismaClient. State lives exclusively on globalThis so that
 * Next.js HMR and duplicate module graphs always share (and always see)
 * the current client — a module-local cache can hand out a client whose
 * pool has already been ended by resetPrismaClient().
 */
export function getPrisma(): PrismaClient {
  const bundle = globalForPrisma.prismaBundle;
  if (bundle && !bundle.retired) {
    return bundle.client;
  }

  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("Database not configured. Set DATABASE_URL.");
  }

  const fresh = createPrismaBundle();
  globalForPrisma.prismaBundle = fresh;
  return fresh.client;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

/**
 * Memory/seed fallbacks are allowed in development and preview.
 * Production writes must hit a real database.
 */
export function allowMemoryFallback(): boolean {
  if (isDatabaseConfigured()) return false;
  return process.env.NODE_ENV !== "production";
}

/** Throw when production is missing DATABASE_URL (write-critical paths). */
export function assertDatabaseForProductionWrites(surface: string): void {
  if (process.env.NODE_ENV === "production" && !isDatabaseConfigured()) {
    throw new Error(
      `${surface}: DATABASE_URL is required in production. Memory fallback is disabled.`
    );
  }
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
    message.includes("timeout exceeded when trying to connect") ||
    message.includes("connect econnreset") ||
    message.includes("connect etimedout") ||
    message.includes("timed out fetching a new connection") ||
    // A retired pool that a stale reference kept using — recoverable by
    // retrying against the fresh client from getPrisma().
    message.includes("cannot use a pool after calling end on the pool")
  );
}

/** How long retired pools stay alive so in-flight queries can finish. */
const RETIRED_POOL_GRACE_MS = 30_000;

/** Ignore repeat resets shortly after one another (concurrent failures). */
const RESET_DEBOUNCE_MS = 5_000;

function disposeBundle(bundle: PrismaBundle): Promise<void> {
  return (async () => {
    try {
      await bundle.client.$disconnect();
    } catch {
      // Client may already be closed.
    }
    try {
      await bundle.pool.end();
    } catch {
      // Pool may already be ended.
    }
  })();
}

/**
 * Retire a dead client/pool so the next getPrisma() opens a fresh connection.
 *
 * The retired pool is NOT closed immediately: other requests may still hold
 * the old client mid-query, and ending the pool under them raises
 * "Cannot use a pool after calling end on the pool". Instead the pool is
 * drained after a grace period. Pass `immediate: true` from one-shot scripts
 * that need the process to exit right away.
 */
export async function resetPrismaClient(options?: {
  immediate?: boolean;
}): Promise<void> {
  const bundle = globalForPrisma.prismaBundle;

  if (options?.immediate) {
    globalForPrisma.prismaBundle = undefined;
    if (bundle) {
      bundle.retired = true;
      await disposeBundle(bundle);
    }
    return;
  }

  // Concurrent transient failures each call reset; only the first should
  // retire the bundle, otherwise a freshly created replacement gets torn
  // down before it ever serves a query.
  const now = Date.now();
  if (now - (globalForPrisma.prismaLastResetAt ?? 0) < RESET_DEBOUNCE_MS) {
    return;
  }
  globalForPrisma.prismaLastResetAt = now;

  if (!bundle || bundle.retired) return;

  bundle.retired = true;
  globalForPrisma.prismaBundle = undefined;

  const timer = setTimeout(() => {
    void disposeBundle(bundle);
  }, RETIRED_POOL_GRACE_MS);
  // Never keep the process alive just to garbage-collect an old pool.
  timer.unref?.();
}
