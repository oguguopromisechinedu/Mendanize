/**
 * Shared Zod validation helpers (MES-002).
 * Routes validate input before touching a Shared Service.
 */

import type { ZodType } from "zod";
import { ValidationError } from "@/lib/api/errors";

export async function parseBody<T>(
  req: Request,
  schema: ZodType<T>
): Promise<T> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw new ValidationError("Request body must be valid JSON");
  }

  const result = schema.safeParse(json);
  if (!result.success) {
    throw new ValidationError("Validation failed", result.error.flatten());
  }
  return result.data;
}

export function parseSearchParams<T>(
  url: URL | string,
  schema: ZodType<T>
): T {
  const search =
    typeof url === "string" ? new URL(url).searchParams : url.searchParams;
  const raw = Object.fromEntries(search.entries());
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new ValidationError("Validation failed", result.error.flatten());
  }
  return result.data;
}

export { z } from "zod";
export { publicSearchQuerySchema } from "./search";
export { dashboardArticlesQuerySchema } from "./articles";
export {
  publicContentListQuerySchema,
  dashboardListQuerySchema,
} from "./content";
