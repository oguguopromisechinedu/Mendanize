"use client";

import { useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { AdminPageHeader, AdminPanel, StatusBadge } from "@/features/admin-dashboard";
import { Button } from "@/components/ui/button";
import type { BillingDashboard } from "@/services/billing";
import {
  openBillingPortalAction,
  startCheckoutAction,
} from "../actions/actions";
import { PAID_PLAN_OPTIONS } from "../constants/constants";

function formatMoney(amountCents: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amountCents / 100);
  } catch {
    return `${(amountCents / 100).toFixed(2)} ${currency}`;
  }
}

export function BillingDashboardView({
  data,
}: {
  data: BillingDashboard;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const { subscription: sub } = data;

  useEffect(() => {
    const checkout = params.get("checkout");
    if (checkout === "success") toast.success("Checkout completed — syncing plan.");
    if (checkout === "canceled") toast.message("Checkout canceled.");
  }, [params]);

  function runCheckout(planId: "professional" | "enterprise") {
    startTransition(async () => {
      const res = await startCheckoutAction({ planId });
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      if (res.url) {
        window.location.href = res.url;
        return;
      }
      toast.success(res.message);
      router.refresh();
    });
  }

  function runPortal() {
    startTransition(async () => {
      const res = await openBillingPortalAction();
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      if (res.url) {
        window.location.href = res.url;
        return;
      }
      toast.success(res.message);
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Billing"
        description="Manage your Mendanize subscription. Articles and guides stay free for everyone."
        actions={
          <Button asChild size="sm" variant="outline">
            <Link href="/pricing">View pricing</Link>
          </Button>
        }
      />

      {!data.stripeConfigured ? (
        <AdminPanel title="Stripe">
          <p className="text-sm text-muted-foreground">
            Stripe keys are not configured. Local subscription remains{" "}
            <strong>Starter</strong>. Set{" "}
            <code className="text-xs">STRIPE_SECRET_KEY</code>, price IDs, and
            webhook secret to enable Checkout.
          </p>
        </AdminPanel>
      ) : null}

      <AdminPanel title="Current plan">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-lg font-semibold text-foreground">{data.planName}</p>
          <StatusBadge status={sub.status} />
          {sub.cancelAtPeriodEnd ? (
            <span className="text-xs text-amber-700 dark:text-amber-400">
              Cancels at period end
            </span>
          ) : null}
        </div>
        <dl className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide">Period ends</dt>
            <dd className="text-foreground">
              {sub.currentPeriodEnd
                ? new Date(sub.currentPeriodEnd).toLocaleString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide">Stripe customer</dt>
            <dd className="truncate font-mono text-xs text-foreground">
              {sub.stripeCustomerId ?? "—"}
            </dd>
          </div>
        </dl>
      </AdminPanel>

      <AdminPanel
        title="Payment method"
        action={
          data.canManage ? (
            <Button size="sm" variant="outline" disabled={pending} onClick={runPortal}>
              Manage in Stripe
            </Button>
          ) : null
        }
      >
        {data.paymentMethod ? (
          <p className="text-sm text-foreground">
            {data.paymentMethod.brand?.toUpperCase()} ····{" "}
            {data.paymentMethod.last4}
            {data.paymentMethod.expMonth && data.paymentMethod.expYear
              ? ` · exp ${data.paymentMethod.expMonth}/${data.paymentMethod.expYear}`
              : ""}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            No card on file. Upgrade a plan or open the Customer Portal after
            Checkout.
          </p>
        )}
      </AdminPanel>

      <AdminPanel title="Change plan">
        <p className="mb-4 text-sm text-muted-foreground">
          Paid tiers use Stripe Checkout. Cancel or switch plans via the Customer
          Portal.
        </p>
        <div className="flex flex-wrap gap-2">
          {PAID_PLAN_OPTIONS.map((opt) => (
            <Button
              key={opt.id}
              size="sm"
              variant={opt.id === "professional" ? "default" : "outline"}
              disabled={pending || !data.stripeConfigured}
              onClick={() => runCheckout(opt.id)}
            >
              Upgrade to {opt.label}
            </Button>
          ))}
          <Button
            size="sm"
            variant="ghost"
            disabled={pending || !data.canManage}
            onClick={runPortal}
          >
            Cancel / change via portal
          </Button>
        </div>
      </AdminPanel>

      <AdminPanel title="Invoice history">
        {data.invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground">No invoices yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {data.invoices.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {inv.number ?? inv.id}
                  </p>
                  <p className="text-muted-foreground">
                    {new Date(inv.created).toLocaleDateString()} ·{" "}
                    {inv.status ?? "unknown"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span>{formatMoney(inv.amountDue, inv.currency)}</span>
                  {inv.hostedInvoiceUrl ? (
                    <a
                      className="text-primary underline-offset-2 hover:underline"
                      href={inv.hostedInvoiceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>
    </div>
  );
}
