"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { AutomationJobRecord, ListResult } from "@/services/admin/types"
import {
  AdminDataTable,
  AdminEmptyState,
  AdminPageHeader,
  StatusBadge,
} from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import {
  runAutomationAction,
  toggleAutomationAction,
} from "../actions/actions"

export function AutomationView({
  initial,
}: {
  initial: ListResult<AutomationJobRecord>
}) {
  const router = useRouter()
  const [pending, start] = useTransition()

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Automation"
        description="Scheduled jobs and one-click runners for platform maintenance."
      />

      {!initial.items.length ? (
        <AdminEmptyState
          title="No jobs"
          description="Default jobs will appear when the module loads."
        />
      ) : (
        <AdminDataTable
          headers={["Job", "Schedule", "Status", "Last run", "Result", ""]}
        >
          {initial.items.map((job) => (
            <tr key={job.id} className="border-b border-border/60">
              <td className="px-3 py-2">
                <p className="font-medium">{job.name}</p>
                <p className="text-xs text-muted-foreground">
                  {job.description}
                </p>
              </td>
              <td className="px-3 py-2 text-sm">{job.schedule || "—"}</td>
              <td className="px-3 py-2">
                <StatusBadge status={job.enabled ? job.status : "DISABLED"} />
              </td>
              <td className="px-3 py-2 text-xs text-muted-foreground">
                {job.lastRunAt
                  ? new Date(job.lastRunAt).toLocaleString()
                  : "Never"}
              </td>
              <td className="max-w-xs truncate px-3 py-2 text-xs">
                {job.lastResult || "—"}
              </td>
              <td className="space-x-2 px-3 py-2 whitespace-nowrap">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      const res = await toggleAutomationAction({
                        key: job.key,
                        enabled: !job.enabled,
                      })
                      if (!res.ok) toast.error(res.message)
                      else {
                        toast.success(res.message)
                        router.refresh()
                      }
                    })
                  }
                >
                  {job.enabled ? "Disable" : "Enable"}
                </Button>
                <Button
                  size="sm"
                  disabled={pending || !job.enabled}
                  onClick={() =>
                    start(async () => {
                      const res = await runAutomationAction(job.key)
                      if (!res.ok) toast.error(res.message)
                      else {
                        toast.success(res.message)
                        router.refresh()
                      }
                    })
                  }
                >
                  Run now
                </Button>
              </td>
            </tr>
          ))}
        </AdminDataTable>
      )}
    </div>
  )
}
