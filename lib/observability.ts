/**
 * Observability helpers — health payload + request identity (MES-028).
 * Real APM/error-reporting wiring is post-launch infrastructure.
 */

import { logger } from "@/lib/logger";

const startedAt = Date.now();

export function getHealthSnapshot() {
  return {
    status: "ok" as const,
    service: "mendanize",
    uptimeSec: Math.floor((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV ?? "unknown",
  };
}

/** Best-effort client key for rate-limit buckets. */
export function clientKeyFromRequest(req: Request, prefix: string): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  return `${prefix}:${ip}`;
}

export function logUnhandledError(
  error: unknown,
  context?: Record<string, unknown>
) {
  logger.error("Unhandled error", {
    ...context,
    message: error instanceof Error ? error.message : String(error),
    name: error instanceof Error ? error.name : undefined,
    digest:
      error && typeof error === "object" && "digest" in error
        ? String((error as { digest?: string }).digest)
        : undefined,
  });
}
