import { handleApiError } from "@/lib/api/errors"
import { ok, unauthorized } from "@/lib/api/response"
import {
  PERMISSIONS,
  requirePermission,
} from "@/features/authentication/server"
import { listUsersAdmin, updateUserRole, createAdminUser } from "@/services/admin"
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

const createBodySchema = z.object({
  email: z.string().email().max(320),
  name: z.string().max(120).optional().nullable(),
  password: z.string().min(8).max(128),
  role: roleBodySchema.shape.role,
})

export async function GET(req: Request) {
  try {
    const session = await requirePermission(PERMISSIONS.USERS_MANAGE)
    if (!session) return unauthorized("Permission required: users.manage")

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
    const session = await requirePermission(PERMISSIONS.USERS_MANAGE)
    if (!session) return unauthorized("Permission required: users.manage")

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

export async function POST(req: Request) {
  try {
    const session = await requirePermission(PERMISSIONS.USERS_MANAGE)
    if (!session) return unauthorized("Permission required: users.manage")

    const body = await parseBody(req, createBodySchema)
    if (
      body.role === "SUPER_ADMINISTRATOR" &&
      session.admin.roleKey !== "SUPER_ADMINISTRATOR"
    ) {
      return unauthorized("Only Super Administrator can create Super Administrator accounts")
    }

    const user = await createAdminUser({
      email: body.email,
      name: body.name,
      password: body.password,
      role: body.role as AdminRoleKey,
      actorId: session.admin.id,
    })
    return ok(user, { action: "create_admin" })
  } catch (error) {
    return handleApiError(error)
  }
}
