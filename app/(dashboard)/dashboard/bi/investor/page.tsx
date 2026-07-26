import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { requireSuperAdministrator } from "@/features/authentication/server"
import {
  collectPlatformMetrics,
  getLatestValuation,
} from "@/services/valuation"

export const metadata: Metadata = {
  title: "Investor view",
  robots: { index: false },
}

export default async function Page() {
  const session = await requireSuperAdministrator()
  if (!session?.admin?.id) redirect("/dashboard/login")

  const [metrics, latest] = await Promise.all([
    collectPlatformMetrics(),
    getLatestValuation(),
  ])

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/bi"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Business Intelligence
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          Investor view
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Curated summary over existing platform data. PDF export is future
          work.
        </p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border/60 px-4 py-3">
          <dt className="text-xs text-muted-foreground">Estimated worth</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums">
            {latest
              ? `$${Math.round(latest.estimatedValue).toLocaleString()}`
              : "—"}
          </dd>
        </div>
        <div className="rounded-xl border border-border/60 px-4 py-3">
          <dt className="text-xs text-muted-foreground">ARR proxy</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums">
            ${metrics.arrEstimate.toLocaleString()}
          </dd>
        </div>
        <div className="rounded-xl border border-border/60 px-4 py-3">
          <dt className="text-xs text-muted-foreground">Users</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums">
            {metrics.totalUsers}
          </dd>
        </div>
        <div className="rounded-xl border border-border/60 px-4 py-3">
          <dt className="text-xs text-muted-foreground">Premium subscribers</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums">
            {metrics.premiumSubscribers}
          </dd>
        </div>
        <div className="rounded-xl border border-border/60 px-4 py-3">
          <dt className="text-xs text-muted-foreground">Marketplace GMV proxy</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums">
            {metrics.marketplacePurchases} purchases ·{" "}
            {metrics.contractsCompleted} contracts
          </dd>
        </div>
        <div className="rounded-xl border border-border/60 px-4 py-3">
          <dt className="text-xs text-muted-foreground">Confidence</dt>
          <dd className="mt-1 text-2xl font-semibold">
            {latest?.confidenceLevel ?? "—"}
          </dd>
        </div>
      </dl>
    </div>
  )
}
