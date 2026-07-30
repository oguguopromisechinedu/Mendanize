"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

import {
  AdminPageHeader,
  AdminActionToolbar,
} from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import { resolveMessageReportAction } from "../actions"

export function MessageReportsAdminView({
  reports,
}: {
  reports: Array<{
    id: string
    threadId: string
    messageId: string
    reason: string
    createdAt: string
    reporter: { id: string; name: string | null; email: string }
    messageBody: string
    messageSenderId: string
  }>
}) {
  const router = useRouter()
  const [pending, start] = useTransition()

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <AdminPageHeader
        title="Message reports"
        description="Learner DM moderation queue. Resolve or dismiss — never impersonate participants."
      />
      {reports.length === 0 ? (
        <p className="text-sm text-muted-foreground">No open message reports.</p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {reports.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-start justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  Thread {r.threadId.slice(0, 8)}… · msg {r.messageId.slice(0, 8)}…
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{r.reason}</p>
                <p className="mt-2 rounded-lg bg-muted/40 p-2 text-xs">
                  {r.messageBody || "(empty)"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Reporter: {r.reporter.name ?? r.reporter.email} ·{" "}
                  {new Date(r.createdAt).toLocaleString()}
                </p>
              </div>
              <AdminActionToolbar>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      const res = await resolveMessageReportAction({
                        reportId: r.id,
                        status: "RESOLVED",
                        hideMessage: true,
                      })
                      if (!res.ok) toast.error(res.message)
                      else {
                        toast.success(res.message)
                        router.refresh()
                      }
                    })
                  }
                >
                  Resolve & hide
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      const res = await resolveMessageReportAction({
                        reportId: r.id,
                        status: "DISMISSED",
                      })
                      if (!res.ok) toast.error(res.message)
                      else {
                        toast.success(res.message)
                        router.refresh()
                      }
                    })
                  }
                >
                  Dismiss
                </Button>
              </AdminActionToolbar>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
