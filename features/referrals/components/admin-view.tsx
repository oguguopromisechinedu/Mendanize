"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  AdminPageHeader,
  StatusBadge,
} from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import type { AdminReferralOverview } from "@/services/referrals"
import {
  resolveReferralRewardAction,
  setReferralCodeEnabledAction,
  updateReferralSettingsAction,
} from "../actions"

const field =
  "h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"

export function ReferralsAdminView({
  overview,
}: {
  overview: AdminReferralOverview
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [enabled, setEnabled] = useState(overview.settings.enabled)
  const [windowDays, setWindowDays] = useState(
    String(overview.settings.attributionWindowDays),
  )

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <AdminPageHeader
        title="Referrals"
        description="Affiliate codes, signup attribution, and manual Admin payout flags. Does not use Stripe Connect."
      />

      <section className="grid gap-3 rounded-xl border border-border p-4 md:grid-cols-3">
        <h2 className="md:col-span-3 text-lg font-semibold">Settings</h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          Program enabled
        </label>
        <input
          className={field}
          type="number"
          min={1}
          max={365}
          value={windowDays}
          onChange={(e) => setWindowDays(e.target.value)}
          placeholder="Attribution window (days)"
        />
        <Button
          size="sm"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await updateReferralSettingsAction({
                enabled,
                attributionWindowDays: Number(windowDays),
              })
              if (!res.ok) toast.error(res.message)
              else {
                toast.success(res.message)
                router.refresh()
              }
            })
          }
        >
          Save settings
        </Button>
        <p className="md:col-span-3 text-xs text-muted-foreground">
          Primary reward:{" "}
          <code>{overview.settings.rewardMechanism}</code> — finance settles
          outside the app; no third payment processor.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Codes</h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2">Signups</th>
                <th className="px-3 py-2">Conversions</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {overview.codes.map((c) => (
                <tr key={c.id} className="border-b border-border/60">
                  <td className="px-3 py-2 font-mono">{c.code}</td>
                  <td className="px-3 py-2">{c.ownerEmail ?? c.publicUserId}</td>
                  <td className="px-3 py-2">{c.attributionCount}</td>
                  <td className="px-3 py-2">{c.conversionCount}</td>
                  <td className="px-3 py-2">
                    <StatusBadge
                      status={c.enabled ? "active" : "disabled"}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() =>
                        start(async () => {
                          const res = await setReferralCodeEnabledAction({
                            codeId: c.id,
                            enabled: !c.enabled,
                            reason: c.enabled ? "Disabled by Admin" : null,
                          })
                          if (!res.ok) toast.error(res.message)
                          else {
                            toast.success(res.message)
                            router.refresh()
                          }
                        })
                      }
                    >
                      {c.enabled ? "Disable" : "Enable"}
                    </Button>
                  </td>
                </tr>
              ))}
              {overview.codes.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-6 text-center text-muted-foreground"
                  >
                    No referral codes yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Abuse flags</h2>
        <ul className="divide-y divide-border rounded-xl border border-border">
          {overview.attributions
            .filter((a) => a.abuseFlagged || a.selfReferralBlocked)
            .slice(0, 30)
            .map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <span>
                  {a.code} → {a.referredEmail ?? "user"}
                </span>
                <span className="text-muted-foreground">
                  {a.selfReferralBlocked
                    ? "self-referral"
                    : a.abuseReason ?? "flagged"}
                </span>
              </li>
            ))}
          {overview.attributions.every(
            (a) => !a.abuseFlagged && !a.selfReferralBlocked,
          ) ? (
            <li className="px-4 py-6 text-center text-sm text-muted-foreground">
              No abuse flags.
            </li>
          ) : null}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Payout flags</h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Referrer</th>
                <th className="px-3 py-2">Plan</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {overview.rewards.map((r) => (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="px-3 py-2">{r.referrerEmail ?? "—"}</td>
                  <td className="px-3 py-2">{r.planTier}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={r.status.toLowerCase()} />
                  </td>
                  <td className="px-3 py-2">
                    {r.status === "PENDING_PAYOUT" ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={pending}
                          onClick={() =>
                            start(async () => {
                              const res = await resolveReferralRewardAction({
                                rewardId: r.id,
                                status: "GRANTED",
                                note: "Marked paid outside platform",
                              })
                              if (!res.ok) toast.error(res.message)
                              else {
                                toast.success(res.message)
                                router.refresh()
                              }
                            })
                          }
                        >
                          Grant
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={pending}
                          onClick={() =>
                            start(async () => {
                              const res = await resolveReferralRewardAction({
                                rewardId: r.id,
                                status: "DENIED",
                              })
                              if (!res.ok) toast.error(res.message)
                              else {
                                toast.success(res.message)
                                router.refresh()
                              }
                            })
                          }
                        >
                          Deny
                        </Button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
              {overview.rewards.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-6 text-center text-muted-foreground"
                  >
                    No rewards yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
