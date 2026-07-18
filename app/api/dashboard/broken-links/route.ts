/**
 * Dashboard broken links API.
 */
import { handleApiError } from "@/lib/api/errors"
import { ok, unauthorized } from "@/lib/api/response"
import { requireEditor } from "@/features/authentication/server"
import {
  listBrokenLinksAdmin,
  runBrokenLinkScan,
  updateBrokenLinkStatus,
} from "@/services/admin"
import {
  dashboardListQuerySchema,
  parseBody,
  parseSearchParams,
  z,
} from "@/validators"

const statusSchema = z.object({
  ids: z.array(z.string()).min(1),
  status: z.enum(["OPEN", "IGNORED", "FIXED"]),
})

export async function GET(req: Request) {
  try {
    const session = await requireEditor()
    if (!session) return unauthorized("Staff required")
    const params = parseSearchParams(req.url, dashboardListQuerySchema)
    const status =
      params.status === "OPEN" ||
      params.status === "IGNORED" ||
      params.status === "FIXED"
        ? params.status
        : undefined
    return ok(
      await listBrokenLinksAdmin({
        page: params.page,
        pageSize: params.pageSize,
        query: params.query,
        status,
      })
    )
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST() {
  try {
    const session = await requireEditor()
    if (!session) return unauthorized("Staff required")
    const count = await runBrokenLinkScan()
    return ok({ scanned: count }, { action: "scan" })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireEditor()
    if (!session) return unauthorized("Staff required")
    const body = await parseBody(req, statusSchema)
    const count = await updateBrokenLinkStatus(body.ids, body.status)
    return ok({ count, status: body.status })
  } catch (error) {
    return handleApiError(error)
  }
}
