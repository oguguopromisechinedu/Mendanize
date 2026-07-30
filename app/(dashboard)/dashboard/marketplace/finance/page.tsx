import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { requireSuperAdministrator } from "@/features/authentication/server"
import { adminUpsertCommissionRuleAction } from "@/features/growth"
import { getMarketplaceFinanceOverview } from "@/services/marketplace"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Marketplace Finance",
  robots: { index: false },
}

function money(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export default async function Page() {
  const session = await requireSuperAdministrator()
  if (!session?.admin?.id) redirect("/dashboard/login")

  const overview = await getMarketplaceFinanceOverview()

  const cards = [
    { label: "AI Tools gross sales", value: money(overview.toolsGrossCents) },
    {
      label: "AI Tools platform fees",
      value: money(overview.toolsPlatformFeeCents),
    },
    { label: "Tool purchases", value: String(overview.toolsPurchaseCount) },
    { label: "Work gross funded", value: money(overview.workGrossCents) },
    {
      label: "Work platform fees",
      value: money(overview.workPlatformFeeCents),
    },
    { label: "Pending escrow", value: money(overview.pendingEscrowCents) },
    { label: "Active licenses", value: String(overview.activeLicenses) },
    {
      label: "Active MES-021 subscriptions",
      value: String(overview.subscriptionActive),
    },
    {
      label: "Retainer gross (Connect)",
      value: money(overview.retainerGrossCents),
    },
    {
      label: "Retainer platform fees",
      value: money(overview.retainerPlatformFeeCents),
    },
    {
      label: "Active retainers",
      value: String(overview.retainerActiveCount),
    },
    {
      label: "Past-due retainers",
      value: String(overview.retainerPastDueCount),
    },
  ]

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Marketplace Finance
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Super Admin control for marketplace commissions, escrow totals, and
          license inventory. Connect fees stay on the MES-039 rail — this page
          configures business rules and aggregates reads (no second analytics
          stack).
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/dashboard/marketplace">Marketplace moderation</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/dashboard/billing-overview">Billing overview</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/dashboard/bi">Founder BI</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border/60 px-4 py-3"
          >
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Commission rules</h2>
        <p className="text-sm text-muted-foreground">
          Fee is in basis points (1500 = 15%). Changes apply to new purchases
          and newly funded milestones immediately.
        </p>
        <div className="space-y-4">
          {overview.commissionRules.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No rules in database yet. Apply the MES-052 migration to seed
              defaults, or create one below. Until then, env{" "}
              <code className="text-xs">STRIPE_CONNECT_PLATFORM_FEE_BPS</code>{" "}
              is used.
            </p>
          ) : (
            overview.commissionRules.map((rule) => (
              <form
                key={rule.id}
                action={adminUpsertCommissionRuleAction}
                className="grid gap-2 rounded-xl border border-border/50 p-4 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] sm:items-end"
              >
                <input type="hidden" name="scope" value={rule.scope} />
                <input type="hidden" name="sellerTier" value={rule.sellerTier} />
                <div>
                  <p className="text-xs text-muted-foreground">Scope</p>
                  <p className="text-sm font-medium">{rule.scope}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Seller tier</p>
                  <p className="text-sm font-medium">{rule.sellerTier}</p>
                </div>
                <label className="text-xs text-muted-foreground">
                  Fee (bps)
                  <input
                    name="feeBps"
                    type="number"
                    min={0}
                    max={5000}
                    defaultValue={rule.feeBps}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs text-muted-foreground">
                  Label
                  <input
                    name="label"
                    defaultValue={rule.label ?? ""}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      name="active"
                      value="1"
                      defaultChecked={rule.active}
                    />
                    Active
                  </label>
                  <Button type="submit" size="sm" className="rounded-xl">
                    Save
                  </Button>
                </div>
              </form>
            ))
          )}
        </div>

        <form
          action={adminUpsertCommissionRuleAction}
          className="grid gap-2 rounded-xl border border-dashed border-border/60 p-4 sm:grid-cols-5 sm:items-end"
        >
          <h3 className="sm:col-span-5 text-sm font-medium">
            Create / overwrite rule
          </h3>
          <label className="text-xs text-muted-foreground">
            Scope
            <select
              name="scope"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              defaultValue="TOOLS"
            >
              <option value="TOOLS">TOOLS</option>
              <option value="WORK">WORK</option>
            </select>
          </label>
          <label className="text-xs text-muted-foreground">
            Seller tier
            <select
              name="sellerTier"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              defaultValue="STANDARD"
            >
              <option value="STANDARD">STANDARD</option>
              <option value="PRO">PRO</option>
              <option value="ENTERPRISE">ENTERPRISE</option>
            </select>
          </label>
          <label className="text-xs text-muted-foreground">
            Fee (bps)
            <input
              name="feeBps"
              type="number"
              min={0}
              max={5000}
              defaultValue={1500}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs text-muted-foreground">
            Label
            <input
              name="label"
              placeholder="Optional label"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <Button type="submit" className="rounded-xl">
            Upsert rule
          </Button>
          <input type="hidden" name="active" value="1" />
        </form>
      </section>
    </div>
  )
}
