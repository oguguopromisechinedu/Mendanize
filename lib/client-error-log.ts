/**
 * Client-safe error logging for Next.js error boundaries.
 * Must not import Prisma, pg, or other Node-only modules.
 */

export function logUnhandledError(
  error: unknown,
  context?: Record<string, unknown>,
) {
  const payload = {
    level: "error" as const,
    message: "Unhandled error",
    timestamp: new Date().toISOString(),
    context: {
      ...context,
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : undefined,
      stack: error instanceof Error ? error.stack : undefined,
      digest:
        error && typeof error === "object" && "digest" in error
          ? String((error as { digest?: string }).digest)
          : undefined,
    },
  }

  console.error(JSON.stringify(payload))
}
