/**
 * Dashboard knowledge base API.
 */
import { handleApiError } from "@/lib/api/errors"
import { ok, unauthorized } from "@/lib/api/response"
import { requireEditor } from "@/features/authentication/server"
import {
  createKnowledgeArticle,
  deleteKnowledgeArticles,
  listKnowledgeArticles,
} from "@/services/admin"
import {
  dashboardListQuerySchema,
  parseBody,
  parseSearchParams,
  z,
} from "@/validators"

const createSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().max(120).optional(),
  category: z.string().max(80).optional(),
  body: z.string().optional(),
  published: z.boolean().optional(),
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
      await listKnowledgeArticles({
        page: params.page,
        pageSize: params.pageSize,
        query: params.query,
        category: params.category,
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
    return ok(await createKnowledgeArticle(body), undefined, 201)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireEditor()
    if (!session) return unauthorized("Staff required")
    const body = await parseBody(req, deleteSchema)
    return ok({ count: await deleteKnowledgeArticles(body.ids) })
  } catch (error) {
    return handleApiError(error)
  }
}
