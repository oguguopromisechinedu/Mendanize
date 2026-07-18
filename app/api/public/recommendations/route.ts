/**
 * Public recommendations API — MES-018.
 * Contract: { data, error, meta }
 */
import { z } from "zod";
import { handleApiError } from "@/lib/api/errors";
import { ok } from "@/lib/api/response";
import { parseSearchParams } from "@/validators";
import { getRecommendations } from "@/services/recommendations";

const querySchema = z.object({
  contextType: z.enum(["article", "guide", "tool", "user", "trending"]),
  contextId: z.string().min(1).max(120).optional().default("global"),
  limit: z.coerce.number().int().min(1).max(24).optional().default(8),
});

export async function GET(req: Request) {
  try {
    const params = parseSearchParams(req.url, querySchema);
    const data = await getRecommendations({
      contextType: params.contextType,
      contextId: params.contextId,
      limit: params.limit,
    });
    return ok(data);
  } catch (error) {
    return handleApiError(error);
  }
}
