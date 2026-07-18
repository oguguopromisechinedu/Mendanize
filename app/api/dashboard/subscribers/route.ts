/**
 * Dashboard subscribers API — audience list.
 */
import { handleApiError } from "@/lib/api/errors"
import { ok, unauthorized } from "@/lib/api/response"
import { requireEditor } from "@/features/authentication/server"
import {
  createSubscriber,
  deleteSubscribers,
  listSubscribersAdmin,
} from "@/services/admin"
import {
  dashboardListQuerySchema,
  parseBody,
  parseSearchParams,
  z,
} from "@/validators"

const createSchema = z.object({
  email: z.string().email(),
  name: z.string().max(120).optional().nullable(),
  status: z.string().max(40).optional(),
  categories: z.array(z.string()).optional(),
})

const deleteSchema = z.object({
  ids: z.array(z.string()).min(1),
})

export async function GET(req: Request) {
  try {
    const session = await requireEditor()
    if (!session) return unauthorized("Staff required")

    const params = parseSearchParams(req.url, dashboardListQuerySchema)
    const data = await listSubscribersAdmin({
      page: params.page,
      pageSize: params.pageSize,
      query: params.query,
      status: params.status,
    })
    return ok(data)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireEditor()
    if (!session) return unauthorized("Staff required")
    const body = await parseBody(req, createSchema)
    const data = await createSubscriber(body)
    return ok(data, undefined, 201)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireEditor()
    if (!session) return unauthorized("Staff required")
    const body = await parseBody(req, deleteSchema)
    const count = await deleteSubscribers(body.ids)
    return ok({ count })
  } catch (error) {
    return handleApiError(error)
  }
}
