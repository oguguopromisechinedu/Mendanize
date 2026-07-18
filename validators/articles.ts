/**
 * Example dashboard articles list query schema (MES-002 validation pattern).
 * Owning feature MES-008 will extend this; used by api/dashboard/articles today.
 */

import { z } from "zod";

export const dashboardArticlesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.enum(["draft", "published", "all"]).optional().default("all"),
});

export type DashboardArticlesQuery = z.infer<typeof dashboardArticlesQuerySchema>;
