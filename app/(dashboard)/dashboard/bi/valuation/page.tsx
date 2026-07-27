import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { FounderSchemaBanner } from "@/features/admin-dashboard/components/founder-schema-banner"
import { requireSuperAdministrator } from "@/features/authentication/server"
import { computeValuationAction } from "@/features/growth"
import {
  getLatestValuation,
  listValuationHistory,
  probeFounderDashboardSchema,
} from "@/services/valuation"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Company valuation",
  robots: { index: false },
}

export default async function Page() {
  const session = await requireSuperAdministrator()
  if (!session?.admin?.id) redirect("/dashboard/login")

  const [{ schemaReady, schemaMessage }, latest, history] = await Promise.all([
    probeFounderDashboardSchema(),
    getLatestValuation(),
    listValuationHistory(50),
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
          Company valuation
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Heuristic estimate with stored factors. Not audited financials.
        </p>
      </div>

      {!schemaReady && schemaMessage ? (
        <FounderSchemaBanner message={schemaMessage} />
      ) : null}

      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 px-6 py-8">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Confidence: {latest?.confidenceLevel ?? "—"}
        </p>
        <p className="mt-2 text-5xl font-semibold tabular-nums">
          {latest
            ? `$${Math.round(latest.estimatedValue).toLocaleString()}`
            : "—"}
        </p>
        <form action={computeValuationAction} className="mt-6">
          <Button type="submit" className="rounded-xl" disabled={!schemaReady}>
            Refresh calculation
          </Button>
        </form>
      </div>

      {latest ? (
        <section>
          <h2 className="text-lg font-medium">Factors</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {latest.factors.map((f) => (
              <li
                key={f.factorName}
                className="flex justify-between border-t border-border/40 pt-2"
              >
                <span className="text-muted-foreground">{f.factorName}</span>
                <span className="tabular-nums">{f.factorValue}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="text-lg font-medium">History</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {history.length === 0 ? (
            <li>
              {schemaReady
                ? "No valuation snapshots yet."
                : "History unavailable until valuation tables are migrated."}
            </li>
          ) : (
            history.map((h) => (
              <li key={h.id}>
                {new Date(h.computedAt).toLocaleString()} · $
                {Math.round(h.estimatedValue).toLocaleString()}
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  )
}
