/**
 * Dashboard newsletter campaigns API.
 */
import { handleApiError } from "@/lib/api/errors"
import { ok, unauthorized } from "@/lib/api/response"
import { requireEditor } from "@/features/authentication/server"
import {
  createNewsletterCampaign,
  listNewsletterCampaigns,
  sendNewsletterCampaign,
} from "@/services/admin"
import {
  dashboardListQuerySchema,
  parseBody,
  parseSearchParams,
  z,
} from "@/validators"

const createSchema = z.object({
  subject: z.string().min(1).max(200),
  previewText: z.string().max(300).optional().nullable(),
  bodyHtml: z.string().optional(),
  audienceFilter: z.string().max(40).optional(),
})

const sendSchema = z.object({
  id: z.string().min(1),
})

export async function GET(req: Request) {
  try {
    const session = await requireEditor()
    if (!session) return unauthorized("Staff required")
    const params = parseSearchParams(req.url, dashboardListQuerySchema)
    return ok(
      await listNewsletterCampaigns({
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
    return ok(await createNewsletterCampaign(body), undefined, 201)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireEditor()
    if (!session) return unauthorized("Staff required")
    const body = await parseBody(req, sendSchema)
    return ok(await sendNewsletterCampaign(body.id), { action: "send" })
  } catch (error) {
    return handleApiError(error)
  }
}
