/**
 * Graceful degradation when Prisma models exist in schema but tables
 * are not migrated yet (P2021).
 */

export function isMissingSchemaError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string };
  if (err.code === "P2021") return true;
  const message = err.message?.toLowerCase() ?? "";
  return (
    message.includes("does not exist in the current database") ||
    (message.includes("relation") && message.includes("does not exist"))
  );
}

export async function safeDbQuery<T>(
  surface: string,
  fallback: T,
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (isMissingSchemaError(error)) {
      console.warn(`[db] ${surface}: schema not migrated — using fallback`, error);
      return fallback;
    }
    throw error;
  }
}

export const FOUNDER_DASHBOARD_MIGRATION_HINT =
  "Apply pending Prisma migration 20260726220000_mes039_mes037_growth_valuation (run: npx prisma migrate deploy).";
