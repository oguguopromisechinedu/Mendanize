"use client"

import Link from "next/link"
import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Star } from "lucide-react"

import type { CategoryListResult } from "@/services/content/types"
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
  bulkCategoryStatusAction,
  deleteCategoriesAction,
} from "../actions/actions"

export function CategoryListView({ initial }: { initial: CategoryListResult }) {
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
    const qs = params.toString()
    router.push(qs ? `/dashboard/categories?${qs}` : "/dashboard/categories")
  }

  function runBulk(action: "delete" | "hide" | "activate") {
    if (!selected.length) {
      toast.error("Select at least one category")
      return
    }
    startTransition(async () => {
      if (action === "delete") {
        const res = await deleteCategoriesAction({ ids: selected })
        if (!res.ok) toast.error(res.message)
        else {
          toast.success(res.message)
          setSelected([])
          router.refresh()
        }
        setConfirmOpen(false)
        return
      }
      const res = await bulkCategoryStatusAction({
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
        title="Categories"
        description="Top-level taxonomy for Articles, Guides, and AI Tools."
        actions={
          <Button asChild size="sm">
            <Link href="/dashboard/categories/new">Create category</Link>
          </Button>
        }
      />

      <AdminActionToolbar>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
          placeholder="Search categories…"
          className="h-9 w-full max-w-xs rounded-lg border border-input bg-transparent px-3 text-sm"
          aria-label="Search categories"
        />
        <Button type="button" size="sm" variant="outline" onClick={runSearch}>
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
          title="No categories yet"
          description="Create the first category so topics have a parent."
          actionLabel="Create category"
          href="/dashboard/categories/new"
        />
      ) : (
        <AdminDataTable
          headers={[
            "",
            "Image",
            "Icon",
            "Name",
            "Slug",
            "Topics",
            "Articles",
            "Guides",
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
                {row.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={row.imageUrl}
                    alt=""
                    className="size-8 rounded object-cover"
                  />
                ) : (
                  <span
                    className="inline-block size-8 rounded border border-border"
                    style={{
                      backgroundColor: row.accentColor ?? "transparent",
                    }}
                  />
                )}
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {row.icon ?? "—"}
              </td>
              <td className="px-3 py-2.5">
                <Link
                  href={`/dashboard/categories/${row.id}`}
                  className="inline-flex items-center gap-1.5 font-medium hover:text-primary"
                >
                  {row.name}
                  {row.featured ? (
                    <Star className="size-3.5 fill-primary text-primary" />
                  ) : null}
                </Link>
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">{row.slug}</td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {row.topicCount}
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {row.articleCount}
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {row.guideCount}
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
                    <Link href={`/dashboard/categories/${row.id}/edit`}>
                      Edit
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/dashboard/categories/${row.id}`}>
                      Details
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
        title="Delete selected categories?"
        description="Categories with topics cannot be deleted. Remove or move topics first."
        confirmLabel="Delete"
        pending={pending}
        onConfirm={() => runBulk("delete")}
      />
    </div>
  )
}