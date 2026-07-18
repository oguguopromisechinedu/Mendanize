/**
 * Example/public search query schema (MES-002 validation pattern).
 * Owning feature MES-017 will extend this; used by api/public/search today.
 */

import { z } from "zod";

export const publicSearchQuerySchema = z.object({
  q: z.string().min(1, "Query is required").max(200),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export type PublicSearchQuery = z.infer<typeof publicSearchQuerySchema>;
