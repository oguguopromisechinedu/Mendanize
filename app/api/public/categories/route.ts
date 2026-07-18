/**
 * Public categories API — MES-009.
 */
import { handleApiError } from "@/lib/api/errors"
import { ok } from "@/lib/api/response"
import { clientKeyFromRequest } from "@/lib/observability"
import { enforceRateLimit } from "@/lib/rate-limit"
import * as contentService from "@/services/content"

export async function GET(req: Request) {
  try {
    await enforceRateLimit(clientKeyFromRequest(req, "public-categories"), 60)
    const data = await contentService.listPublicCategories()
    return ok(data, { count: data.length })
  } catch (error) {
    return handleApiError(error)
  }
}
