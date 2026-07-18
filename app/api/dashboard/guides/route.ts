/**
 * Dashboard guides API — MES-010.
 */
import { handleApiError } from "@/lib/api/errors"
import { ok, unauthorized } from "@/lib/api/response"
import { requireEditor } from "@/features/authentication/server"
import { listGuidesAdmin } from "@/services/content"
import { dashboardListQuerySchema, parseSearchParams } from "@/validators"

export async function GET(req: Request) {
  try {
    const session = await requireEditor()
    if (!session) return unauthorized("Staff required")

    const params = parseSearchParams(req.url, dashboardListQuerySchema)
    const data = await listGuidesAdmin({
      page: params.page,
      pageSize: params.pageSize,
      query: params.query,
      status: params.status as
        | "DRAFT"
        | "REVIEW"
        | "SCHEDULED"
        | "PUBLISHED"
        | "ARCHIVED"
        | undefined,
    })
    return ok(data)
  } catch (error) {
    return handleApiError(error)
  }
}
