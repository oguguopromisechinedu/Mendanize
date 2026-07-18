/**
 * Dashboard SEO API — MES-015.
 */
import { handleApiError } from "@/lib/api/errors"
import { ok, unauthorized } from "@/lib/api/response"
import { requireEditor } from "@/features/authentication/server"
import { getSeoDashboardStats, listRedirects } from "@/services/seo"

export async function GET() {
  try {
    const session = await requireEditor()
    if (!session) return unauthorized("Staff required")
    const [stats, redirects] = await Promise.all([
      getSeoDashboardStats(),
      listRedirects(),
    ])
    return ok({ stats, redirects })
  } catch (error) {
    return handleApiError(error)
  }
}
