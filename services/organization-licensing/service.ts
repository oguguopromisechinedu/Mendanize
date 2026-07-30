/**
 * Enterprise Organization Licensing — MES-047.
 * Single Stripe Checkout rail with MES-021 (no forked billing stack).
 *
 * Customer association: Stripe Customer belongs to the Organization Owner's
 * PublicUser (same ensureStripeCustomer path as personal MES-021 Subscription).
 * OrganizationSubscription stores the org seat subscription ids on that customer.
 */

import "server-only"

import type Stripe from "stripe"

import {
  assertDatabaseForProductionWrites,
  getPrisma,
  isDatabaseConfigured,
} from "@/lib/db/prisma"
import { StripeError, ValidationError } from "@/lib/api/errors"
import { recordAudit } from "@/services/admin/audit"
import {
  ensureSubscription,
  getAppBaseUrl,
  isStripeConfigured,
} from "@/services/billing"
import { getStripe } from "@/services/billing/stripe"

export type OrganizationPlanRecord = {
  id: string
  key: string
  name: string
  description: string | null
  seatLimit: number
  askVolumeLimit: number | null
  marketplaceJobLimit: number | null
  learningSeatLimit: number | null
  stripePriceId: string | null
  requiresVerification: boolean
  active: boolean
  sortOrder: number
}

export type OrganizationSubscriptionRecord = {
  id: string
  organizationId: string
  planId: string
  planKey: string
  planName: string
  billingOwnerUserId: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  status: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  seatLimit: number
  seatsUsed: number
  seatsAvailable: number
  askVolumeLimit: number | null
  marketplaceJobLimit: number | null
}

export type OrgEntitlements = {
  hasActiveOrgPlan: boolean
  seatLimit: number
  seatsUsed: number
  askVolumeLimit: number | null
  marketplaceJobLimit: number | null
  learningSeatLimit: number | null
  planKey: string | null
  planName: string | null
}

function db() {
  return getPrisma()
}

function mapPlan(row: {
  id: string
  key: string
  name: string
  description: string | null
  seatLimit: number
  askVolumeLimit: number | null
  marketplaceJobLimit: number | null
  learningSeatLimit: number | null
  stripePriceId: string | null
  requiresVerification: boolean
  active: boolean
  sortOrder: number
}): OrganizationPlanRecord {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description,
    seatLimit: row.seatLimit,
    askVolumeLimit: row.askVolumeLimit,
    marketplaceJobLimit: row.marketplaceJobLimit,
    learningSeatLimit: row.learningSeatLimit,
    stripePriceId: row.stripePriceId,
    requiresVerification: row.requiresVerification,
    active: row.active,
    sortOrder: row.sortOrder,
  }
}

function effectiveSeatLimit(
  planSeatLimit: number,
  override: number | null | undefined,
): number {
  if (override != null && override > 0) return override
  return planSeatLimit
}

async function seedDefaultPlansIfEmpty(): Promise<void> {
  const count = await db().organizationPlan.count()
  if (count > 0) return
  await db().organizationPlan.createMany({
    data: [
      {
        key: "team_5",
        name: "Team 5",
        description: "5 learning seats · shared Ask volume · hiring desk",
        seatLimit: 5,
        askVolumeLimit: 500,
        marketplaceJobLimit: 10,
        learningSeatLimit: 5,
        stripePriceId: process.env.STRIPE_PRICE_ORG_TEAM_5?.trim() || null,
        requiresVerification: true,
        sortOrder: 10,
      },
      {
        key: "team_25",
        name: "Team 25",
        description: "25 seats for growing companies",
        seatLimit: 25,
        askVolumeLimit: 2500,
        marketplaceJobLimit: 50,
        learningSeatLimit: 25,
        stripePriceId: process.env.STRIPE_PRICE_ORG_TEAM_25?.trim() || null,
        requiresVerification: true,
        sortOrder: 20,
      },
      {
        key: "team_100",
        name: "Team 100",
        description: "100 seats · higher marketplace posting caps",
        seatLimit: 100,
        askVolumeLimit: 10000,
        marketplaceJobLimit: 200,
        learningSeatLimit: 100,
        stripePriceId: process.env.STRIPE_PRICE_ORG_TEAM_100?.trim() || null,
        requiresVerification: true,
        sortOrder: 30,
      },
    ],
  })
}

