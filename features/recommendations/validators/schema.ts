import { z } from "zod";

export const recommendationsQuerySchema = z.object({
  contextType: z.enum(["article", "guide", "tool", "user", "trending"]),
  contextId: z.string().min(1).max(120),
  limit: z.coerce.number().int().min(1).max(24).optional(),
});
