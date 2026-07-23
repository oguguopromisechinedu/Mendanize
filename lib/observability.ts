/**
 * Observability helpers — health payload + request identity (MES-028 / MES-032).
 * Server-oriented. Client error boundaries must use `@/lib/client-error-log`.
 */

import "server-only"

import { logger } from "@/lib/logger"

const startedAt = Date.now()

export async function getHealthSnapshot() {
  const { getPrisma, isDatabaseConfigured } = await import("@/lib/db/prisma")

  let database: "ok" | "error" | "skipped" = "skipped"
  if (isDatabaseConfigured()) {
    try {
      await getPrisma().$queryRaw`SELECT 1`
      database = "ok"
    } catch {
      database = "error"
    }
  }

  let jobQueueDepth = 0
  if (isDatabaseConfigured()) {
    try {
      jobQueueDepth = await getPrisma().aIGenerationJob.count({
        where: { status: { in: ["QUEUED", "PROCESSING"] } },
      })
    } catch {
      jobQueueDepth = 0
    }
  }

  const aiProviders = {
    openai: Boolean(process.env.OPENAI_API_KEY),
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    google: Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY),
  }

  return {
    status: database === "error" ? ("degraded" as const) : ("ok" as const),
    service: "mendanize",
    uptimeSec: Math.floor((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV ?? "unknown",
    database,
    aiProviders,
    jobQueueDepth,
  }
}

/** Best-effort client key for rate-limit buckets. */
export function clientKeyFromRequest(req: Request, prefix: string): string {
  const forwarded = req.headers.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() || "unknown"
  return `${prefix}:${ip}`
}

/** Server-side unhandled error logging (persists via logger when possible). */
export function logUnhandledError(
  error: unknown,
  context?: Record<string, unknown>,
) {
  logger.error("Unhandled error", {
    ...context,
    message: error instanceof Error ? error.message : String(error),
    name: error instanceof Error ? error.name : undefined,
    stack: error instanceof Error ? error.stack : undefined,
    digest:
      error && typeof error === "object" && "digest" in error
        ? String((error as { digest?: string }).digest)
        : undefined,
  })
}
