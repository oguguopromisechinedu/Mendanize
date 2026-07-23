import { handleApiError } from "@/lib/api/errors"
import { ok, unauthorized } from "@/lib/api/response"
import { requireAdmin } from "@/features/authentication/server"
import { listUsersAdmin, updateUserRole } from "@/services/admin"
import { parseBody, parseSearchParams, dashboardListQuerySchema, z } from "@/validators"
import type { AdminRoleKey } from "@prisma/client"

const roleBodySchema = z.object({
  id: z.string().min(1),
  role: z.enum([
    "SUPER_ADMINISTRATOR",
    "ADMINISTRATOR",
    "EDITOR",
    "CONTENT_MANAGER",
    "ANALYTICS_MANAGER",
    "SUPPORT_MANAGER",
  ]),
})

export async function GET(req: Request) {
  try {
    const session = await requireAdmin()
    if (!session) return unauthorized("Admin required")

    const params = parseSearchParams(req.url, dashboardListQuerySchema)
    const data = await listUsersAdmin({
      page: params.page,
      pageSize: params.pageSize,
      query: params.query,
      role: params.role,
      staffOnly: params.staffOnly,
    })
    return ok(data)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireAdmin()
    if (!session) return unauthorized("Admin required")

    const body = await parseBody(req, roleBodySchema)
    const user = await updateUserRole(
      body.id,
      body.role as AdminRoleKey,
      session.admin.id
    )
    return ok(user, { action: "update_role" })
  } catch (error) {
    return handleApiError(error)
  }
}
