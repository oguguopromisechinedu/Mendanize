"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  AdminPageHeader,
  StatusBadge,
} from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import type { OrganizationPlanRecord } from "@/services/organization-licensing"
import {
  adjustOrgSeatsAction,
  upsertOrganizationPlanAction,
} from "../actions"

const field =
  "h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"

export function OrgPlansAdminView({
  plans,
  subscriptions,
}: {
  plans: OrganizationPlanRecord[]
  subscriptions: Array<{
    id: string
    organizationId: string
    organizationName: string
    planName: string
    status: string
    seatLimit: number
    seatsUsed: number
    seatLimitOverride: number | null
    updatedAt: string
  }>
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [key, setKey] = useState("")
  const [name, setName] = useState("")
  const [seatLimit, setSeatLimit] = useState("10")
  const [stripePriceId, setStripePriceId] = useState("")
  const [askVolume, setAskVolume] = useState("500")
  const [jobLimit, setJobLimit] = useState("10")

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <AdminPageHeader
        title="Organization plans"
        description="Seat catalog and org subscriptions. Checkout uses MES-021 Stripe — never Stripe Connect."
      />

      <section className="grid gap-3 rounded-xl border border-border p-4 md:grid-cols-3">
        <h2 className="md:col-span-3 text-lg font-semibold">Create / update plan</h2>
        <input
          className={field}
          placeholder="key (team_10)"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <input
          className={field}
          placeholder="Display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className={field}
          type="number"
          placeholder="Seat limit"
          value={seatLimit}
          onChange={(e) => setSeatLimit(e.target.value)}
        />
        <input
          className={field}
          placeholder="Stripe price id"
          value={stripePriceId}
          onChange={(e) => setStripePriceId(e.target.value)}
        />
        <input
          className={field}
          type="number"
          placeholder="Ask volume limit"
          value={askVolume}
          onChange={(e) => setAskVolume(e.target.value)}
        />
        <input
          className={field}
          type="number"
          placeholder="Marketplace job limit"
          value={jobLimit}
          onChange={(e) => setJobLimit(e.target.value)}
        />
        <Button
          className="md:col-span-3 w-fit"
          size="sm"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await upsertOrganizationPlanAction({
                key,
                name,
                seatLimit: Number(seatLimit),
                stripePriceId: stripePriceId || null,
                askVolumeLimit: askVolume ? Number(askVolume) : null,
                marketplaceJobLimit: jobLimit ? Number(jobLimit) : null,
                requiresVerification: true,
                active: true,
              })
              if (!res.ok) toast.error(res.message)
              else {
                toast.success(res.message)
                setKey("")
                setName("")
                router.refresh()
              }
            })
          }
        >
          Save plan
        </Button>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Catalog</h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Key</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Seats</th>
                <th className="px-3 py-2">Price id</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id} className="border-b border-border/60">
                  <td className="px-3 py-2 font-mono text-xs">{p.key}</td>
                  <td className="px-3 py-2">{p.name}</td>
                  <td className="px-3 py-2">{p.seatLimit}</td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {p.stripePriceId ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={p.active ? "active" : "disabled"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Subscriptions</h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Company</th>
                <th className="px-3 py-2">Plan</th>
                <th className="px-3 py-2">Seats</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Override</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((s) => (
                <tr key={s.id} className="border-b border-border/60">
                  <td className="px-3 py-2">{s.organizationName}</td>
                  <td className="px-3 py-2">{s.planName}</td>
                  <td className="px-3 py-2">
                    {s.seatsUsed}/{s.seatLimit}
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-3 py-2">
                    <form
                      className="flex gap-2"
                      onSubmit={(e) => {
                        e.preventDefault()
                        const fd = new FormData(e.currentTarget)
                        const raw = String(fd.get("override") ?? "").trim()
                        start(async () => {
                          const res = await adjustOrgSeatsAction({
                            organizationId: s.organizationId,
                            seatLimitOverride: raw ? Number(raw) : null,
                          })
                          if (!res.ok) toast.error(res.message)
                          else {
                            toast.success(res.message)
                            router.refresh()
                          }
                        })
                      }}
                    >
                      <input
                        name="override"
                        className={field}
                        placeholder={
                          s.seatLimitOverride != null
                            ? String(s.seatLimitOverride)
                            : "default"
                        }
                      />
                      <Button size="sm" type="submit" disabled={pending}>
                        Set
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
              {subscriptions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-muted-foreground"
                  >
                    No organization subscriptions yet.
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
