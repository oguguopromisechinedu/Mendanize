/**
 * MES-053 Phase B — Work Marketplace monthly retainers.
 * Stripe Connect + Billing destination charges — never MES-021 Checkout.
 */

import "server-only"

import type Stripe from "stripe"

import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma"
import { dispatch as dispatchNotification } from "@/services/notification"
import {
  getStripeConnect,
  isStripeConnectConfigured,
} from "./connect"
import { resolveFeeBps } from "./finance"
import type {
  MaintenanceRetainerTier,
  MaintenanceSubscriptionRecord,
  MaintenanceSubscriptionStatus,
} from "./types"

function db() {
  return getPrisma()
}

export type MaintenancePlan = {
  tier: Exclude<MaintenanceRetainerTier, "CUSTOM">
  label: string
  amountCents: number
  summary: string
  fairUse: string
}

/** Seed catalog — Admin-configurable catalog can replace later. */
export function listMaintenancePlans(): MaintenancePlan[] {
  return [
    {
      tier: "BASIC",
      label: "Basic Maintenance",
      amountCents: 9900,
      summary: "Monitoring, small fixes, and dependency bumps.",
      fairUse: "Light monthly touch-ups. Larger features are billed as tasks.",
    },
    {
      tier: "STANDARD",
      label: "Standard Support",
      amountCents: 24900,
      summary: "Basic plus content updates and minor features.",
      fairUse: "Reasonable monthly updates. Major builds stay as paid tasks.",
    },
    {
      tier: "PREMIUM",
      label: "Premium Support",
      amountCents: 49900,
      summary: "Priority response and a larger monthly scope.",
      fairUse: "Priority queue within the plan. Overage is still human-scoped.",
    },
  ]
}

function mapSub(row: {
  id: string
  rootContractId: string
  continuationContractId: string
  clientId: string
  workerId: string
  tier: MaintenanceRetainerTier
  amountCents: number
  currency: string
  status: MaintenanceSubscriptionStatus
  stripeSubscriptionId: string | null
  applicationFeePercent: number
  cancelAtPeriodEnd: boolean
  currentPeriodEnd: Date | null
  createdAt: Date
}): MaintenanceSubscriptionRecord {
  return {
    id: row.id,
    rootContractId: row.rootContractId,
    continuationContractId: row.continuationContractId,
    clientId: row.clientId,
    workerId: row.workerId,
    tier: row.tier,
    amountCents: row.amountCents,
    currency: row.currency,
    status: row.status,
    stripeSubscriptionId: row.stripeSubscriptionId,
    applicationFeePercent: row.applicationFeePercent,
    cancelAtPeriodEnd: row.cancelAtPeriodEnd,
    currentPeriodEnd: row.currentPeriodEnd?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }
}

function mapStripeStatus(
  status: Stripe.Subscription.Status,
): MaintenanceSubscriptionStatus {
  switch (status) {
    case "active":
      return "ACTIVE"
    case "trialing":
      return "TRIALING"
    case "past_due":
    case "unpaid":
      return "PAST_DUE"
    case "canceled":
    case "incomplete_expired":
      return "CANCELLED"
    default:
      return "INCOMPLETE"
  }
}

export function isMaintenanceRetainerEvent(event: Stripe.Event): boolean {
  const obj = event.data.object as { metadata?: Record<string, string> }
  return obj?.metadata?.rail === "mes053_retainer"
}

async function ensurePlatformCustomer(input: {
  clientId: string
  email: string | null
  name: string | null
}): Promise<string> {
  const stripe = getStripeConnect()
  const existing = await db().maintenanceSubscription.findFirst({
    where: {
      clientId: input.clientId,
      stripeCustomerId: { not: null },
    },
    orderBy: { createdAt: "desc" },
    select: { stripeCustomerId: true },
  })
  if (existing?.stripeCustomerId) return existing.stripeCustomerId

  const customer = await stripe.customers.create({
    email: input.email ?? undefined,
    name: input.name ?? undefined,
    metadata: {
      rail: "mes053_retainer",
      publicUserId: input.clientId,
    },
  })
  return customer.id
}

async function ensureRetainerPrice(input: {
  tier: MaintenanceRetainerTier
  amountCents: number
  currency: string
}): Promise<string> {
  const stripe = getStripeConnect()
  const lookupKey = `mendanize_maint_${input.tier.toLowerCase()}_${input.amountCents}_${input.currency}`
  const existing = await stripe.prices.list({
    lookup_keys: [lookupKey],
    active: true,
    limit: 1,
  })
  if (existing.data[0]) return existing.data[0].id

  const product = await stripe.products.create({
    name: `Mendanize Maintenance — ${input.tier}`,
    metadata: { rail: "mes053_retainer", tier: input.tier },
  })
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: input.amountCents,
    currency: input.currency,
    recurring: { interval: "month" },
    lookup_key: lookupKey,
    metadata: { rail: "mes053_retainer", tier: input.tier },
  })
  return price.id
}

