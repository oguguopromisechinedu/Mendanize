/**
 * Dashboard comments moderation API.
 */
import { handleApiError } from "@/lib/api/errors"
import { ok, unauthorized } from "@/lib/api/response"
import { requireEditor } from "@/features/authentication/server"
import {
  bulkUpdateCommentStatus,
  deleteComments,
  listCommentsAdmin,
} from "@/services/admin"
import {
  dashboardListQuerySchema,
  parseBody,
  parseSearchParams,
  z,
} from "@/validators"

const moderateSchema = z.object({
  ids: z.array(z.string()).min(1),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "SPAM"]),
})

const deleteSchema = z.object({
  ids: z.array(z.string()).min(1),
})

export async function GET(req: Request) {
  try {
    const session = await requireEditor()
    if (!session) return unauthorized("Staff required")
    const params = parseSearchParams(req.url, dashboardListQuerySchema)
    const status =
      params.status === "PENDING" ||
      params.status === "APPROVED" ||
      params.status === "REJECTED" ||
      params.status === "SPAM"
        ? params.status
        : undefined
    return ok(
      await listCommentsAdmin({
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

export async function PATCH(req: Request) {
  try {
    const session = await requireEditor()
    if (!session) return unauthorized("Staff required")
    const body = await parseBody(req, moderateSchema)
    const count = await bulkUpdateCommentStatus(body.ids, body.status)
    return ok({ count, status: body.status })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireEditor()
    if (!session) return unauthorized("Staff required")
    const body = await parseBody(req, deleteSchema)
    return ok({ count: await deleteComments(body.ids) })
  } catch (error) {
    return handleApiError(error)
  }
}
