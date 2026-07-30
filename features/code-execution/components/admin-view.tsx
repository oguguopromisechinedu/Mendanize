"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import {
  AdminPageHeader,
  StatusBadge,
} from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import type { CodeExecutionSettingRecord } from "@/services/code-execution"
import {
  killSwitchAction,
  updateCodeExecutionSettingsAction,
} from "../actions"

export function CodeExecutionAdminView({
  settings,
  todayCount,
  runs,
  canManage,
}: {
  settings: CodeExecutionSettingRecord
  todayCount: number
  runs: Array<{
    id: string
    status: string
    durationMs: number | null
    createdAt: string
    userEmail: string
    userName: string | null
    errorMessage: string | null
  }>
  canManage: boolean
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [timeoutMs, setTimeoutMs] = useState(settings.timeoutMs)
  const [freeDailyLimit, setFreeDailyLimit] = useState(settings.freeDailyLimit)
  const [paidDailyLimit, setPaidDailyLimit] = useState(settings.paidDailyLimit)

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <AdminPageHeader
        title="Code execution"
        description="MES-044 sandbox kill switch, limits, and recent runs. PublicUser-only execution — Admin never shares learner sessions."
      />

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-4">
        <StatusBadge status={settings.enabled ? "active" : "disabled"} />
        <span className="text-sm text-muted-foreground">
          Today’s runs (excl. blocked): {todayCount}
        </span>
        {canManage ? (
          <Button
            size="sm"
            variant={settings.enabled ? "destructive" : "default"}
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await killSwitchAction(!settings.enabled)
                if (!res.ok) toast.error(res.message)
                else {
                  toast.success(res.message)
                  router.refresh()
                }
              })
            }
          >
            {settings.enabled ? "Kill switch ON" : "Re-enable execution"}
          </Button>
        ) : null}
      </div>

      {canManage ? (
        <div className="grid max-w-xl gap-3 rounded-xl border border-border p-4">
          <label className="text-sm">
            Timeout (ms)
            <input
              type="number"
              className="mt-1 h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
              value={timeoutMs}
              onChange={(e) => setTimeoutMs(Number(e.target.value) || 3000)}
            />
          </label>
          <label className="text-sm">
            Free daily limit
            <input
              type="number"
              className="mt-1 h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
              value={freeDailyLimit}
              onChange={(e) => setFreeDailyLimit(Number(e.target.value) || 0)}
            />
          </label>
          <label className="text-sm">
            Paid daily limit
            <input
              type="number"
              className="mt-1 h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
              value={paidDailyLimit}
              onChange={(e) => setPaidDailyLimit(Number(e.target.value) || 0)}
            />
          </label>
          <Button
            size="sm"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await updateCodeExecutionSettingsAction({
                  timeoutMs,
                  freeDailyLimit,
                  paidDailyLimit,
                })
                if (!res.ok) toast.error(res.message)
                else {
                  toast.success(res.message)
                  router.refresh()
                }
              })
            }
          >
            Save limits
          </Button>
        </div>
      ) : null}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Recent runs</h2>
        {runs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No runs yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Duration</th>
                  <th className="px-3 py-2">When</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.id} className="border-b border-border/60">
                    <td className="px-3 py-2">
                      {r.userName ?? r.userEmail}
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge status={r.status.toLowerCase()} />
                      {r.errorMessage ? (
                        <div className="mt-1 max-w-xs truncate text-xs text-muted-foreground">
                          {r.errorMessage}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 tabular-nums">
                      {r.durationMs != null ? `${r.durationMs} ms` : "—"}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
