/**
 * Dashboard integrations status API.
 */
import { handleApiError } from "@/lib/api/errors"
import { ok, unauthorized } from "@/lib/api/response"
import { requireEditor } from "@/features/authentication/server"
import { listIntegrationsAdmin } from "@/services/admin"
import { getProviderStatuses } from "@/services/ai"

export async function GET() {
  try {
    const session = await requireEditor()
    if (!session) return unauthorized("Staff required")
    const [integrations, providers] = await Promise.all([
      listIntegrationsAdmin(),
      getProviderStatuses(),
    ])
    return ok({ integrations, providers })
  } catch (error) {
    return handleApiError(error)
  }
}
