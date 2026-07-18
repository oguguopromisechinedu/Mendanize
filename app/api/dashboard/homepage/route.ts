/**
 * Dashboard homepage CMS API — MES-013.
 */
import { handleApiError } from "@/lib/api/errors"
import { ok, unauthorized } from "@/lib/api/response"
import { requireEditor } from "@/features/authentication/server"
import { getHomepageAdmin } from "@/services/content/homepage"

export async function GET() {
  try {
    const session = await requireEditor()
    if (!session) return unauthorized("Staff required")
    return ok(await getHomepageAdmin())
  } catch (error) {
    return handleApiError(error)
  }
}
