import { z } from "zod";

export const reportFilterSchema = z.object({
  reportType: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});
