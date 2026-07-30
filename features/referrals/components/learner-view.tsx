"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import type { LearnerReferralDashboard } from "@/services/referrals"

export function LearnerReferralView({
  dashboard,
  appOrigin,
}: {
  dashboard: LearnerReferralDashboard
  appOrigin: string
}) {
  const [copied, setCopied] = useState(false)
  const shareUrl = useMemo(
    () => `${appOrigin}${dashboard.code.sharePath}`,
    [appOrigin, dashboard.code.sharePath],
  )

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success("Referral link copied")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Could not copy — select the link manually")
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <h1 className="font-display text-3xl tracking-tight">Referrals</h1>
        <p className="text-sm text-muted-foreground">
          Share your link. When someone signs up and starts a paid plan, you
          earn a reward flagged for manual Admin payout — not Stripe Connect.
        </p>
      </header>

      {!dashboard.settings.enabled ? (
        <p className="rounded-lg border border-border px-4 py-3 text-sm text-muted-foreground">
          Referral tracking is temporarily disabled by an administrator.
        </p>
      ) : null}

      <section className="space-y-3 rounded-xl border border-border p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Your code
        </p>
        <p className="font-display text-2xl tracking-widest">
          {dashboard.code.code}
        </p>
        {!dashboard.code.enabled ? (
          <p className="text-sm text-destructive">
            This code is disabled
            {dashboard.code.disabledReason
              ? `: ${dashboard.code.disabledReason}`
              : "."}
          </p>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <code className="flex-1 truncate rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs">
            {shareUrl}
          </code>
          <Button size="sm" onClick={copyLink} disabled={!dashboard.code.enabled}>
            {copied ? "Copied" : "Copy link"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Attribution window: {dashboard.settings.attributionWindowDays} days
          (first touch). Self-referrals are blocked.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Signups" value={dashboard.attributionCount} />
        <Stat label="Paid conversions" value={dashboard.conversionCount} />
        <Stat label="Pending payouts" value={dashboard.pendingRewards} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recent conversions</h2>
        {dashboard.recentConversions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No paid conversions yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {dashboard.recentConversions.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <span>{c.planTier}</span>
                <span className="text-muted-foreground">
                  {new Date(c.convertedAt).toLocaleDateString()} ·{" "}
                  {c.rewardStatus ?? "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-2xl">{value}</p>
    </div>
  )
}
