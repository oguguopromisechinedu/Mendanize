"use client"

import Link from "next/link"
import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Star } from "lucide-react"

import type {
  CategorySummary,
  TopicListResult,
} from "@/services/content/types"
import {
  AdminActionToolbar,
  AdminDataTable,
  AdminEmptyState,
  AdminFilterBar,
  AdminPageHeader,
  ConfirmationDialog,
  StatusBadge,
} from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select } from "@/components/ui/select"
import {
  bulkTopicStatusAction,
  deleteTopicsAction,
} from "../actions/actions"

export function TopicListView({
  initial,
  categories,
  categoryFilter,
}: {
  initial: TopicListResult
  categories: CategorySummary[]
  categoryFilter?: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [selected, setSelected] = useState<string[]>([])
  const [query, setQuery] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)

  const allIds = useMemo(() => initial.items.map((i) => i.id), [initial.items])
  const allSelected =
    allIds.length > 0 && allIds.every((id) => selected.includes(id))

  function navigate(nextCategory?: string, nextQuery?: string) {
    const params = new URLSearchParams()
    const cat = nextCategory ?? categoryFilter
    const q = nextQuery ?? query
    if (cat) params.set("categoryId", cat)
    if (q.trim()) params.set("query", q.trim())
    const qs = params.toString()
    router.push(qs ? `/dashboard/topics?${qs}` : "/dashboard/topics")
  }

  function runBulk(action: "delete" | "hide" | "activate") {
    if (!selected.length) {
      toast.error("Select at least one topic")
      return
    }
    startTransition(async () => {
      if (action === "delete") {
        const res = await deleteTopicsAction({ ids: selected })
        if (!res.ok) toast.error(res.message)
        else {
          toast.success(res.message)
          setSelected([])
          router.refresh()
        }
        setConfirmOpen(false)
        return
      }
      const res = await bulkTopicStatusAction({
        ids: selected,
        status: action === "hide" ? "HIDDEN" : "ACTIVE",
      })
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
        title="Topics"
        description="Topics belong to exactly one category — no orphans."
        actions={
          <Button asChild size="sm">
            <Link href="/dashboard/topics/new">Create topic</Link>
          </Button>
        }
      />

      <AdminFilterBar>
        <Select
          value={categoryFilter || "__all"}
          onChange={(e) =>
            navigate(
              e.target.value === "__all" ? "" : e.target.value,
              query
            )
          }
          aria-label="Filter by category"
          className="max-w-xs"
        >
          <option value="__all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </AdminFilterBar>

      <AdminActionToolbar>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && navigate(categoryFilter, query)}
          placeholder="Search topics…"
          className="h-9 w-full max-w-xs rounded-lg border border-input bg-transparent px-3 text-sm"
          aria-label="Search topics"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => navigate(categoryFilter, query)}
        >
          Search
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending || !selected.length}
          onClick={() => runBulk("activate")}
        >
          Activate
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending || !selected.length}
          onClick={() => runBulk("hide")}
        >
          Hide
        </Button>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={pending || !selected.length}
          onClick={() => setConfirmOpen(true)}
        >
          Delete
        </Button>
      </AdminActionToolbar>

      {initial.items.length === 0 ? (
        <AdminEmptyState
          title="No topics yet"
          description="Create a topic under a category so articles can attach to it."
          actionLabel="Create topic"
          href="/dashboard/topics/new"
        />
      ) : (
        <AdminDataTable
          headers={[
            "",
            "Name",
            "Category",
            "Description",
            "Articles",
            "Guides",
            "Tools",
            "Status",
            "",
          ]}
        >
          <tr className="bg-muted/20">
            <td className="px-3 py-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(v) =>
                  setSelected(Boolean(v) ? allIds : [])
                }
                aria-label="Select all"
              />
            </td>
            <td colSpan={8} className="px-3 py-2 text-xs text-muted-foreground">
              {initial.total} total
            </td>
          </tr>
          {initial.items.map((row) => (
            <tr key={row.id} className="hover:bg-hover/40">
              <td className="px-3 py-2.5">
                <Checkbox
                  checked={selected.includes(row.id)}
                  onCheckedChange={(v) =>
                    setSelected((prev) =>
                      Boolean(v)
                        ? [...new Set([...prev, row.id])]
                        : prev.filter((x) => x !== row.id)
                    )
                  }
                  aria-label={`Select ${row.name}`}
                />
              </td>
              <td className="px-3 py-2.5">
                <Link
                  href={`/dashboard/topics/${row.id}`}
                  className="inline-flex items-center gap-1.5 font-medium hover:text-primary"
                >
                  {row.name}
                  {row.featured ? (
                    <Star className="size-3.5 fill-primary text-primary" />
                  ) : null}
                </Link>
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {row.categoryName ?? "—"}
              </td>
              <td className="max-w-[14rem] truncate px-3 py-2.5 text-muted-foreground">
                {row.description ?? "—"}
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {row.articleCount}
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {row.guideCount}
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {row.toolCount}
              </td>
              <td className="px-3 py-2.5">
                <StatusBadge status={row.status.toLowerCase()} />
              </td>
              <td className="px-3 py-2.5 text-right">
                <div className="flex justify-end gap-1">
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/dashboard/topics/${row.id}/edit`}>Edit</Link>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/dashboard/topics/${row.id}`}>Details</Link>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </AdminDataTable>
      )}

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete selected topics?"
        description="Articles linked to these topics keep their topicId unless cleared elsewhere."
        confirmLabel="Delete"
        pending={pending}
        onConfirm={() => runBulk("delete")}
      />
    </div>
  )
}
