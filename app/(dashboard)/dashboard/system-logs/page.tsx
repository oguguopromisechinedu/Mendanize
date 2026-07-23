import type { Metadata } from "next"

import { requireEditor } from "@/features/authentication/server"
import { listApplicationLogs } from "@/services/admin/application-logs"
import { getHealthSnapshot } from "@/lib/observability"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "System Logs",
  robots: { index: false },
}

export default async function SystemLogsPage() {
  await requireEditor()
  const [logs, health] = await Promise.all([
    listApplicationLogs(150),
    getHealthSnapshot(),
  ])

  return (
    <div className="space-y-6 p-6">
      <div>
        <p className="type-eyebrow text-primary">MES-032</p>
        <h1 className="type-h2 text-foreground">Observability</h1>
        <p className="mt-2 text-muted-foreground">
          Health status and recent application errors/warnings.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Status</p>
          <p className="mt-1 text-lg font-semibold">{health.status}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Database</p>
          <p className="mt-1 text-lg font-semibold">{health.database}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">AI job queue</p>
          <p className="mt-1 text-lg font-semibold">{health.jobQueueDepth}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">AI keys configured</p>
          <p className="mt-1 text-sm">
            {Object.entries(health.aiProviders)
              .filter(([, v]) => v)
              .map(([k]) => k)
              .join(", ") || "none"}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Request</th>
              <th className="px-4 py-3">When</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No persisted logs yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-border/60">
                  <td className="px-4 py-3">
                    <Badge variant="outline">{log.level}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <p className="line-clamp-2 font-medium">{log.message}</p>
                    {log.module ? (
                      <p className="text-xs text-muted-foreground">
                        {log.module}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {log.requestId ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
