"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { CommentRecord, ListResult } from "@/services/admin/types"
import {
  AdminActionToolbar,
  AdminDataTable,
  AdminEmptyState,
  AdminPageHeader,
  ConfirmationDialog,
  StatusBadge,
} from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  deleteCommentsAction,
  moderateCommentsAction,
} from "../actions/actions"

export function CommentsListView({
  initial,
}: {
  initial: ListResult<CommentRecord>
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [selected, setSelected] = useState<string[]>([])
  const [query, setQuery] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)

  function search() {
    const params = new URLSearchParams()
    if (query.trim()) params.set("query", query.trim())
    router.push(
      params.toString()
        ? `/dashboard/comments?${params}`
        : "/dashboard/comments"
    )
  }

  function moderate(status: CommentRecord["status"]) {
    if (!selected.length) {
      toast.error("Select comments first")
      return
    }
    start(async () => {
      const res = await moderateCommentsAction({ ids: selected, status })
      if (!res.ok) toast.error(res.message)
      else {
        toast.success(res.message)
        setSelected([])
        router.refresh()
      }
    })
  }

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Comments"
        description="Moderate reader comments across articles, guides, and tools."
      />
      <AdminActionToolbar>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Search…"
          className="h-9 w-full max-w-xs rounded-lg border border-input bg-transparent px-3 text-sm"
        />
        <Button size="sm" variant="outline" onClick={search}>
          Search
        </Button>
        <Button size="sm" variant="outline" disabled={pending} onClick={() => moderate("APPROVED")}>
          Approve
        </Button>
        <Button size="sm" variant="outline" disabled={pending} onClick={() => moderate("REJECTED")}>
          Reject
        </Button>
        <Button size="sm" variant="outline" disabled={pending} onClick={() => moderate("SPAM")}>
          Spam
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={pending || !selected.length}
          onClick={() => setConfirmOpen(true)}
        >
          Delete
        </Button>
      </AdminActionToolbar>

      {!initial.items.length ? (
        <AdminEmptyState
          title="No comments"
          description="Incoming comments appear here for moderation."
        />
      ) : (
        <AdminDataTable
          headers={["", "Author", "On", "Status", "Comment", "When"]}
        >
          {initial.items.map((c) => (
            <tr key={c.id} className="border-b border-border/60 align-top">
              <td className="px-3 py-2">
                <Checkbox
                  checked={selected.includes(c.id)}
                  onCheckedChange={(checked) =>
                    setSelected((prev) =>
                      checked
                        ? [...prev, c.id]
                        : prev.filter((id) => id !== c.id)
                    )
                  }
                />
              </td>
              <td className="px-3 py-2">
                <p className="font-medium">{c.authorName}</p>
                <p className="text-xs text-muted-foreground">
                  {c.authorEmail || "—"}
                </p>
              </td>
              <td className="px-3 py-2 text-xs">
                <p>{c.entityType}</p>
                <p className="text-muted-foreground">{c.entityTitle || c.entityId}</p>
              </td>
              <td className="px-3 py-2">
                <StatusBadge status={c.status} />
              </td>
              <td className="max-w-md px-3 py-2 text-sm">{c.body}</td>
              <td className="px-3 py-2 text-xs text-muted-foreground">
                {new Date(c.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </AdminDataTable>
      )}

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete comments?"
        description="Selected comments will be permanently removed."
        confirmLabel="Delete"
        onConfirm={() =>
          start(async () => {
            const res = await deleteCommentsAction({ ids: selected })
            if (!res.ok) toast.error(res.message)
            else {
              toast.success(res.message)
              setSelected([])
              router.refresh()
            }
            setConfirmOpen(false)
          })
        }
      />
    </div>
  )
}
