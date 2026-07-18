/**
 * Dashboard activity / audit log API.
 */
import { handleApiError } from "@/lib/api/errors"
import { ok, unauthorized } from "@/lib/api/response"
import { requireEditor } from "@/features/authentication/server"
import { listAuditLogsAdmin } from "@/services/admin"
import { dashboardListQuerySchema, parseSearchParams } from "@/validators"

export async function GET(req: Request) {
  try {
    const session = await requireEditor()
    if (!session) return unauthorized("Staff required")
    const params = parseSearchParams(req.url, dashboardListQuerySchema)
    return ok(
      await listAuditLogsAdmin({
        page: params.page,
        pageSize: params.pageSize,
        query: params.query,
        entityType: params.entityType,
      })
    )
  } catch (error) {
    return handleApiError(error)
  }
}
