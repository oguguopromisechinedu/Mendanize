/**
 * Shared API response contract (MES-002).
 * All app/api/public/* and app/api/dashboard/* routes MUST use this shape.
 */

export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiMeta = Record<string, unknown>;

export type ApiResponse<T> = {
  data: T | null;
  error: ApiError | null;
  meta?: ApiMeta;
};
