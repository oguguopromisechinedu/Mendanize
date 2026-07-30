/**
 * Public newsletter subscribe API.
 */
import { handleApiError } from "@/lib/api/errors"
import { fail, ok } from "@/lib/api/response"
import { clientKeyFromRequest } from "@/lib/observability"
import { enforceRateLimit } from "@/lib/rate-limit"
import { subscribeNewsletter } from "@/services/platform"
import { z } from "@/validators"

const subscribeSchema = z.object({
  email: z.string().trim().email().max(254),
  preferences: z.array(z.string().trim().max(64)).max(20).optional(),
})

export async function POST(req: Request) {
  try {
    await enforceRateLimit(clientKeyFromRequest(req, "newsletter-public"), 10)
    const body = await req.json().catch(() => null)
    const parsed = subscribeSchema.safeParse(body)
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Please enter a valid email address.", 400)
    }

    await subscribeNewsletter({
      email: parsed.data.email,
      preferences: parsed.data.preferences,
    })

    return ok({ subscribed: true })
  } catch (error) {
    return handleApiError(error)
  }
}
