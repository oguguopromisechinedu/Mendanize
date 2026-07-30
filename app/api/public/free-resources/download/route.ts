import { handleApiError } from "@/lib/api/errors"
import { fail, ok } from "@/lib/api/response"
import { getPublicSession } from "@/features/authentication/server"
import { recordFreeResourceDownload } from "@/services/platform"
import { z } from "@/validators"

const schema = z.object({
  resourceId: z.string().trim().min(1),
})

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Missing resource.", 400)
    }
    const session = await getPublicSession()
    await recordFreeResourceDownload({
      resourceId: parsed.data.resourceId,
      publicUserId: session?.user?.id,
    })
    return ok({ recorded: true })
  } catch (error) {
    return handleApiError(error)
  }
}
