"use client"

import Link from "next/link"
import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Star } from "lucide-react"

import type { GuideListResult, GuideStatusValue } from "@/services/content/types"
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
import {
  bulkGuideStatusAction,
  deleteGuidesAction,
} from "../actions/actions"
import {
  GUIDE_DIFFICULTY_LABELS,
  GUIDE_STATUS_LABELS,
} from "../constants/constants"

const FILTER_TABS: Array<{
  key: GuideStatusValue | "ALL"
  label: string
  href: string
}> = [
  { key: "ALL", label: "All", href: "/dashboard/guides" },
  { key: "DRAFT", label: "Drafts", href: "/dashboard/guides/drafts" },
  {
    key: "PUBLISHED",
    label: "Published",
    href: "/dashboard/guides/published",
  },
  {
    key: "ARCHIVED",
    label: "Archived",
    href: "/dashboard/guides/archived",
  },
]

export function GuideListView({
  initial,
  statusFilter = "ALL",
  title = "Learning Guides",
  description = "Structured multi-lesson experiences for Learn and Practice.",
}: {
  initial: GuideListResult
  statusFilter?: GuideStatusValue | "ALL"
  title?: string
  description?: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [selected, setSelected] = useState<string[]>([])
  const [query, setQuery] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)

  const allIds = useMemo(() => initial.items.map((i) => i.id), [initial.items])
  const allSelected =
    allIds.length > 0 && allIds.every((id) => selected.includes(id))

  function runSearch() {
    const params = new URLSearchParams()
    if (query.trim()) params.set("query", query.trim())
    if (statusFilter !== "ALL") params.set("status", statusFilter)
    const base =
      statusFilter === "DRAFT"
        ? "/dashboard/guides/drafts"
        : statusFilter === "PUBLISHED"
          ? "/dashboard/guides/published"
          : statusFilter === "ARCHIVED"
            ? "/dashboard/guides/archived"
            : "/dashboard/guides"
    const qs = params.toString()
    router.push(qs ? `${base}?${qs}` : base)
  }

  function runBulk(action: "delete" | "publish" | "archive") {
    if (!selected.length) {
      toast.error("Select at least one guide")
      return
    }
    startTransition(async () => {
      if (action === "delete") {
        const res = await deleteGuidesAction({ ids: selected })
        if (!res.ok) toast.error(res.message)
        else {
          toast.success(res.message)
          setSelected([])
          router.refresh()
        }
        setConfirmOpen(false)
        return
      }
      const res = await bulkGuideStatusAction({
        ids: selected,
        status: action === "publish" ? "PUBLISHED" : "ARCHIVED",
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
        title={title}
        description={description}
        actions={
          <Button asChild size="sm">
            <Link href="/dashboard/guides/new">Create guide</Link>
          </Button>
        }
      />

      <AdminFilterBar>
        <div className="flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => (
            <Button
              key={tab.key}
              asChild
              size="sm"
              variant={statusFilter === tab.key ? "secondary" : "outline"}
            >
              <Link href={tab.href}>{tab.label}</Link>
            </Button>
          ))}
        </div>
      </AdminFilterBar>

      <AdminActionToolbar>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
          placeholder="Search guides…"
          className="h-9 w-full max-w-xs rounded-lg border border-input bg-transparent px-3 text-sm"
          aria-label="Search guides"
        />
        <Button type="button" size="sm" variant="outline" onClick={runSearch}>
          Search
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending || !selected.length}
          onClick={() => runBulk("publish")}
        >
          Publish
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending || !selected.length}
          onClick={() => runBulk("archive")}
        >
          Archive
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
          title="No guides yet"
          description="Create a multi-section learning path under a topic."
          actionLabel="Create guide"
          href="/dashboard/guides/new"
        />
      ) : (
        <AdminDataTable
          headers={[
            "",
            "Cover",
            "Title",
            "Category",
            "Topic",
            "Difficulty",
            "Duration",
            "Sections",
            "Lessons",
            "Status",
            "Author",
            "Updated",
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
            <td colSpan={12} className="px-3 py-2 text-xs text-muted-foreground">
              {initial.total} total · {GUIDE_STATUS_LABELS.DRAFT} filters available
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
                  aria-label={`Select ${row.title}`}
                />
              </td>
              <td className="px-3 py-2.5">
                {row.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={row.coverImageUrl}
                    alt=""
                    className="size-10 rounded object-cover"
                  />
                ) : (
                  <span className="inline-block size-10 rounded border border-border bg-muted/40" />
                )}
              </td>
              <td className="px-3 py-2.5">
                <Link
                  href={`/dashboard/guides/${row.id}`}
                  className="inline-flex items-center gap-1.5 font-medium hover:text-primary"
                >
                  {row.title}
                  {row.featured ? (
                    <Star className="size-3.5 fill-primary text-primary" />
                  ) : null}
                </Link>
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {row.categoryName ?? "—"}
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {row.topicName ?? "—"}
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {GUIDE_DIFFICULTY_LABELS[row.difficulty]}
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {row.estimatedMinutes}m
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {row.sectionCount}
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {row.lessonCount}
              </td>
              <td className="px-3 py-2.5">
                <StatusBadge status={row.status.toLowerCase()} />
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {row.authorName ?? "—"}
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {new Date(row.updatedAt).toLocaleDateString()}
              </td>
              <td className="px-3 py-2.5 text-right">
                <div className="flex justify-end gap-1">
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/dashboard/guides/${row.id}`}>Edit</Link>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/dashboard/guides/${row.id}/preview`}>
                      Preview
                    </Link>
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
        title="Delete selected guides?"
        description="Sections and lessons are removed with the guide."
        confirmLabel="Delete"
        pending={pending}
        onConfirm={() => runBulk("delete")}
      />
    </div>
  )
}
