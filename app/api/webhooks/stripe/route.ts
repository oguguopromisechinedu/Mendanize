/**
 * Stripe webhooks — MES-021.
 * Must receive raw body for signature verification.
 */
import { handleApiError } from "@/lib/api/errors";
import { ok } from "@/lib/api/response";
import { handleStripeWebhook } from "@/services/billing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("stripe-signature");
    const rawBody = await request.text();
    const result = await handleStripeWebhook(rawBody, signature);
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
