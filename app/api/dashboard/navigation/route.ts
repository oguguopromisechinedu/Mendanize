/**
 * Dashboard navigation API — MES-016.
 */
import { handleApiError } from "@/lib/api/errors"
import { ok, unauthorized } from "@/lib/api/response"
import { requireEditor } from "@/features/authentication/server"
import { getNavigationOverview } from "@/services/navigation"

export async function GET() {
  try {
    const session = await requireEditor()
    if (!session) return unauthorized("Staff required")
    return ok(await getNavigationOverview())
  } catch (error) {
    return handleApiError(error)
  }
}
