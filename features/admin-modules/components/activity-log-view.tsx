"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import type { AuditLogRecord, ListResult } from "@/services/admin/types"
import {
  AdminActionToolbar,
  AdminDataTable,
  AdminEmptyState,
  AdminPageHeader,
} from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"

export function ActivityLogView({
  initial,
}: {
  initial: ListResult<AuditLogRecord>
}) {
  const router = useRouter()
  const [query, setQuery] = useState("")

  function search() {
    const params = new URLSearchParams()
    if (query.trim()) params.set("query", query.trim())
    router.push(
      params.toString()
        ? `/dashboard/activity-log?${params}`
        : "/dashboard/activity-log"
    )
  }

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Activity Log"
        description="Audit trail of admin actions across the dashboard."
      />
      <AdminActionToolbar>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Search actions…"
          className="h-9 w-full max-w-xs rounded-lg border border-input bg-transparent px-3 text-sm"
        />
        <Button size="sm" variant="outline" onClick={search}>
          Search
        </Button>
      </AdminActionToolbar>

      {!initial.items.length ? (
        <AdminEmptyState
          title="No activity yet"
          description="Mutations from admin modules are recorded here."
        />
      ) : (
        <AdminDataTable
          headers={["When", "Actor", "Action", "Entity", "Summary"]}
        >
          {initial.items.map((row) => (
            <tr key={row.id} className="border-b border-border/60">
              <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                {new Date(row.createdAt).toLocaleString()}
              </td>
              <td className="px-3 py-2 text-sm">
                {row.actorEmail || row.actorId || "system"}
              </td>
              <td className="px-3 py-2 font-mono text-xs">{row.action}</td>
              <td className="px-3 py-2 text-xs">
                {row.entityType}
                {row.entityId ? ` · ${row.entityId.slice(0, 8)}` : ""}
              </td>
              <td className="px-3 py-2 text-sm">{row.summary}</td>
            </tr>
          ))}
        </AdminDataTable>
      )}
    </div>
  )
}
