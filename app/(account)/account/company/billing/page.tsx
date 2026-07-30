import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { requirePublicUser } from "@/features/authentication/server"
import {
  openOrgBillingPortalAction,
  startOrgPlanCheckoutAction,
} from "@/features/organization-licensing/actions"
import { getOrganizationForUser } from "@/services/organization"
import {
  getOrganizationSubscription,
  listOrganizationPlans,
} from "@/services/organization-licensing"
import { isStripeConfigured } from "@/services/billing"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Company billing",
  robots: { index: false },
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>
}) {
  const session = await requirePublicUser()
  if (!session?.user?.id) {
    redirect(
      `/sign-in?callbackUrl=${encodeURIComponent("/account/company/billing")}`,
    )
  }

  const org = await getOrganizationForUser(session.user.id)
  if (!org) {
    redirect("/account/company")
  }

  const [plans, subscription, params] = await Promise.all([
    listOrganizationPlans({ activeOnly: true }),
    getOrganizationSubscription(org.id),
    searchParams,
  ])

  const stripeOk = isStripeConfigured()

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-8">
      <div>
        <p className="text-sm text-muted-foreground">
          <Link href="/account/company" className="underline-offset-4 hover:underline">
            ← Company
          </Link>
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold">
          Company billing
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Seat plans for <strong>{org.name}</strong> use the same Stripe Checkout
          rail as personal billing (MES-021). The Stripe customer is the company
          owner’s billing identity — this never opens the Admin dashboard.
        </p>
        {params.checkout === "success" ? (
          <p className="mt-3 text-sm text-emerald-600">Checkout complete — seats sync shortly via webhook.</p>
        ) : null}
        {params.checkout === "canceled" ? (
          <p className="mt-3 text-sm text-muted-foreground">Checkout canceled.</p>
        ) : null}
      </div>

      <section className="space-y-3 rounded-xl border border-border p-5">
        <h2 className="text-lg font-medium">Current plan</h2>
        {subscription &&
        (subscription.status === "active" ||
          subscription.status === "trialing" ||
          subscription.status === "past_due") ? (
          <>
            <p className="text-sm">
              {subscription.planName} · {subscription.status}
            </p>
            <p className="text-sm text-muted-foreground">
              Seats {subscription.seatsUsed} / {subscription.seatLimit}
              {subscription.cancelAtPeriodEnd ? " · cancels at period end" : ""}
            </p>
            <form action={openOrgBillingPortalAction}>
              <input type="hidden" name="organizationId" value={org.id} />
              <Button
                type="submit"
                variant="outline"
                className="rounded-xl"
                disabled={!stripeOk}
              >
                Manage in Stripe portal
              </Button>
            </form>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            No active seat plan. Free companies can have up to 2 members until you
            subscribe.
          </p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Available plans</h2>
        {!stripeOk ? (
          <p className="text-sm text-muted-foreground">
            Stripe is not configured in this environment.
          </p>
        ) : null}
        <ul className="space-y-3">
          {plans.map((plan) => (
            <li
              key={plan.id}
              className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{plan.name}</p>
                <p className="text-xs text-muted-foreground">
                  {plan.seatLimit} seats
                  {plan.askVolumeLimit != null
                    ? ` · Ask cap ${plan.askVolumeLimit}`
                    : ""}
                  {plan.marketplaceJobLimit != null
                    ? ` · ${plan.marketplaceJobLimit} job posts`
                    : ""}
                  {plan.requiresVerification ? " · requires verification" : ""}
                </p>
                {plan.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                ) : null}
                {!plan.stripePriceId ? (
                  <p className="mt-1 text-xs text-amber-600">
                    No Stripe price configured for this plan yet.
                  </p>
                ) : null}
              </div>
              <form action={startOrgPlanCheckoutAction}>
                <input type="hidden" name="organizationId" value={org.id} />
                <input type="hidden" name="planId" value={plan.id} />
                <Button
                  type="submit"
                  className="rounded-xl"
                  disabled={!stripeOk || !plan.stripePriceId}
                >
                  {subscription?.planId === plan.id ? "Current / change" : "Subscribe"}
                </Button>
              </form>
            </li>
          ))}
        </ul>
        {org.verificationStatus !== "VERIFIED" ? (
          <p className="text-xs text-muted-foreground">
            Status: {org.verificationStatus}. Most plans require verification
            before checkout.
          </p>
        ) : null}
      </section>
    </div>
  )
}
