"use client"

import Link from "next/link"
import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Star } from "lucide-react"

import type { ArticleListResult, ArticleStatusValue } from "@/services/content/types"
import {
  AdminActionToolbar,
  AdminEmptyState,
  AdminFilterBar,
  AdminPageHeader,
  AdminDataTable,
  ConfirmationDialog,
  StatusBadge,
} from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  bulkStatusAction,
  deleteArticlesAction,
} from "../actions/actions"

function formatDate(value: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const FILTER_TABS: Array<{
  key: ArticleStatusValue | "ALL"
  label: string
  href: string
}> = [
  { key: "ALL", label: "All", href: "/dashboard/articles" },
  { key: "DRAFT", label: "Drafts", href: "/dashboard/articles/drafts" },
  { key: "REVIEW", label: "Review", href: "/dashboard/articles?status=REVIEW" },
  {
    key: "SCHEDULED",
    label: "Scheduled",
    href: "/dashboard/articles/scheduled",
  },
  {
    key: "PUBLISHED",
    label: "Published",
    href: "/dashboard/articles/published",
  },
  {
    key: "ARCHIVED",
    label: "Archived",
    href: "/dashboard/articles/archived",
  },
]

export function ArticleListView({
  initial,
  statusFilter = "ALL",
  title = "Articles",
  description = "Create, edit, publish, and archive educational articles.",
}: {
  initial: ArticleListResult
  statusFilter?: ArticleStatusValue | "ALL"
  title?: string
  description?: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [selected, setSelected] = useState<string[]>([])
  const [query, setQuery] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)

  const allIds = useMemo(
    () => initial.items.map((i) => i.id),
    [initial.items]
  )
  const allSelected =
    allIds.length > 0 && allIds.every((id) => selected.includes(id))

  function toggleAll(checked: boolean) {
    setSelected(checked ? allIds : [])
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) =>
      checked ? [...new Set([...prev, id])] : prev.filter((x) => x !== id)
    )
  }

  function runSearch() {
    const params = new URLSearchParams()
    if (query.trim()) params.set("query", query.trim())
    if (statusFilter !== "ALL") params.set("status", statusFilter)
    const base =
      statusFilter === "DRAFT"
        ? "/dashboard/articles/drafts"
        : statusFilter === "SCHEDULED"
          ? "/dashboard/articles/scheduled"
          : statusFilter === "PUBLISHED"
            ? "/dashboard/articles/published"
            : statusFilter === "ARCHIVED"
              ? "/dashboard/articles/archived"
              : "/dashboard/articles"
    const qs = params.toString()
    router.push(qs ? `${base}?${qs}` : base)
  }

  function runBulk(action: "delete" | "publish" | "archive" | "draft") {
    if (!selected.length) {
      toast.error("Select at least one article")
      return
    }
    startTransition(async () => {
      if (action === "delete") {
        const res = await deleteArticlesAction({ ids: selected })
        if (!res.ok) toast.error(res.message)
        else {
          toast.success(res.message)
          setSelected([])
          router.refresh()
        }
        setConfirmOpen(false)
        return
      }
      const statusMap = {
        publish: "PUBLISHED",
        archive: "ARCHIVED",
        draft: "DRAFT",
      } as const
      const res = await bulkStatusAction({
        ids: selected,
        status: statusMap[action],
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
            <Link href="/dashboard/articles/new">Create article</Link>
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
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            placeholder="Search title or slug…"
            className="h-9 w-full max-w-xs rounded-lg border border-input bg-transparent px-3 text-sm"
            aria-label="Search articles"
          />
          <Button type="button" size="sm" variant="outline" onClick={runSearch}>
            Search
          </Button>
        </div>
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
          title="No articles yet"
          description="Create your first educational article for the Learn pillar."
          actionLabel="Create article"
          href="/dashboard/articles/new"
        />
      ) : (
        <>
          <AdminDataTable
            headers={[
              "",
              "Title",
              "Status",
              "Category",
              "Author",
              "Published",
              "Updated",
              "Featured",
              "Read",
              "",
            ]}
          >
            <tr className="bg-muted/20">
              <td className="px-3 py-2">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(v) => toggleAll(Boolean(v))}
                  aria-label="Select all"
                />
              </td>
              <td colSpan={9} className="px-3 py-2 text-xs text-muted-foreground">
                {initial.total} total · page {initial.page}
              </td>
            </tr>
            {initial.items.map((row) => (
              <tr key={row.id} className="hover:bg-hover/40">
                <td className="px-3 py-2.5">
                  <Checkbox
                    checked={selected.includes(row.id)}
                    onCheckedChange={(v) => toggleOne(row.id, Boolean(v))}
                    aria-label={`Select ${row.title}`}
                  />
                </td>
                <td className="px-3 py-2.5">
                  <Link
                    href={`/dashboard/articles/${row.id}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {row.title}
                  </Link>
                </td>
                <td className="px-3 py-2.5">
                  <StatusBadge status={row.status.toLowerCase()} />
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {row.categoryName ?? "—"}
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {row.authorName ?? "—"}
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {formatDate(row.publishedAt)}
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {formatDate(row.updatedAt)}
                </td>
                <td className="px-3 py-2.5">
                  {row.featured ? (
                    <Star className="size-4 fill-primary text-primary" />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {row.readingTimeMin}m
                </td>
                <td className="px-3 py-2.5 text-right">
                  <div className="flex justify-end gap-1">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/dashboard/articles/${row.id}`}>Edit</Link>
                    </Button>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/dashboard/articles/${row.id}/preview`}>
                        Preview
                      </Link>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </AdminDataTable>

          <p className="mt-4 text-sm text-muted-foreground">
            Showing {initial.items.length} of {initial.total}
          </p>
        </>
      )}

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete selected articles?"
        description="This permanently removes the selected articles. This cannot be undone."
        confirmLabel="Delete"
        pending={pending}
        onConfirm={() => runBulk("delete")}
      />
    </div>
  )
}
