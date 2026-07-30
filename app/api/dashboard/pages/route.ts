/**
 * Dashboard static pages API.
 */
import { handleApiError } from "@/lib/api/errors"
import { ok, unauthorized } from "@/lib/api/response"
import { requireEditor } from "@/features/authentication/server"
import { createPage, deletePages, listPagesAdmin } from "@/services/admin"
import {
  dashboardListQuerySchema,
  parseBody,
  parseSearchParams,
  z,
} from "@/validators"

const createSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().max(120).optional(),
  content: z.string().optional(),
  excerpt: z.string().max(500).optional().nullable(),
  hero: z.string().max(2000).optional().nullable(),
  featuredImageUrl: z.string().max(2000).optional().nullable(),
  featuredImageAlt: z.string().max(200).optional().nullable(),
  status: z.enum(["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"]).optional(),
  seoTitle: z.string().max(200).optional().nullable(),
  seoDescription: z.string().max(500).optional().nullable(),
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
      params.status === "DRAFT" ||
      params.status === "REVIEW" ||
      params.status === "PUBLISHED" ||
      params.status === "ARCHIVED"
        ? params.status
        : undefined
    return ok(
      await listPagesAdmin({
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

export async function POST(req: Request) {
  try {
    const session = await requireEditor()
    if (!session) return unauthorized("Staff required")
    const body = await parseBody(req, createSchema)
    return ok(await createPage(body), undefined, 201)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireEditor()
    if (!session) return unauthorized("Staff required")
    const body = await parseBody(req, deleteSchema)
    return ok({ count: await deletePages(body.ids) })
  } catch (error) {
    return handleApiError(error)
  }
}