export async function listOrganizationPlans(opts?: {
  activeOnly?: boolean
}): Promise<OrganizationPlanRecord[]> {
  if (!isDatabaseConfigured()) return []
  await seedDefaultPlansIfEmpty()
  const rows = await db().organizationPlan.findMany({
    where: opts?.activeOnly ? { active: true } : undefined,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  })
  return rows.map(mapPlan)
}

export async function upsertOrganizationPlan(input: {
  id?: string
  key: string
  name: string
  description?: string | null
  seatLimit: number
  askVolumeLimit?: number | null
  marketplaceJobLimit?: number | null
  learningSeatLimit?: number | null
  stripePriceId?: string | null
  requiresVerification?: boolean
  active?: boolean
  sortOrder?: number
  adminId?: string | null
  adminEmail?: string | null
}): Promise<OrganizationPlanRecord> {
  assertDatabaseForProductionWrites("services/organization-licensing")
  const key = input.key.trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_")
  if (!key) throw new ValidationError("Plan key is required.")
  if (input.seatLimit < 1 || input.seatLimit > 10_000) {
    throw new ValidationError("Seat limit must be 1–10000.")
  }

  const data = {
    key,
    name: input.name.trim(),
    description: input.description?.trim() || null,
    seatLimit: input.seatLimit,
    askVolumeLimit: input.askVolumeLimit ?? null,
    marketplaceJobLimit: input.marketplaceJobLimit ?? null,
    learningSeatLimit: input.learningSeatLimit ?? input.seatLimit,
    stripePriceId: input.stripePriceId?.trim() || null,
    requiresVerification: input.requiresVerification ?? true,
    active: input.active ?? true,
    sortOrder: input.sortOrder ?? 0,
    managedByAdminId: input.adminId ?? null,
  }

  const row = input.id
    ? await db().organizationPlan.update({ where: { id: input.id }, data })
    : await db().organizationPlan.upsert({
        where: { key },
        create: data,
        update: data,
      })

  await recordAudit({
    actorId: input.adminId,
    actorEmail: input.adminEmail,
    action: input.id ? "update" : "upsert",
    entityType: "organization_plan",
    entityId: row.id,
    summary: `Org plan ${row.key} (${row.seatLimit} seats)`,
  })
  return mapPlan(row)
}

async function ensureOwnerStripeCustomer(
  ownerUserId: string,
  email: string,
): Promise<string> {
  const personal = await ensureSubscription(ownerUserId)
  if (personal.stripeCustomerId) return personal.stripeCustomerId

  if (!isStripeConfigured()) {
    throw new StripeError("Stripe is not configured.")
  }
  const stripe = getStripe()
  const customer = await stripe.customers.create({
    email,
    metadata: { publicUserId: ownerUserId, kind: "organization_owner" },
  })
  await db().subscription.update({
    where: { publicUserId: ownerUserId },
    data: { stripeCustomerId: customer.id },
  })
  return customer.id
}

