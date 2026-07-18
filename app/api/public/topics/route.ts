/**
 * Public topics API — MES-009.
 */
import { handleApiError } from "@/lib/api/errors"
import { ok } from "@/lib/api/response"
import { clientKeyFromRequest } from "@/lib/observability"
import { enforceRateLimit } from "@/lib/rate-limit"
import * as contentService from "@/services/content"
import { parseSearchParams } from "@/validators"
import { z } from "zod"

const querySchema = z.object({
  categoryId: z.string().max(64).optional(),
})

export async function GET(req: Request) {
  try {
    await enforceRateLimit(clientKeyFromRequest(req, "public-topics"), 60)
    const params = parseSearchParams(req.url, querySchema)
    const data = await contentService.listPublicTopics(params.categoryId)
    return ok(data, { count: data.length })
  } catch (error) {
    return handleApiError(error)
  }
}
