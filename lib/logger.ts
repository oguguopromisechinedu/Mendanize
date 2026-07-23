/**
 * Structured logging seam (MES-028 / MES-032).
 * Wraps console today; optionally persists errors to ApplicationLog.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogContext = Record<string, unknown>;

function emit(level: LogLevel, message: string, context?: LogContext) {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context ? { context } : {}),
  };

  const line = JSON.stringify(payload);
  switch (level) {
    case "debug":
      if (process.env.NODE_ENV === "development") console.debug(line);
      break;
    case "info":
      console.info(line);
      break;
    case "warn":
      console.warn(line);
      break;
    case "error":
      console.error(line);
      break;
  }

  // Persist only on the server — never pull Prisma/pg into client bundles.
  if (
    (level === "error" || level === "warn") &&
    typeof window === "undefined"
  ) {
    void import("@/services/admin/application-logs")
      .then(({ persistApplicationLog }) =>
        persistApplicationLog({
          level,
          message,
          module:
            typeof context?.module === "string" ? context.module : undefined,
          requestId:
            typeof context?.requestId === "string"
              ? context.requestId
              : undefined,
          stack:
            typeof context?.stack === "string" ? context.stack : undefined,
          context,
        }),
      )
      .catch(() => undefined);
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) =>
    emit("debug", message, context),
  info: (message: string, context?: LogContext) =>
    emit("info", message, context),
  warn: (message: string, context?: LogContext) =>
    emit("warn", message, context),
  error: (message: string, context?: LogContext) =>
    emit("error", message, context),
};
