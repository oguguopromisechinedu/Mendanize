"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/authentication/server";
import {
  createCheckoutSession,
  createCustomerPortalSession,
} from "@/services/billing";
import { AppError } from "@/lib/api/errors";
import { checkoutPlanSchema } from "../validators/schema";
import type { ActionResult } from "../types/types";
import { BILLING_PATHS } from "../constants/constants";

function revalidateBilling() {
  revalidatePath(BILLING_PATHS.dashboard);
  revalidatePath(BILLING_PATHS.legacyDashboard);
  revalidatePath(BILLING_PATHS.pricing);
}

export async function startCheckoutAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireUser();
  if (!session?.user?.id || !session.user.email) {
    return { ok: false, message: "Sign in required" };
  }
  const parsed = checkoutPlanSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid plan selection" };
  }
  try {
    const { url } = await createCheckoutSession({
      userId: session.user.id,
      email: session.user.email,
      planId: parsed.data.planId,
    });
    revalidateBilling();
    return { ok: true, message: "Redirecting to Stripe Checkout", url };
  } catch (err) {
    const message =
      err instanceof AppError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Checkout failed";
    return { ok: false, message };
  }
}

export async function openBillingPortalAction(): Promise<ActionResult> {
  const session = await requireUser();
  if (!session?.user?.id) {
    return { ok: false, message: "Sign in required" };
  }
  try {
    const { url } = await createCustomerPortalSession({
      userId: session.user.id,
    });
    return { ok: true, message: "Opening billing portal", url };
  } catch (err) {
    const message =
      err instanceof AppError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Portal failed";
    return { ok: false, message };
  }
}
