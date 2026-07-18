/**
 * Dashboard workflow API — publishing queue.
 */
import { handleApiError } from "@/lib/api/errors"
import { ok, unauthorized } from "@/lib/api/response"
import { requireEditor } from "@/features/authentication/server"
import { advanceWorkflowItem, listWorkflowQueue } from "@/services/admin"
import {
  dashboardListQuerySchema,
  parseBody,
  parseSearchParams,
  z,
} from "@/validators"

const advanceSchema = z.object({
  kind: z.enum(["article", "guide", "tool"]),
  id: z.string().min(1),
  status: z.enum(["DRAFT", "REVIEW", "SCHEDULED", "PUBLISHED", "ARCHIVED"]),
})

export async function GET(req: Request) {
  try {
    const session = await requireEditor()
    if (!session) return unauthorized("Staff required")

    const params = parseSearchParams(req.url, dashboardListQuerySchema)
    const data = await listWorkflowQueue({
      query: params.query,
      status: params.status,
      kind: params.kind,
    })
    return ok(data)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireEditor()
    if (!session) return unauthorized("Staff required")
    const body = await parseBody(req, advanceSchema)
    await advanceWorkflowItem(body.kind, body.id, body.status)
    return ok({ id: body.id, status: body.status })
  } catch (error) {
    return handleApiError(error)
  }
}
