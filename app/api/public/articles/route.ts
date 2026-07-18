/**
 * Public articles API — MES-008 / MES-025.
 */
import { handleApiError } from "@/lib/api/errors"
import { ok } from "@/lib/api/response"
import { clientKeyFromRequest } from "@/lib/observability"
import { enforceRateLimit } from "@/lib/rate-limit"
import * as contentService from "@/services/content"
import { parseSearchParams, publicContentListQuerySchema } from "@/validators"

export async function GET(req: Request) {
  try {
    await enforceRateLimit(clientKeyFromRequest(req, "public-articles"), 60)
    const params = parseSearchParams(req.url, publicContentListQuerySchema)
    const data = await contentService.listArticles({
      page: params.page,
      pageSize: params.pageSize,
      query: params.query,
      categorySlug: params.categorySlug,
      topicSlug: params.topicSlug,
      categoryId: params.categoryId,
    })
    return ok(data, { page: params.page, pageSize: params.pageSize })
  } catch (error) {
    return handleApiError(error)
  }
}
