"use client"

import Link from "next/link"
import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Star } from "lucide-react"

import type { ToolListResult, ToolStatusValue } from "@/services/content/types"
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
  bulkToolStatusAction,
  deleteToolsAction,
} from "../actions/actions"
import {
  TOOL_PRICING_LABELS,
  TOOL_SOURCE_LABELS,
} from "../constants/constants"

const FILTER_TABS: Array<{
  key: ToolStatusValue | "ALL"
  label: string
  path: string
}> = [
  { key: "ALL", label: "All", path: "" },
  { key: "DRAFT", label: "Drafts", path: "/drafts" },
  { key: "PUBLISHED", label: "Published", path: "/published" },
  { key: "ARCHIVED", label: "Archived", path: "/archived" },
]

export function ToolListView({
  initial,
  statusFilter = "ALL",
  title = "AI Tools",
  description = "Educational Discover directory — curated tools, not AI Studio generations.",
  basePath = "/dashboard/ai-tools",
}: {
  initial: ToolListResult
  statusFilter?: ToolStatusValue | "ALL"
  title?: string
  description?: string
  basePath?: string
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
    const tab = FILTER_TABS.find((t) => t.key === statusFilter)
    const base = `${basePath}${tab?.path ?? ""}`
    const qs = params.toString()
    router.push(qs ? `${base}?${qs}` : base)
  }

  function runBulk(action: "delete" | "publish" | "archive") {
    if (!selected.length) {
      toast.error("Select at least one tool")
      return
    }
    startTransition(async () => {
      if (action === "delete") {
        const res = await deleteToolsAction({ ids: selected })
        if (!res.ok) toast.error(res.message)
        else {
          toast.success(res.message)
          setSelected([])
          router.refresh()
        }
        setConfirmOpen(false)
        return
      }
      const res = await bulkToolStatusAction({
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
            <Link href={`${basePath}/new`}>Add tool</Link>
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
              <Link href={`${basePath}${tab.path}`}>{tab.label}</Link>
            </Button>
          ))}
        </div>
      </AdminFilterBar>

      <AdminActionToolbar>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
          placeholder="Search tools…"
          className="h-9 w-full max-w-xs rounded-lg border border-input bg-transparent px-3 text-sm"
          aria-label="Search tools"
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
          title="No tools yet"
          description="Curate an educational AI tool for the Discover directory."
          actionLabel="Add tool"
          href={`${basePath}/new`}
        />
      ) : (
        <AdminDataTable
          headers={[
            "",
            "Logo",
            "Name",
            "Source",
            "Developer",
            "Pricing",
            "Status",
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
            <td colSpan={10} className="px-3 py-2 text-xs text-muted-foreground">
              {initial.total} total · {TOOL_STATUS_LABELS.DRAFT} filters available
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
                {row.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={row.logoUrl}
                    alt=""
                    className="size-10 rounded object-contain"
                  />
                ) : (
                  <span className="inline-block size-10 rounded border border-border bg-muted/40" />
                )}
              </td>
              <td className="px-3 py-2.5">
                <Link
                  href={`${basePath}/${row.id}`}
                  className="inline-flex items-center gap-1.5 font-medium hover:text-primary"
                >
                  {row.name}
                  {row.featured ? (
                    <Star className="size-3.5 fill-primary text-primary" />
                  ) : null}
                  {row.verified ? (
                    <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      Verified
                    </span>
                  ) : null}
                </Link>
              </td>
              <td className="px-3 py-2.5 text-xs text-muted-foreground">
                {TOOL_SOURCE_LABELS[row.source] ?? row.source}
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {row.developer ?? "—"}
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {TOOL_PRICING_LABELS[row.pricing]}
              </td>
              <td className="px-3 py-2.5">
                <StatusBadge status={row.status.toLowerCase()} />
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {new Date(row.updatedAt).toLocaleDateString()}
              </td>
              <td className="px-3 py-2.5 text-right">
                <div className="flex justify-end gap-1">
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`${basePath}/${row.id}`}>Edit</Link>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`${basePath}/${row.id}/preview`}>
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
        title="Delete selected tools?"
        description="Features, images, and taxonomy links are removed with the tool."
        confirmLabel="Delete"
        pending={pending}
        onConfirm={() => runBulk("delete")}
      />
    </div>
  )
}
