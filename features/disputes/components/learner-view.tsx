"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import type { DisputeDetail, DisputeListItem } from "@/services/disputes"
import {
  addDisputeStatementAction,
  openDisputeAction,
  withdrawDisputeAction,
} from "../actions"

const field =
  "h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
const area =
  "min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"

export function LearnerDisputesView({
  role,
  disputes,
  contracts,
}: {
  role: "client" | "worker"
  disputes: DisputeListItem[]
  contracts: Array<{
    id: string
    label: string
    milestones: Array<{ id: string; title: string; status: string }>
  }>
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [contractId, setContractId] = useState(contracts[0]?.id ?? "")
  const [reason, setReason] = useState("QUALITY")
  const [summary, setSummary] = useState("")
  const [milestoneId, setMilestoneId] = useState("")
  const [attachmentUrl, setAttachmentUrl] = useState("")
  const [selected, setSelected] = useState<DisputeDetail | null>(null)
  const [reply, setReply] = useState("")

  const milestones =
    contracts.find((c) => c.id === contractId)?.milestones ?? []

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <header className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Disputes
        </h1>
        <p className="text-sm text-muted-foreground">
          Structured contract disputes for {role === "client" ? "hiring" : "work"}{" "}
          parties. Admins resolve money actions through Stripe Connect — not AI
          adjudication.
        </p>
      </header>

      {contracts.length > 0 ? (
        <section className="space-y-3 rounded-xl border border-border p-4">
          <h2 className="text-lg font-medium">Open a dispute</h2>
          <select
            className={field}
            value={contractId}
            onChange={(e) => {
              setContractId(e.target.value)
              setMilestoneId("")
            }}
          >
            {contracts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            className={field}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            <option value="NON_PAYMENT">Non-payment</option>
            <option value="SCOPE">Scope</option>
            <option value="QUALITY">Quality</option>
            <option value="OTHER">Other</option>
          </select>
          <select
            className={field}
            value={milestoneId}
            onChange={(e) => setMilestoneId(e.target.value)}
          >
            <option value="">Milestone (optional)</option>
            {milestones.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title} · {m.status}
              </option>
            ))}
          </select>
          <textarea
            className={area}
            placeholder="What happened? (evidence welcome)"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
          <input
            className={field}
            placeholder="Evidence URL (Media Library or file link)"
            value={attachmentUrl}
            onChange={(e) => setAttachmentUrl(e.target.value)}
          />
          <Button
            disabled={pending || !contractId}
            className="rounded-xl"
            onClick={() =>
              start(async () => {
                const res = await openDisputeAction({
                  contractId,
                  reason,
                  summary,
                  milestoneId: milestoneId || null,
                  attachmentUrl: attachmentUrl || null,
                })
                if (!res.ok) toast.error(res.message)
                else {
                  toast.success(res.message)
                  setSummary("")
                  setAttachmentUrl("")
                  router.refresh()
                }
              })
            }
          >
            Submit dispute
          </Button>
        </section>
      ) : (
        <p className="text-sm text-muted-foreground">
          No eligible contracts yet.
        </p>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Your disputes</h2>
        {disputes.length === 0 ? (
          <p className="text-sm text-muted-foreground">None yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {disputes.map((d) => (
              <li key={d.id} className="space-y-2 px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    {d.jobTitle ?? d.contractId} · {d.reason} · {d.status}
                  </span>
                  <div className="flex gap-2">
                    {d.status === "OPEN" || d.status === "UNDER_REVIEW" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pending}
                        onClick={() =>
                          start(async () => {
                            const res = await withdrawDisputeAction({
                              disputeId: d.id,
                            })
                            if (!res.ok) toast.error(res.message)
                            else {
                              toast.success(res.message)
                              router.refresh()
                            }
                          })
                        }
                      >
                        Withdraw
                      </Button>
                    ) : null}
                  </div>
                </div>
                <p className="text-muted-foreground">{d.summary}</p>
                {(d.status === "OPEN" || d.status === "UNDER_REVIEW") && (
                  <div className="flex gap-2">
                    <input
                      className={field}
                      placeholder="Add statement…"
                      value={selected?.id === d.id ? reply : ""}
                      onChange={(e) => {
                        setSelected({ id: d.id } as DisputeDetail)
                        setReply(e.target.value)
                      }}
                    />
                    <Button
                      size="sm"
                      disabled={pending}
                      onClick={() =>
                        start(async () => {
                          const res = await addDisputeStatementAction({
                            disputeId: d.id,
                            body: reply,
                          })
                          if (!res.ok) toast.error(res.message)
                          else {
                            toast.success(res.message)
                            setReply("")
                            router.refresh()
                          }
                        })
                      }
                    >
                      Reply
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
