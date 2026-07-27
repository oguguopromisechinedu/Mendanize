import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { FounderSchemaBanner } from "@/features/admin-dashboard/components/founder-schema-banner"
import { requireSuperAdministrator } from "@/features/authentication/server"
import {
  computeValuationAction,
  generateInsightsAction,
} from "@/features/growth"
import { loadFounderDashboardPayload } from "@/services/valuation"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Business Intelligence",
  robots: { index: false },
}

export default async function Page() {
  const session = await requireSuperAdministrator()
  if (!session?.admin?.id) redirect("/dashboard/login")

  const { metrics, latest, history, insightText, schemaReady, schemaMessage } =
    await loadFounderDashboardPayload()

  const metricCards = [
    { label: "Total users", value: metrics.totalUsers },
    { label: "Active (30d)", value: metrics.activeUsers30d },
    { label: "Premium subscribers", value: metrics.premiumSubscribers },
    { label: "Guide starts", value: metrics.guideStarts },
    { label: "Certificates", value: metrics.certificatesIssued },
    { label: "Published articles", value: metrics.publishedArticles },
    { label: "Marketplace listings", value: metrics.marketplaceListings },
    { label: "Marketplace purchases", value: metrics.marketplacePurchases },
    { label: "Creators", value: metrics.creators },
    { label: "Job postings", value: metrics.jobPostings },
    { label: "Contracts completed", value: metrics.contractsCompleted },
    { label: "Clients", value: metrics.clients },
    { label: "MRR estimate", value: `$${metrics.mrrEstimate}` },
    { label: "ARR estimate", value: `$${metrics.arrEstimate}` },
    { label: "Page views (30d)", value: metrics.pageViews30d },
    { label: "Search events (30d)", value: metrics.searchEvents30d },
  ]

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Super Administrator · Business Intelligence
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Founder dashboard
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Internal heuristic estimate only — not an accounting valuation.
          Platform numbers are live reads from billing, analytics, and
          marketplace services.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/dashboard/bi/valuation">Company valuation</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/dashboard/bi/investor">Investor view</Link>
          </Button>
        </div>
      </div>

      {!schemaReady && schemaMessage ? (
        <FounderSchemaBanner message={schemaMessage} />
      ) : null}

      <section className="rounded-2xl border border-border/60 bg-gradient-to-br from-zinc-950 to-zinc-900 px-6 py-8 text-zinc-50">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">
          Estimated value · confidence {latest?.confidenceLevel ?? "—"}
        </p>
        <p className="mt-3 font-[family-name:var(--font-display)] text-5xl font-semibold tabular-nums">
          {latest
            ? `$${Math.round(latest.estimatedValue).toLocaleString()}`
            : "—"}
        </p>
        <p className="mt-2 text-sm text-zinc-400">
          {latest?.growthPercent != null
            ? `${latest.growthPercent >= 0 ? "+" : ""}${latest.growthPercent.toFixed(1)}% vs prior`
            : "No prior snapshot"}
          {latest
            ? ` · Updated ${new Date(latest.computedAt).toLocaleString()}`
            : ""}
        </p>
        <p className="mt-4 max-w-xl text-xs text-amber-200/90">
          {latest?.notes ??
            (schemaReady
              ? "Run a calculation to store a factor-separated historical snapshot."
              : "Valuation snapshots require the MES-037 migration before they can be stored.")}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <form action={computeValuationAction}>
            <Button
              type="submit"
              className="rounded-xl bg-[var(--brand-amber,#E8940C)] text-zinc-950 hover:bg-amber-400"
              disabled={!schemaReady}
            >
              Recalculate valuation
            </Button>
          </form>
          <form action={generateInsightsAction}>
            <Button
              type="submit"
              variant="outline"
              className="rounded-xl border-zinc-600 bg-transparent text-zinc-100"
            >
              Generate AI insights
            </Button>
          </form>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium">Platform metrics (aggregated reads)</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metricCards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-border/60 px-4 py-3"
            >
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums">{card.value}</p>
            </div>
          ))}
        </div>
      </section>

      {insightText ? (
        <section className="space-y-2">
          <h2 className="text-lg font-medium">Growth insights</h2>
          <pre className="whitespace-pre-wrap rounded-xl border border-border/60 bg-muted/30 p-4 text-sm">
            {insightText}
          </pre>
        </section>
      ) : null}

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Valuation history</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {history.length === 0 ? (
            <li>
              {schemaReady
                ? "No snapshots yet."
                : "No snapshots — valuation tables are not migrated yet."}
            </li>
          ) : (
            history.map((h) => (
              <li key={h.id}>
                {new Date(h.computedAt).toLocaleString()} · $
                {Math.round(h.estimatedValue).toLocaleString()} ·{" "}
                {h.confidenceLevel}
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  )
}
