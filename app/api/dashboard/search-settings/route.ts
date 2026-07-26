/**
 * Dashboard search settings API — MES-017 / MES-020.
 */
import { handleApiError } from "@/lib/api/errors"
import { ok, unauthorized } from "@/lib/api/response"
import {
  PERMISSIONS,
  requirePermission,
} from "@/features/authentication/server"
import { getSearchSettingsOverview } from "@/services/search"

export async function GET() {
  try {
    const session = await requirePermission(PERMISSIONS.SETTINGS_MANAGE)
    if (!session) return unauthorized("Permission required: settings.manage")
    return ok(await getSearchSettingsOverview())
  } catch (error) {
    return handleApiError(error)
  }
}
