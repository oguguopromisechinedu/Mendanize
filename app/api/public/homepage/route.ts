/**
 * Placeholder — /api/public/homepage
 * Returns seeded homepage payload for the Teaching Frontend (MES-005).
 */
import { ok } from "@/lib/api/response"
import { handleApiError } from "@/lib/api/errors"
import { getHomepageContent } from "@/services/content/homepage"

export async function GET() {
  try {
    const data = await getHomepageContent()
    return ok(data, { source: "seed", placeholder: false })
  } catch (error) {
    return handleApiError(error)
  }
}
