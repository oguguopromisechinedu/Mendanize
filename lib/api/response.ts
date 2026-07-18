/**
 * MES-002 API response helpers.
 * All app/api/public/* and app/api/dashboard/* routes MUST use these.
 */
import { NextResponse } from "next/server";
import type { ApiMeta, ApiResponse } from "@/types/api";

export function ok<T>(data: T, meta?: ApiMeta, status = 200) {
  const body: ApiResponse<T> = {
    data,
    error: null,
    ...(meta ? { meta } : {}),
  };
  return NextResponse.json(body, { status });
}

export function fail(
  code: string,
  message: string,
  status: number,
  details?: unknown,
  meta?: ApiMeta
) {
  const body: ApiResponse<null> = {
    data: null,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
    ...(meta ? { meta } : {}),
  };
  return NextResponse.json(body, { status });
}

/** Scaffold endpoints until the owning MES implements them. */
export function notImplemented(surface: string) {
  return fail(
    "NOT_IMPLEMENTED",
    `${surface} — architecture placeholder`,
    501,
    undefined,
    { placeholder: true }
  );
}

/** MES-002 unauthorized envelope for dashboard routes. */
export function unauthorized(message = "Authentication required") {
  return fail("UNAUTHORIZED", message, 401);
}

/** MES-002 forbidden envelope. */
export function forbidden(message = "Insufficient permissions") {
  return fail("FORBIDDEN", message, 403);
}