export async function getOrganizationSubscription(
  organizationId: string,
): Promise<OrganizationSubscriptionRecord | null> {
  if (!isDatabaseConfigured()) return null
  const row = await db().organizationSubscription.findUnique({
    where: { organizationId },
    include: { plan: true },
  })
  if (!row) return null
  const seatsUsed = await db().organizationMember.count({
    where: { organizationId },
  })
  const seatLimit = effectiveSeatLimit(row.plan.seatLimit, row.seatLimitOverride)
  const active =
    row.status === "active" || row.status === "trialing" || row.status === "past_due"
  return {
    id: row.id,
    organizationId: row.organizationId,
    planId: row.planId,
    planKey: row.plan.key,
    planName: row.plan.name,
    billingOwnerUserId: row.billingOwnerUserId,
    stripeCustomerId: row.stripeCustomerId,
    stripeSubscriptionId: row.stripeSubscriptionId,
    status: row.status,
    currentPeriodEnd: row.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: row.cancelAtPeriodEnd,
    seatLimit: active ? seatLimit : 0,
    seatsUsed,
    seatsAvailable: active ? Math.max(0, seatLimit - seatsUsed) : 0,
    askVolumeLimit: active ? row.plan.askVolumeLimit : null,
    marketplaceJobLimit: active ? row.plan.marketplaceJobLimit : null,
  }
}

export async function getOrgEntitlements(
  organizationId: string,
): Promise<OrgEntitlements> {
  const sub = await getOrganizationSubscription(organizationId)
  if (!sub || (sub.status !== "active" && sub.status !== "trialing")) {
    const seatsUsed = isDatabaseConfigured()
      ? await db().organizationMember.count({ where: { organizationId } })
      : 0
    return {
      hasActiveOrgPlan: false,
      seatLimit: 0,
      seatsUsed,
      askVolumeLimit: null,
      marketplaceJobLimit: null,
      learningSeatLimit: null,
      planKey: null,
      planName: null,
    }
  }
  return {
    hasActiveOrgPlan: true,
    seatLimit: sub.seatLimit,
    seatsUsed: sub.seatsUsed,
    askVolumeLimit: sub.askVolumeLimit,
    marketplaceJobLimit: sub.marketplaceJobLimit,
    learningSeatLimit: sub.seatLimit,
    planKey: sub.planKey,
    planName: sub.planName,
  }
}

/** Enforce seat capacity before adding a member (MES-047). */
export async function assertSeatAvailable(
  organizationId: string,
): Promise<void> {
  if (!isDatabaseConfigured()) return
  const entitlements = await getOrgEntitlements(organizationId)
  // Without an active paid plan, allow org bootstrap (owner + small team) up to 2
  // so companies can form before purchase; paid plans enforce catalog limits.
  const limit = entitlements.hasActiveOrgPlan ? entitlements.seatLimit : 2
  if (entitlements.seatsUsed >= limit) {
    throw new ValidationError(
      entitlements.hasActiveOrgPlan
        ? `Seat limit reached (${limit}). Upgrade the company plan or remove a member.`
        : "Free company seat limit reached (2). Purchase a team plan to add more members.",
    )
  }
}

