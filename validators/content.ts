/**
 * Shared content list query schemas (MES-002).
 */
import { z } from "zod";

export const publicContentListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  query: z.string().max(200).optional(),
  categorySlug: z.string().max(120).optional(),
  topicSlug: z.string().max(120).optional(),
  categoryId: z.string().max(64).optional(),
});

export const dashboardListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(50),
  query: z.string().max(200).optional(),
  status: z.string().max(40).optional(),
  role: z.string().max(40).optional(),
  kind: z.enum(["article", "guide", "tool"]).optional(),
  entityType: z.string().max(40).optional(),
  category: z.string().max(80).optional(),
  staffOnly: z
    .string()
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
});

export type PublicContentListQuery = z.infer<typeof publicContentListQuerySchema>;
export type DashboardListQuery = z.infer<typeof dashboardListQuerySchema>;
