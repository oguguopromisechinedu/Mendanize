/**
 * Dashboard tags API.
 */
import { handleApiError } from "@/lib/api/errors"
import { ok, unauthorized } from "@/lib/api/response"
import { requireEditor } from "@/features/authentication/server"
import {
  createTag,
  deleteTags,
  listTagsAdminDetailed,
} from "@/services/admin"
import {
  dashboardListQuerySchema,
  parseBody,
  parseSearchParams,
  z,
} from "@/validators"

const createSchema = z.object({
  name: z.string().min(1).max(80),
  slug: z.string().max(120).optional(),
})

const deleteSchema = z.object({
  ids: z.array(z.string()).min(1),
})

export async function GET(req: Request) {
  try {
    const session = await requireEditor()
    if (!session) return unauthorized("Staff required")
    const params = parseSearchParams(req.url, dashboardListQuerySchema)
    return ok(
      await listTagsAdminDetailed({
        page: params.page,
        pageSize: params.pageSize,
        query: params.query,
      })
    )
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireEditor()
    if (!session) return unauthorized("Staff required")
    const body = await parseBody(req, createSchema)
    return ok(await createTag(body), undefined, 201)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireEditor()
    if (!session) return unauthorized("Staff required")
    const body = await parseBody(req, deleteSchema)
    return ok({ count: await deleteTags(body.ids) })
  } catch (error) {
    return handleApiError(error)
  }
}
