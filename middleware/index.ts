/**
 * Middleware helpers — MES-006 / MES-028.
 * Keep session handling via Auth.js (`auth.ts`); do not reinvent auth here.
 * Root `middleware.ts` may compose these helpers when edge policies expand.
 */

export function requestIdFromHeaders(headers: Headers): string {
  return (
    headers.get("x-request-id") ||
    headers.get("x-vercel-id") ||
    crypto.randomUUID()
  );
}

export function withRequestIdHeaders(
  headers: Headers,
  requestId = requestIdFromHeaders(headers)
): Headers {
  const next = new Headers(headers);
  next.set("x-request-id", requestId);
  return next;
}
