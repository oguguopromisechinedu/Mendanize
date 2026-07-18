/**
 * Billing Shared Service — MES-021.
 * Stripe Checkout, Customer Portal, webhook sync. No per-tier feature gates yet.
 */

import "server-only";

import type Stripe from "stripe";
import { PlanTier } from "@prisma/client";

import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { StripeError, ValidationError } from "@/lib/api/errors";
import {
  getPricingCatalog,
  resolvePlanFromStripePriceId,
  TIER_LABELS,
} from "./plans";
import {
  getAppBaseUrl,
  getStripe,
  getWebhookSecret,
  isStripeConfigured,
} from "./stripe";
import type {
  BillingDashboard,
  BillingPlanId,
  CheckoutResult,
  InvoiceSummary,
  PaymentMethodSummary,
  PortalResult,
  PlanTierValue,
  SubscriptionRecord,
} from "./types";

export {
  getPricingCatalog,
  getPlanById,
  TIER_LABELS,
  PLAN_ID_TO_TIER,
  TIER_TO_PLAN_ID,
  resolvePlanFromStripePriceId,
} from "./plans";
export type * from "./types";
export { isStripeConfigured } from "./stripe";

function db() {
  return getPrisma();
}

function toPlanTier(value: PlanTierValue): PlanTier {
  return value as PlanTier;
}

function mapSubscription(row: {
  id: string;
  userId: string;
  plan: PlanTier;
  status: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  updatedAt: Date;
}): SubscriptionRecord {
  return {
    id: row.id,
    userId: row.userId,
    plan: row.plan as PlanTierValue,
    status: row.status,
    stripeCustomerId: row.stripeCustomerId,
    stripeSubscriptionId: row.stripeSubscriptionId,
    stripePriceId: row.stripePriceId,
    currentPeriodEnd: row.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: row.cancelAtPeriodEnd,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function localFreeSubscription(userId: string): SubscriptionRecord {
  return {
    id: "local",
    userId,
    plan: "FREE",
    status: "active",
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripePriceId: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    updatedAt: new Date().toISOString(),
  };
}

/** Ensure a FREE subscription row exists for the user. */
export async function ensureSubscription(
  userId: string,
): Promise<SubscriptionRecord> {
  if (!isDatabaseConfigured()) {
    return localFreeSubscription(userId);
  }
  const existing = await db().subscription.findUnique({ where: { userId } });
  if (existing) return mapSubscription(existing);
  const created = await db().subscription.create({
    data: {
      userId,
      plan: PlanTier.FREE,
      status: "active",
    },
  });
  return mapSubscription(created);
}

export async function getSubscriptionForUser(
  userId: string,
): Promise<SubscriptionRecord> {
  return ensureSubscription(userId);
}

async function ensureStripeCustomer(userId: string, email: string): Promise<string> {
  const stripe = getStripe();
  const sub = await ensureSubscription(userId);
  if (sub.stripeCustomerId) return sub.stripeCustomerId;

  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  if (isDatabaseConfigured()) {
    await db().subscription.update({
      where: { userId },
      data: { stripeCustomerId: customer.id },
    });
  }
  return customer.id;
}

export async function createCheckoutSession(input: {
  userId: string;
  email: string;
  planId: BillingPlanId;
}): Promise<CheckoutResult> {
  if (!isStripeConfigured()) {
    throw new StripeError("Stripe is not configured. Set STRIPE_SECRET_KEY.");
  }
  if (input.planId === "starter") {
    throw new ValidationError("Starter tier does not require checkout.");
  }

  const catalog = getPricingCatalog().find((p) => p.id === input.planId);
  if (!catalog?.stripePriceId) {
    throw new ValidationError(
      `Missing Stripe price ID for ${input.planId}. Set STRIPE_PRICE_PRO or STRIPE_PRICE_TEAM.`,
    );
  }

  const customerId = await ensureStripeCustomer(input.userId, input.email);
  const base = getAppBaseUrl();
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: catalog.stripePriceId, quantity: 1 }],
    success_url: `${base}/dashboard/settings/billing?checkout=success`,
    cancel_url: `${base}/dashboard/settings/billing?checkout=canceled`,
    client_reference_id: input.userId,
    metadata: { userId: input.userId, planId: input.planId },
    subscription_data: {
      metadata: { userId: input.userId, planId: input.planId },
    },
    allow_promotion_codes: true,
  });

  if (!session.url) {
    throw new StripeError("Stripe Checkout session did not return a URL.");
  }
  return { url: session.url };
}

