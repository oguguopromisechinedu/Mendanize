import { handleApiError } from "@/lib/api/errors"
import { ok } from "@/lib/api/response"
import { getHealthSnapshot } from "@/lib/observability"

/**
 * Lightweight health check — observability interface (MES-028).
 * Does not depend on external monitoring vendors.
 */
export async function GET() {
  try {
    return ok(await getHealthSnapshot(), { service: "health" })
  } catch (error) {
    return handleApiError(error)
  }
}
