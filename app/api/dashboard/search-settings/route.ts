/**
 * Dashboard search settings API — MES-017 / MES-020.
 */
import { handleApiError } from "@/lib/api/errors"
import { ok, unauthorized } from "@/lib/api/response"
import { requireAdmin } from "@/features/authentication/server"
import { getSearchSettingsOverview } from "@/services/search"

export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) return unauthorized("Admin required")
    return ok(await getSearchSettingsOverview())
  } catch (error) {
    return handleApiError(error)
  }
}
