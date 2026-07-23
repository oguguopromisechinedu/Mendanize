/**
 * Public newsletter subscribe API — Stay Updated section.
 */
import { handleApiError } from "@/lib/api/errors";
import { fail, ok } from "@/lib/api/response";
import { clientKeyFromRequest } from "@/lib/observability";
import { enforceRateLimit } from "@/lib/rate-limit";
import { createSubscriber } from "@/services/admin";
import { z } from "@/validators";

const subscribeSchema = z.object({
  email: z.string().trim().email().max(254),
});

export async function POST(req: Request) {
  try {
    await enforceRateLimit(clientKeyFromRequest(req, "newsletter-public"), 10);
    const body = await req.json().catch(() => null);
    const parsed = subscribeSchema.safeParse(body);
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Please enter a valid email address.", 400);
    }

    try {
      await createSubscriber({ email: parsed.data.email });
    } catch (error) {
      // Duplicate email — treat as success so the endpoint doesn't leak
      // which addresses are already subscribed.
      const message = error instanceof Error ? error.message : "";
      const isDuplicate =
        message.includes("already exists") ||
        (typeof error === "object" &&
          error !== null &&
          "code" in error &&
          (error as { code?: string }).code === "P2002");
      if (!isDuplicate) throw error;
    }

    return ok({ subscribed: true });
  } catch (error) {
    return handleApiError(error);
  }
}
