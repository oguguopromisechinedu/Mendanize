/**
 * Dashboard automation API — scheduled jobs.
 */
import { handleApiError } from "@/lib/api/errors"
import { ok, unauthorized } from "@/lib/api/response"
import {
  PERMISSIONS,
  requirePermission,
} from "@/features/authentication/server"
import {
  listAutomationJobs,
  runAutomationJob,
  setAutomationJobEnabled,
} from "@/services/admin"
import { parseBody, z } from "@/validators"

const toggleSchema = z.object({
  key: z.string().min(1),
  enabled: z.boolean(),
})

const runSchema = z.object({
  key: z.string().min(1),
})

export async function GET() {
  try {
    const session = await requirePermission(PERMISSIONS.SETTINGS_MANAGE)
    if (!session) return unauthorized("Permission required: settings.manage")
    return ok(await listAutomationJobs())
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requirePermission(PERMISSIONS.SETTINGS_MANAGE)
    if (!session) return unauthorized("Permission required: settings.manage")
    const body = await parseBody(req, toggleSchema)
    const job = await setAutomationJobEnabled(body.key, body.enabled)
    return ok(job)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: Request) {
  try {
    const session = await requirePermission(PERMISSIONS.SETTINGS_MANAGE)
    if (!session) return unauthorized("Permission required: settings.manage")
    const body = await parseBody(req, runSchema)
    const job = await runAutomationJob(body.key)
    return ok(job)
  } catch (error) {
    return handleApiError(error)
  }
}