export async function getActiveMaintenanceSubscription(
  continuationContractId: string,
): Promise<MaintenanceSubscriptionRecord | null> {
  if (!isDatabaseConfigured()) return null
  const row = await db().maintenanceSubscription.findFirst({
    where: {
      continuationContractId,
      status: { in: ["ACTIVE", "TRIALING", "PAST_DUE", "INCOMPLETE"] },
    },
    orderBy: { createdAt: "desc" },
  })
  return row ? mapSub(row) : null
}

export async function listMaintenanceSubscriptionPayments(
  subscriptionId: string,
) {
  if (!isDatabaseConfigured()) return []
  return db().maintenanceSubscriptionPayment.findMany({
    where: { subscriptionId },
    orderBy: { createdAt: "desc" },
    take: 24,
  })
}

export async function startMaintenanceRetainer(input: {
  continuationContractId: string
  clientId: string
  tier: Exclude<MaintenanceRetainerTier, "CUSTOM">
  customAmountCents?: number
}): Promise<{
  subscription: MaintenanceSubscriptionRecord
  clientSecret: string | null
  connectConfigured: boolean
}> {
  const contract = await db().contract.findFirst({
    where: {
      id: input.continuationContractId,
      clientId: input.clientId,
      kind: "CONTINUATION",
      status: "ACTIVE",
    },
    include: {
      client: { select: { email: true, name: true } },
    },
  })
  if (!contract) throw new Error("Active maintenance contract not found.")

  const existing = await getActiveMaintenanceSubscription(contract.id)
  if (existing && existing.status !== "INCOMPLETE") {
    throw new Error("A retainer plan is already active for this project.")
  }

  const plan = listMaintenancePlans().find((p) => p.tier === input.tier)
  if (!plan) throw new Error("Unknown plan tier.")
  const amountCents = plan.amountCents

  let rootContractId = contract.id
  let cursor: string | null = contract.parentContractId
  for (let i = 0; i < 20 && cursor; i += 1) {
    const row = await db().contract.findUnique({
      where: { id: cursor },
      select: { id: true, parentContractId: true, kind: true },
    })
    if (!row) break
    rootContractId = row.id
    if (row.kind === "PROJECT" || !row.parentContractId) break
    cursor = row.parentContractId
  }

  const feeBps = await resolveFeeBps({ scope: "WORK" })
  const applicationFeePercent = Math.min(50, Math.max(0, feeBps / 100))

  const connectConfigured = isStripeConnectConfigured()
  let stripeSubscriptionId: string | null = null
  let stripeCustomerId: string | null = null
  let stripePriceId: string | null = null
  let clientSecret: string | null = null
  let status: MaintenanceSubscriptionStatus = "INCOMPLETE"
  let currentPeriodEnd: Date | null = null

  if (connectConfigured) {
    const payout = await db().creatorPayoutAccount.findUnique({
      where: { publicUserId: contract.workerId },
    })
    if (!payout?.stripeConnectAccountId) {
      throw new Error(
        "The developer must finish Stripe Connect payout setup before retainers can start.",
      )
    }

    stripeCustomerId = await ensurePlatformCustomer({
      clientId: contract.clientId,
      email: contract.client.email,
      name: contract.client.name,
    })
    stripePriceId = await ensureRetainerPrice({
      tier: input.tier,
      amountCents,
      currency: "usd",
    })

    const stripe = getStripeConnect()
    const sub = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: stripePriceId }],
      payment_behavior: "default_incomplete",
      payment_settings: {
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.confirmation_secret"],
      transfer_data: {
        destination: payout.stripeConnectAccountId,
      },
      application_fee_percent: applicationFeePercent,
      metadata: {
        rail: "mes053_retainer",
        continuationContractId: contract.id,
        rootContractId,
        clientId: contract.clientId,
        workerId: contract.workerId,
        tier: input.tier,
      },
    })

    stripeSubscriptionId = sub.id
    status = mapStripeStatus(sub.status)
    const periodEnd = (sub as Stripe.Subscription & { current_period_end?: number })
      .current_period_end
    currentPeriodEnd = periodEnd ? new Date(periodEnd * 1000) : null

    const invoice = sub.latest_invoice
    if (invoice && typeof invoice !== "string") {
      const conf = (
        invoice as Stripe.Invoice & {
          confirmation_secret?: { client_secret?: string } | null
          payment_intent?: string | Stripe.PaymentIntent | null
        }
      ).confirmation_secret
      clientSecret = conf?.client_secret ?? null
      if (!clientSecret) {
        const pi = (
          invoice as Stripe.Invoice & {
            payment_intent?: string | Stripe.PaymentIntent | null
          }
        ).payment_intent
        if (pi && typeof pi !== "string") {
          clientSecret = pi.client_secret
        }
      }
    }
  } else {
    status = "ACTIVE"
  }

  const row = existing
    ? await db().maintenanceSubscription.update({
        where: { id: existing.id },
        data: {
          tier: input.tier,
          amountCents,
          status,
          stripeSubscriptionId,
          stripeCustomerId,
          stripePriceId,
          applicationFeePercent,
          currentPeriodEnd,
          cancelAtPeriodEnd: false,
        },
      })
    : await db().maintenanceSubscription.create({
        data: {
          rootContractId,
          continuationContractId: contract.id,
          clientId: contract.clientId,
          workerId: contract.workerId,
          tier: input.tier,
          amountCents,
          status,
          stripeSubscriptionId,
          stripeCustomerId,
          stripePriceId,
          applicationFeePercent,
          currentPeriodEnd,
        },
      })

  await dispatchNotification({
    channel: "in_app",
    template: "system.info",
    userId: contract.workerId,
    type: "SUCCESS",
    title: "Retainer started",
    body: `Client subscribed to ${plan.label} ($${(amountCents / 100).toFixed(0)}/mo).`,
    link: `/account/work/contracts/${contract.id}`,
    payload: { subscriptionId: row.id },
  }).catch(() => undefined)

  return {
    subscription: mapSub(row),
    clientSecret,
    connectConfigured,
  }
}

