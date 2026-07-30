"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  AdminPageHeader,
  StatusBadge,
} from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import type { DisputeDetail, DisputeListItem } from "@/services/disputes"
import {
  markDisputeUnderReviewAction,
  resolveDisputeAction,
} from "../actions"
import { loadDisputeDetailAction } from "../actions-admin-load"

const field =
  "h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
const area =
  "min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"

export function DisputesAdminView({
  disputes: initial,
}: {
  disputes: DisputeListItem[]
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [detail, setDetail] = useState<DisputeDetail | null>(null)
  const [note, setNote] = useState("")
  const [action, setAction] = useState("NONE")
  const [outcome, setOutcome] = useState("RESOLVED")
  const [milestoneId, setMilestoneId] = useState("")
  const [partialCents, setPartialCents] = useState("")

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <AdminPageHeader
        title="Contract disputes"
        description="Human review only. Release/refund uses MES-039 Stripe Connect — no parallel ledger or AI judge."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Queue</h2>
          <ul className="divide-y divide-border rounded-xl border border-border">
            {initial.map((d) => (
              <li key={d.id} className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    className="text-left font-medium hover:underline"
                    onClick={() =>
                      start(async () => {
                        try {
                          const full = await fetchDispute(d.id)
                          setDetail(full)
                          setMilestoneId(full.milestoneId ?? "")
                          setNote("")
                        } catch (e) {
                          toast.error(
                            e instanceof Error ? e.message : "Load failed",
                          )
                        }
                      })
                    }
                  >
                    {d.jobTitle ?? d.contractId}
                  </button>
                  <StatusBadge status={d.status.toLowerCase()} />
                </div>
                <p className="mt-1 text-muted-foreground">
                  {d.reason} · {d.openerEmail ?? d.openedByPublicUserId}
                </p>
              </li>
            ))}
            {initial.length === 0 ? (
              <li className="px-4 py-6 text-center text-muted-foreground">
                Queue empty.
              </li>
            ) : null}
          </ul>
        </section>

        <section className="space-y-3 rounded-xl border border-border p-4">
          <h2 className="text-lg font-semibold">Resolve</h2>
          {!detail ? (
            <p className="text-sm text-muted-foreground">
              Select a dispute to review statements and take action.
            </p>
          ) : (
            <>
              <p className="text-sm">{detail.summary}</p>
              <ul className="max-h-40 space-y-2 overflow-y-auto text-xs text-muted-foreground">
                {detail.statements.map((s) => (
                  <li key={s.id}>
                    <strong>{s.authorEmail ?? s.authorId}:</strong> {s.body}
                  </li>
                ))}
              </ul>
              {detail.attachments.length > 0 ? (
                <ul className="text-xs">
                  {detail.attachments.map((a) => (
                    <li key={a.id}>
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        {a.label || a.url}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}

              <select
                className={field}
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
              >
                <option value="RESOLVED">Resolve</option>
                <option value="REJECTED">Reject</option>
              </select>
              <select
                className={field}
                value={action}
                onChange={(e) => setAction(e.target.value)}
              >
                <option value="NONE">No money action</option>
                <option value="RELEASE_MILESTONE">Release milestone (Connect)</option>
                <option value="PARTIAL_REFUND">Refund milestone (Connect)</option>
                <option value="CANCEL_CONTRACT">Cancel contract flag</option>
              </select>
              <select
                className={field}
                value={milestoneId}
                onChange={(e) => setMilestoneId(e.target.value)}
              >
                <option value="">Milestone</option>
                {detail.milestones.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} · {m.status} · {(m.amountCents / 100).toFixed(2)}
                  </option>
                ))}
              </select>
              {action === "PARTIAL_REFUND" ? (
                <input
                  className={field}
                  type="number"
                  placeholder="Partial refund cents"
                  value={partialCents}
                  onChange={(e) => setPartialCents(e.target.value)}
                />
              ) : null}
              <textarea
                className={area}
                placeholder="Resolution note (audit-logged)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      const res = await markDisputeUnderReviewAction({
                        disputeId: detail.id,
                      })
                      if (!res.ok) toast.error(res.message)
                      else {
                        toast.success(res.message)
                        router.refresh()
                      }
                    })
                  }
                >
                  Mark under review
                </Button>
                <Button
                  size="sm"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      const res = await resolveDisputeAction({
                        disputeId: detail.id,
                        outcome,
                        resolutionAction: action,
                        resolutionNote: note,
                        milestoneId: milestoneId || null,
                        partialRefundCents: partialCents
                          ? Number(partialCents)
                          : null,
                      })
                      if (!res.ok) toast.error(res.message)
                      else {
                        toast.success(res.message)
                        setDetail(null)
                        router.refresh()
                      }
                    })
                  }
                >
                  Submit decision
                </Button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}

/** Load dispute detail via Admin server action. */
async function fetchDispute(id: string): Promise<DisputeDetail> {
  return loadDisputeDetailAction(id)
}
