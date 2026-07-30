"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

import { AdminEmptyState, AdminPageHeader, StatusBadge } from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import { cancelEmsQueueAction, retryEmsQueueAction } from "../actions"
import { EmsNav } from "./ems-nav"

export function EmsQueueView({
  items,
  canOps,
}: {
  items: Array<{
    id: string
    toEmail: string
    templateKey: string | null
    subject: string
    status: string
    attempts: number
    lastError: string | null
    providerMessageId: string | null
    isTest: boolean
    createdAt: Date | string
    sentAt: Date | string | null
  }>
  canOps: boolean
}) {
  const router = useRouter()
  const [pending, start] = useTransition()

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Email queue"
        description="Outbound jobs via MES-042. Retry failed items; cancel pending ones."
      />
      <EmsNav />
      {items.length === 0 ? (
        <AdminEmptyState
          title="Queue empty"
          description="Sends and tests will appear here."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">To</th>
                <th className="px-3 py-2 font-medium">Subject</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Attempts</th>
                <th className="px-3 py-2 font-medium">Error</th>
                {canOps ? (
                  <th className="px-3 py-2 font-medium">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border/60 align-top">
                  <td className="px-3 py-2">
                    <div>{item.toEmail}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.templateKey ?? "ad-hoc"}
                      {item.isTest ? " · TEST" : ""}
                    </div>
                  </td>
                  <td className="px-3 py-2">{item.subject}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={item.status.toLowerCase()} />
                  </td>
                  <td className="px-3 py-2 tabular-nums">{item.attempts}</td>
                  <td className="max-w-[220px] px-3 py-2 text-xs text-muted-foreground">
                    {item.lastError ?? "—"}
                  </td>
                  {canOps ? (
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {item.status === "FAILED" || item.status === "PENDING" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={pending}
                            onClick={() =>
                              start(async () => {
                                const res = await retryEmsQueueAction(item.id)
                                if (!res.ok) toast.error(res.message)
                                else {
                                  toast.success(res.message)
                                  router.refresh()
                                }
                              })
                            }
                          >
                            Retry
                          </Button>
                        ) : null}
                        {item.status !== "COMPLETED" &&
                        item.status !== "CANCELLED" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={pending}
                            onClick={() =>
                              start(async () => {
                                const res = await cancelEmsQueueAction(item.id)
                                if (!res.ok) toast.error(res.message)
                                else {
                                  toast.success(res.message)
                                  router.refresh()
                                }
                              })
                            }
                          >
                            Cancel
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
