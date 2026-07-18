/**
 * Public pricing catalog — MES-021 (read-only, no Stripe interaction).
 */
import { handleApiError } from "@/lib/api/errors";
import { ok } from "@/lib/api/response";
import { getPricingCatalog } from "@/services/billing";

export async function GET() {
  try {
    const plans = getPricingCatalog().map(
      ({ stripePriceId: _stripePriceId, ...rest }) => ({
        ...rest,
        checkoutAvailable: Boolean(_stripePriceId),
      }),
    );
    return ok(plans);
  } catch (error) {
    return handleApiError(error);
  }
}
