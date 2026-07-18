"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { ListResult, WorkflowItem } from "@/services/admin/types"
import {
  AdminActionToolbar,
  AdminDataTable,
  AdminEmptyState,
  AdminPageHeader,
  StatusBadge,
} from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import { advanceWorkflowAction } from "../actions/actions"

export function WorkflowQueueView({
  initial,
}: {
  initial: ListResult<WorkflowItem>
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [query, setQuery] = useState("")
  const [kind, setKind] = useState("")

  function search() {
    const params = new URLSearchParams()
    if (query.trim()) params.set("query", query.trim())
    if (kind) params.set("kind", kind)
    router.push(
      params.toString()
        ? `/dashboard/workflow?${params}`
        : "/dashboard/workflow"
    )
  }

  function advance(
    item: WorkflowItem,
    status: "REVIEW" | "PUBLISHED" | "ARCHIVED" | "DRAFT"
  ) {
    start(async () => {
      const res = await advanceWorkflowAction({
        kind: item.kind,
        id: item.id,
        status,
      })
      if (!res.ok) toast.error(res.message)
      else {
        toast.success(res.message)
        router.refresh()
      }
    })
  }

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Workflow"
        description="Publishing pipeline for drafts, review, and scheduled content."
      />
      <AdminActionToolbar>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Search queue…"
          className="h-9 w-full max-w-xs rounded-lg border border-input bg-transparent px-3 text-sm"
        />
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
        >
          <option value="">All types</option>
          <option value="article">Articles</option>
          <option value="guide">Guides</option>
          <option value="tool">AI Tools</option>
        </select>
        <Button size="sm" variant="outline" onClick={search}>
          Filter
        </Button>
      </AdminActionToolbar>

      {!initial.items.length ? (
        <AdminEmptyState
          title="Queue is clear"
          description="No draft, review, or scheduled items right now."
        />
      ) : (
        <AdminDataTable
          headers={["Title", "Type", "Status", "Updated", ""]}
        >
          {initial.items.map((item) => (
            <tr key={`${item.kind}-${item.id}`} className="border-b border-border/60">
              <td className="px-3 py-2">
                <Link href={item.href} className="font-medium hover:underline">
                  {item.title}
                </Link>
              </td>
              <td className="px-3 py-2 text-sm capitalize">{item.kind}</td>
              <td className="px-3 py-2">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-3 py-2 text-xs text-muted-foreground">
                {new Date(item.updatedAt).toLocaleString()}
              </td>
              <td className="space-x-1 px-3 py-2 whitespace-nowrap">
                {item.status === "DRAFT" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => advance(item, "REVIEW")}
                  >
                    To review
                  </Button>
                )}
                <Button
                  size="sm"
                  disabled={pending}
                  onClick={() => advance(item, "PUBLISHED")}
                >
                  Publish
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() => advance(item, "ARCHIVED")}
                >
                  Archive
                </Button>
              </td>
            </tr>
          ))}
        </AdminDataTable>
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        {initial.total} item(s) in the publishing queue.
      </p>
    </div>
  )
}