export async function cancelMaintenanceRetainer(input: {
  continuationContractId: string
  clientId: string
  immediate?: boolean
}): Promise<MaintenanceSubscriptionRecord> {
  const sub = await db().maintenanceSubscription.findFirst({
    where: {
      continuationContractId: input.continuationContractId,
      clientId: input.clientId,
      status: { in: ["ACTIVE", "TRIALING", "PAST_DUE", "INCOMPLETE"] },
    },
    orderBy: { createdAt: "desc" },
  })
  if (!sub) throw new Error("No active retainer to cancel.")

  if (sub.stripeSubscriptionId && isStripeConnectConfigured()) {
    const stripe = getStripeConnect()
    if (input.immediate) {
      await stripe.subscriptions.cancel(sub.stripeSubscriptionId)
      const updated = await db().maintenanceSubscription.update({
        where: { id: sub.id },
        data: { status: "CANCELLED", cancelAtPeriodEnd: false },
      })
      await notifyRetainerCancelled(updated.workerId, updated.continuationContractId)
      return mapSub(updated)
    }
    const stripeSub = await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: true,
    })
    const periodEnd = (
      stripeSub as Stripe.Subscription & { current_period_end?: number }
    ).current_period_end
    const updated = await db().maintenanceSubscription.update({
      where: { id: sub.id },
      data: {
        cancelAtPeriodEnd: true,
        currentPeriodEnd: periodEnd
          ? new Date(periodEnd * 1000)
          : sub.currentPeriodEnd,
      },
    })
    await notifyRetainerCancelled(
      updated.workerId,
      updated.continuationContractId,
      true,
    )
    return mapSub(updated)
  }

  const updated = await db().maintenanceSubscription.update({
    where: { id: sub.id },
    data: { status: "CANCELLED", cancelAtPeriodEnd: false },
  })
  await notifyRetainerCancelled(updated.workerId, updated.continuationContractId)
  return mapSub(updated)
}

async function notifyRetainerCancelled(
  workerId: string,
  contractId: string,
  atPeriodEnd = false,
) {
  await dispatchNotification({
    channel: "in_app",
    template: "system.info",
    userId: workerId,
    type: "INFO",
    title: atPeriodEnd ? "Retainer ending" : "Retainer cancelled",
    body: atPeriodEnd
      ? "Client scheduled the monthly plan to end at period close."
      : "Client cancelled the monthly maintenance plan.",
    link: `/account/work/contracts/${contractId}`,
    payload: { contractId },
  }).catch(() => undefined)
}