export async function createOrganizationCheckoutSession(input: {
  organizationId: string
  planId: string
  actorUserId: string
  actorEmail: string
}): Promise<{ url: string }> {
  if (!isStripeConfigured()) {
    throw new StripeError("Stripe is not configured. Set STRIPE_SECRET_KEY.")
  }
  assertDatabaseForProductionWrites("services/organization-licensing")

  const org = await db().organization.findUnique({
    where: { id: input.organizationId },
    include: {
      members: { where: { publicUserId: input.actorUserId } },
    },
  })
  if (!org) throw new ValidationError("Organization not found.")
  const membership = org.members[0]
  if (
    !membership ||
    (membership.role !== "OWNER" && membership.role !== "ADMIN")
  ) {
    throw new ValidationError("Only company Owner/Admin can purchase seats.")
  }
  // Billing identity is always the org Owner (documented association)
  if (org.ownerPublicUserId !== input.actorUserId && membership.role === "ADMIN") {
    // Admin may initiate checkout, but Stripe customer is still the Owner
  }

  const plan = await db().organizationPlan.findUnique({
    where: { id: input.planId },
  })
  if (!plan || !plan.active) {
    throw new ValidationError("Plan not available.")
  }
  if (!plan.stripePriceId) {
    throw new ValidationError(
      `Plan ${plan.key} has no Stripe price. Set stripePriceId (e.g. STRIPE_PRICE_ORG_TEAM_5).`,
    )
  }
  if (plan.requiresVerification && org.verificationStatus !== "VERIFIED") {
    throw new ValidationError(
      "Company must be verified before purchasing this plan.",
    )
  }

  const memberCount = await db().organizationMember.count({
    where: { organizationId: org.id },
  })
  if (memberCount > plan.seatLimit) {
    throw new ValidationError(
      `Current team (${memberCount}) exceeds this plan’s ${plan.seatLimit} seats. Remove members or choose a larger plan.`,
    )
  }

  const owner = await db().publicUser.findUnique({
    where: { id: org.ownerPublicUserId },
    select: { id: true, email: true },
  })
  if (!owner?.email) throw new ValidationError("Organization owner email missing.")

  const customerId = await ensureOwnerStripeCustomer(owner.id, owner.email)
  const base = getAppBaseUrl()
  const stripe = getStripe()

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    success_url: `${base}/account/company/billing?checkout=success`,
    cancel_url: `${base}/account/company/billing?checkout=canceled`,
    client_reference_id: org.id,
    metadata: {
      kind: "organization",
      organizationId: org.id,
      organizationPlanId: plan.id,
      billingOwnerUserId: owner.id,
      publicUserId: owner.id,
    },
    subscription_data: {
      metadata: {
        kind: "organization",
        organizationId: org.id,
        organizationPlanId: plan.id,
        billingOwnerUserId: owner.id,
        publicUserId: owner.id,
      },
    },
    allow_promotion_codes: true,
  })

  if (!session.url) {
    throw new StripeError("Stripe Checkout session did not return a URL.")
  }
  return { url: session.url }
}

