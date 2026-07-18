/**
 * Dashboard articles API — MES-008.
 */
import { handleApiError } from "@/lib/api/errors"
import { ok, unauthorized } from "@/lib/api/response"
import { requireEditor } from "@/features/authentication/server"
import * as contentService from "@/services/content"
import { parseSearchParams } from "@/validators"
import { dashboardArticlesQuerySchema } from "@/validators/articles"

export async function GET(req: Request) {
  try {
    const session = await requireEditor()
    if (!session) return unauthorized("Staff required")

    const params = parseSearchParams(req.url, dashboardArticlesQuerySchema)
    const data = await contentService.listArticlesAdmin({
      page: params.page,
      pageSize: params.pageSize,
      status:
        params.status === "draft"
          ? "DRAFT"
          : params.status === "published"
            ? "PUBLISHED"
            : undefined,
    })
    return ok(data, { statusFilter: params.status })
  } catch (error) {
    return handleApiError(error)
  }
}
