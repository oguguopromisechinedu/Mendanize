/**
 * Dashboard AI Studio API — MES-011.
 */
import { handleApiError } from "@/lib/api/errors"
import { ok, unauthorized } from "@/lib/api/response"
import { requireEditor } from "@/features/authentication/server"
import { listGenerations } from "@/services/ai"
import { dashboardListQuerySchema, parseSearchParams } from "@/validators"

export async function GET(req: Request) {
  try {
    const session = await requireEditor()
    if (!session) return unauthorized("Staff required")

    const params = parseSearchParams(req.url, dashboardListQuerySchema)
    const data = await listGenerations({
      page: params.page,
      pageSize: params.pageSize,
      query: params.query,
      status: (params.status as
        | "PENDING"
        | "RUNNING"
        | "COMPLETED"
        | "FAILED"
        | "ACCEPTED"
        | "ALL"
        | undefined) ?? "ALL",
    })
    return ok(data)
  } catch (error) {
    return handleApiError(error)
  }
}