export async function createOrganizationPortalSession(input: {
  organizationId: string
  actorUserId: string
}): Promise<{ url: string }> {
  if (!isStripeConfigured()) {
    throw new StripeError("Stripe is not configured.")
  }
  const org = await db().organization.findUnique({
    where: { id: input.organizationId },
    include: {
      members: { where: { publicUserId: input.actorUserId } },
      subscription: true,
    },
  })
  if (!org) throw new ValidationError("Organization not found.")
  const membership = org.members[0]
  if (
    !membership ||
    (membership.role !== "OWNER" && membership.role !== "ADMIN")
  ) {
    throw new ValidationError("Only Owner/Admin can manage billing.")
  }
  const customerId =
    org.subscription?.stripeCustomerId ||
    (await ensureSubscription(org.ownerPublicUserId)).stripeCustomerId
  if (!customerId) {
    throw new ValidationError("No Stripe customer yet. Purchase a plan first.")
  }
  const stripe = getStripe()
  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${getAppBaseUrl()}/account/company/billing`,
  })
  return { url: portal.url }
}

function periodEndFromSubscription(sub: Stripe.Subscription): Date | null {
  const end =
    (sub as Stripe.Subscription & { current_period_end?: number })
      .current_period_end ?? null
  return end ? new Date(end * 1000) : null
}

export async function syncOrganizationSubscriptionFromStripe(
  stripeSub: Stripe.Subscription,
): Promise<void> {
  if (!isDatabaseConfigured()) return
  if (stripeSub.metadata?.kind !== "organization") return

  const organizationId = stripeSub.metadata.organizationId
  const planId = stripeSub.metadata.organizationPlanId
  const billingOwnerUserId =
    stripeSub.metadata.billingOwnerUserId ||
    stripeSub.metadata.publicUserId
  if (!organizationId || !planId || !billingOwnerUserId) return

  const plan = await db().organizationPlan.findUnique({ where: { id: planId } })
  if (!plan) return

  const status =
    stripeSub.status === "canceled"
      ? "canceled"
      : stripeSub.status === "past_due"
        ? "past_due"
        : stripeSub.status === "active" || stripeSub.status === "trialing"
          ? "active"
          : stripeSub.status

  const priceId = stripeSub.items.data[0]?.price?.id ?? null

  await db().organizationSubscription.upsert({
    where: { organizationId },
    create: {
      organizationId,
      planId,
      billingOwnerUserId,
      stripeCustomerId: String(stripeSub.customer),
      stripeSubscriptionId: stripeSub.id,
      stripePriceId: priceId,
      status: status === "canceled" ? "inactive" : status,
      currentPeriodEnd: periodEndFromSubscription(stripeSub),
      cancelAtPeriodEnd: Boolean(stripeSub.cancel_at_period_end),
    },
    update: {
      planId,
      billingOwnerUserId,
      stripeCustomerId: String(stripeSub.customer),
      stripeSubscriptionId: stripeSub.id,
      stripePriceId: priceId,
      status: status === "canceled" ? "inactive" : status,
      currentPeriodEnd: periodEndFromSubscription(stripeSub),
      cancelAtPeriodEnd: Boolean(stripeSub.cancel_at_period_end),
    },
  })
}

export async function adminAdjustOrgSeats(input: {
  organizationId: string
  seatLimitOverride: number | null
  adminId: string
  adminEmail?: string | null
}): Promise<void> {
  assertDatabaseForProductionWrites("services/organization-licensing")
  if (
    input.seatLimitOverride != null &&
    (input.seatLimitOverride < 1 || input.seatLimitOverride > 10_000)
  ) {
    throw new ValidationError("Override must be 1–10000 or cleared.")
  }
  const existing = await db().organizationSubscription.findUnique({
    where: { organizationId: input.organizationId },
  })
  if (!existing) {
    throw new ValidationError("Organization has no subscription to adjust.")
  }
  await db().organizationSubscription.update({
    where: { organizationId: input.organizationId },
    data: { seatLimitOverride: input.seatLimitOverride },
  })
  await recordAudit({
    actorId: input.adminId,
    actorEmail: input.adminEmail,
    action: "adjust_seats",
    entityType: "organization_subscription",
    entityId: existing.id,
    summary: `Seat override → ${input.seatLimitOverride ?? "plan default"}`,
    metadata: { organizationId: input.organizationId },
  })
}

export async function listOrganizationSubscriptionsAdmin(): Promise<
  Array<{
    id: string
    organizationId: string
    organizationName: string
    planName: string
    status: string
    seatLimit: number
    seatsUsed: number
    seatLimitOverride: number | null
    billingOwnerUserId: string
    stripeSubscriptionId: string | null
    updatedAt: string
  }>
> {
  if (!isDatabaseConfigured()) return []
  const rows = await db().organizationSubscription.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      organization: {
        select: {
          name: true,
          _count: { select: { members: true } },
        },
      },
      plan: true,
    },
  })
  return rows.map((r) => ({
    id: r.id,
    organizationId: r.organizationId,
    organizationName: r.organization.name,
    planName: r.plan.name,
    status: r.status,
    seatLimit: effectiveSeatLimit(r.plan.seatLimit, r.seatLimitOverride),
    seatsUsed: r.organization._count.members,
    seatLimitOverride: r.seatLimitOverride,
    billingOwnerUserId: r.billingOwnerUserId,
    stripeSubscriptionId: r.stripeSubscriptionId,
    updatedAt: r.updatedAt.toISOString(),
  }))
}

/** Resolve org Ask/marketplace caps for a member (server-side entitlement). */
export async function getEntitlementsForPublicUser(
  publicUserId: string,
): Promise<OrgEntitlements | null> {
  if (!isDatabaseConfigured()) return null
  const membership = await db().organizationMember.findFirst({
    where: { publicUserId },
    orderBy: { createdAt: "asc" },
  })
  if (!membership) return null
  return getOrgEntitlements(membership.organizationId)
}
