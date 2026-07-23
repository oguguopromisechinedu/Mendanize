import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { requirePermission } from "@/features/authentication/server";
import { PERMISSIONS } from "@/features/authentication/roles";
import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Billing overview",
  robots: { index: false },
};

/**
 * Admin read-only revenue overview (MES-021 / MES-030).
 * Never exposes individual payment method details.
 */
export default async function BillingOverviewPage() {
  const session = await requirePermission(PERMISSIONS.BILLING_VIEW);
  if (!session?.admin?.id) {
    redirect("/dashboard/login");
  }

  let totals = {
    subscriptions: 0,
    free: 0,
    pro: 0,
    team: 0,
    active: 0,
    pastDue: 0,
    canceled: 0,
  };

  if (isDatabaseConfigured()) {
    const prisma = getPrisma();
    const [all, free, pro, team, active, pastDue, canceled] =
      await Promise.all([
        prisma.subscription.count(),
        prisma.subscription.count({ where: { plan: "FREE" } }),
        prisma.subscription.count({ where: { plan: "PRO" } }),
        prisma.subscription.count({ where: { plan: "TEAM" } }),
        prisma.subscription.count({ where: { status: "active" } }),
        prisma.subscription.count({ where: { status: "past_due" } }),
        prisma.subscription.count({ where: { status: "canceled" } }),
      ]);
    totals = {
      subscriptions: all,
      free,
      pro,
      team,
      active,
      pastDue,
      canceled,
    };
  }

  const cards = [
    { label: "Total subscriptions", value: totals.subscriptions },
    { label: "Active", value: totals.active },
    { label: "Past due", value: totals.pastDue },
    { label: "Canceled", value: totals.canceled },
    { label: "Free tier", value: totals.free },
    { label: "Pro tier", value: totals.pro },
    { label: "Team tier", value: totals.team },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Billing overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aggregate subscription metrics only. Individual learner payment
          details stay in each PublicUser&apos;s /account/billing session.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-card p-5"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