export async function createCustomerPortalSession(input: {
  userId: string;
}): Promise<PortalResult> {
  if (!isStripeConfigured()) {
    throw new StripeError("Stripe is not configured. Set STRIPE_SECRET_KEY.");
  }
  const sub = await ensureSubscription(input.userId);
  if (!sub.stripeCustomerId) {
    throw new ValidationError(
      "No Stripe customer yet. Upgrade a plan first to manage billing.",
    );
  }
  const stripe = getStripe();
  const portal = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${getAppBaseUrl()}/dashboard/settings/billing`,
  });
  return { url: portal.url };
}

async function listInvoicesForCustomer(
  customerId: string | null,
): Promise<InvoiceSummary[]> {
  if (!customerId || !isStripeConfigured()) return [];
  try {
    const stripe = getStripe();
    const list = await stripe.invoices.list({
      customer: customerId,
      limit: 12,
    });
    return list.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      status: inv.status ?? null,
      amountDue: inv.amount_due,
      currency: inv.currency,
      created: new Date(inv.created * 1000).toISOString(),
      hostedInvoiceUrl: inv.hosted_invoice_url ?? null,
      invoicePdf: inv.invoice_pdf ?? null,
    }));
  } catch {
    return [];
  }
}

async function getDefaultPaymentMethod(
  customerId: string | null,
): Promise<PaymentMethodSummary> {
  if (!customerId || !isStripeConfigured()) return null;
  try {
    const stripe = getStripe();
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) return null;
    const pmId =
      typeof customer.invoice_settings?.default_payment_method === "string"
        ? customer.invoice_settings.default_payment_method
        : customer.invoice_settings?.default_payment_method?.id;
    if (!pmId) {
      const methods = await stripe.paymentMethods.list({
        customer: customerId,
        type: "card",
        limit: 1,
      });
      const card = methods.data[0]?.card;
      if (!card) return null;
      return {
        brand: card.brand,
        last4: card.last4,
        expMonth: card.exp_month,
        expYear: card.exp_year,
      };
    }
    const pm = await stripe.paymentMethods.retrieve(pmId);
    return {
      brand: pm.card?.brand ?? null,
      last4: pm.card?.last4 ?? null,
      expMonth: pm.card?.exp_month ?? null,
      expYear: pm.card?.exp_year ?? null,
    };
  } catch {
    return null;
  }
}

export async function getBillingDashboard(
  userId: string,
): Promise<BillingDashboard> {
  const subscription = await ensureSubscription(userId);
  const [invoices, paymentMethod] = await Promise.all([
    listInvoicesForCustomer(subscription.stripeCustomerId),
    getDefaultPaymentMethod(subscription.stripeCustomerId),
  ]);

  return {
    subscription,
    planName: TIER_LABELS[subscription.plan],
    stripeConfigured: isStripeConfigured(),
    paymentMethod,
    invoices,
    canUpgrade:
      isStripeConfigured() &&
      (subscription.plan === "FREE" || subscription.status !== "active"),
    canManage: Boolean(subscription.stripeCustomerId && isStripeConfigured()),
  };
}

function periodEndFromSubscription(sub: Stripe.Subscription): Date | null {
  const end =
    (sub as Stripe.Subscription & { current_period_end?: number })
      .current_period_end ?? null;
  return end ? new Date(end * 1000) : null;
}

function priceIdFromSubscription(sub: Stripe.Subscription): string | null {
  return sub.items.data[0]?.price?.id ?? null;
}

export async function syncSubscriptionFromStripe(
  stripeSub: Stripe.Subscription,
  userIdHint?: string | null,
): Promise<void> {
  if (!isDatabaseConfigured()) return;

  const userId =
    userIdHint ||
    stripeSub.metadata?.userId ||
    (
      await db().subscription.findFirst({
        where: {
          OR: [
            { stripeSubscriptionId: stripeSub.id },
            { stripeCustomerId: String(stripeSub.customer) },
          ],
        },
      })
    )?.userId;

  if (!userId) return;

  const priceId = priceIdFromSubscription(stripeSub);
  const plan = resolvePlanFromStripePriceId(priceId);
  const status =
    stripeSub.status === "canceled"
      ? "canceled"
      : stripeSub.status === "past_due"
        ? "past_due"
        : stripeSub.status === "active" || stripeSub.status === "trialing"
          ? "active"
          : stripeSub.status;

  await ensureSubscription(userId);
  await db().subscription.update({
    where: { userId },
    data: {
      plan: toPlanTier(status === "canceled" ? "FREE" : plan),
      status,
      stripeCustomerId: String(stripeSub.customer),
      stripeSubscriptionId: stripeSub.id,
      stripePriceId: priceId,
      currentPeriodEnd: periodEndFromSubscription(stripeSub),
      cancelAtPeriodEnd: Boolean(stripeSub.cancel_at_period_end),
    },
  });
}

async function markPastDue(customerId: string): Promise<void> {
  if (!isDatabaseConfigured()) return;
  await db().subscription.updateMany({
    where: { stripeCustomerId: customerId },
    data: { status: "past_due" },
  });
}

export async function handleStripeWebhook(
  rawBody: string,
  signature: string | null,
): Promise<{ received: true }> {
  if (!isStripeConfigured()) {
    throw new StripeError("Stripe is not configured.");
  }
  const secret = getWebhookSecret();
  if (!secret) {
    throw new StripeError("STRIPE_WEBHOOK_SECRET is not set.");
  }
  if (!signature) {
    throw new ValidationError("Missing Stripe-Signature header.");
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    throw new ValidationError(
      err instanceof Error ? err.message : "Invalid webhook signature",
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId || session.client_reference_id;
      if (session.subscription && typeof session.subscription === "string") {
        const sub = await stripe.subscriptions.retrieve(session.subscription);
        await syncSubscriptionFromStripe(sub, userId);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      await syncSubscriptionFromStripe(sub, sub.metadata?.userId);
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await syncSubscriptionFromStripe(
        { ...sub, status: "canceled" },
        sub.metadata?.userId,
      );
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId =
        typeof invoice.customer === "string" ? invoice.customer : null;
      if (customerId) await markPastDue(customerId);
      break;
    }
    default:
      break;
  }

  return { received: true };
}
