import { handleApiError } from "@/lib/api/errors"
import { fail, ok } from "@/lib/api/response"
import { clientKeyFromRequest } from "@/lib/observability"
import { enforceRateLimit } from "@/lib/rate-limit"
import {
  unsubscribeNewsletter,
  updateNewsletterPreferences,
  verifyNewsletterSubscription,
} from "@/services/platform"
import { z } from "@/validators"

const schema = z.object({
  action: z.enum(["verify", "unsubscribe", "preferences"]),
  token: z.string().trim().min(8).max(128),
  preferences: z.array(z.string().trim().max(64)).max(20).optional(),
})

export async function POST(req: Request) {
  try {
    await enforceRateLimit(
      clientKeyFromRequest(req, "newsletter-manage"),
      20
    )
    const body = await req.json().catch(() => null)
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Invalid request.", 400)
    }

    if (parsed.data.action === "verify") {
      const okVerify = await verifyNewsletterSubscription(parsed.data.token)
      if (!okVerify) return fail("NOT_FOUND", "Invalid or expired token.", 404)
      return ok({ verified: true })
    }

    if (parsed.data.action === "unsubscribe") {
      const okUnsub = await unsubscribeNewsletter(parsed.data.token)
      if (!okUnsub) return fail("NOT_FOUND", "Invalid or expired token.", 404)
      return ok({ unsubscribed: true })
    }

    const okPref = await updateNewsletterPreferences({
      unsubscribeToken: parsed.data.token,
      preferences: parsed.data.preferences ?? [],
    })
    if (!okPref) return fail("NOT_FOUND", "Invalid or expired token.", 404)
    return ok({ updated: true })
  } catch (error) {
    return handleApiError(error)
  }
}