export async function handleMaintenanceRetainerStripeEvent(
  event: Stripe.Event,
): Promise<boolean> {
  if (!isDatabaseConfigured()) return false

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const stripeSub = event.data.object as Stripe.Subscription
    if (stripeSub.metadata?.rail !== "mes053_retainer") {
      // May still match by id if metadata missing
      const byId = await db().maintenanceSubscription.findFirst({
        where: { stripeSubscriptionId: stripeSub.id },
      })
      if (!byId) return false
    }

    const status =
      event.type === "customer.subscription.deleted"
        ? ("CANCELLED" as const)
        : mapStripeStatus(stripeSub.status)

    const row = await db().maintenanceSubscription.findFirst({
      where: {
        OR: [
          { stripeSubscriptionId: stripeSub.id },
          {
            continuationContractId:
              stripeSub.metadata?.continuationContractId ?? "__none__",
          },
        ],
      },
    })
    if (!row) return stripeSub.metadata?.rail === "mes053_retainer"

    await db().maintenanceSubscription.update({
      where: { id: row.id },
      data: {
        status,
        cancelAtPeriodEnd: Boolean(stripeSub.cancel_at_period_end),
        currentPeriodEnd: (() => {
          const end = (
            stripeSub as Stripe.Subscription & { current_period_end?: number }
          ).current_period_end
          return end ? new Date(end * 1000) : null
        })(),
        stripeSubscriptionId: stripeSub.id,
      },
    })

    if (status === "PAST_DUE") {
      await dispatchNotification({
        channel: "in_app",
        template: "system.info",
        userId: row.clientId,
        type: "WARNING",
        title: "Retainer payment past due",
        body: "Update your payment method to keep monthly maintenance active.",
        link: `/account/work/contracts/${row.continuationContractId}`,
        payload: { subscriptionId: row.id },
      }).catch(() => undefined)
      await dispatchNotification({
        channel: "in_app",
        template: "system.info",
        userId: row.workerId,
        type: "WARNING",
        title: "Client retainer past due",
        body: "A maintenance retainer payment failed.",
        link: `/account/work/contracts/${row.continuationContractId}`,
        payload: { subscriptionId: row.id },
      }).catch(() => undefined)
    }
    return true
  }

  if (event.type === "invoice.paid" || event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice & {
      subscription?: string | Stripe.Subscription | null
      parent?: {
        subscription_details?: { subscription?: string } | null
      } | null
    }
    const subRef = invoice.subscription
    const subId =
      typeof subRef === "string"
        ? subRef
        : subRef && typeof subRef === "object"
          ? subRef.id
          : invoice.parent?.subscription_details?.subscription
    if (!subId) return false

    const row = await db().maintenanceSubscription.findFirst({
      where: { stripeSubscriptionId: subId },
    })
    if (!row) {
      return invoice.metadata?.rail === "mes053_retainer"
    }

    if (event.type === "invoice.payment_failed") {
      await db().maintenanceSubscription.update({
        where: { id: row.id },
        data: { status: "PAST_DUE" },
      })
      await dispatchNotification({
        channel: "in_app",
        template: "system.info",
        userId: row.clientId,
        type: "WARNING",
        title: "Retainer invoice failed",
        body: "We could not charge your monthly maintenance plan.",
        link: `/account/work/contracts/${row.continuationContractId}`,
        payload: { subscriptionId: row.id },
      }).catch(() => undefined)
      return true
    }

    const amountCents = invoice.amount_paid ?? row.amountCents
    const platformFeeCents = Math.round(
      (amountCents * row.applicationFeePercent) / 100,
    )
    await db().maintenanceSubscriptionPayment.upsert({
      where: { stripeInvoiceId: invoice.id },
      create: {
        subscriptionId: row.id,
        amountCents,
        platformFeeCents,
        currency: invoice.currency ?? "usd",
        stripeInvoiceId: invoice.id,
        status: "paid",
      },
      update: {
        amountCents,
        platformFeeCents,
        status: "paid",
      },
    })
    if (row.status !== "ACTIVE") {
      await db().maintenanceSubscription.update({
        where: { id: row.id },
        data: { status: "ACTIVE" },
      })
    }
    return true
  }

  return false
}

export async function listPastDueRetainersForAdmin() {
  if (!isDatabaseConfigured()) return []
  return db().maintenanceSubscription.findMany({
    where: { status: "PAST_DUE" },
    orderBy: { updatedAt: "desc" },
    take: 30,
    include: {
      continuationContract: { select: { websiteLabel: true, id: true } },
      client: { select: { name: true, email: true } },
      worker: { select: { name: true, email: true } },
    },
  })
}
