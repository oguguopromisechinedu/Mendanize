"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { ListResult, StaticPageRecord } from "@/services/admin/types"
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
  createPageAction,
  deletePagesAction,
  updatePageAction,
} from "../actions/actions"

export function PagesListView({
  initial,
}: {
  initial: ListResult<StaticPageRecord>
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [selected, setSelected] = useState<string[]>([])
  const [query, setQuery] = useState("")
  const [title, setTitle] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)

  function search() {
    const params = new URLSearchParams()
    if (query.trim()) params.set("query", query.trim())
    router.push(
      params.toString() ? `/dashboard/pages?${params}` : "/dashboard/pages"
    )
  }

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Pages"
        description="Static and marketing pages with SEO fields."
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
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New page title"
          className="h-9 w-full max-w-xs rounded-lg border border-input bg-transparent px-3 text-sm"
        />
        <Button
          size="sm"
          disabled={pending || !title.trim()}
          onClick={() =>
            start(async () => {
              const res = await createPageAction({
                title,
                content: `<p>${title}</p>`,
                status: "DRAFT",
              })
              if (!res.ok) toast.error(res.message)
              else {
                toast.success(res.message)
                setTitle("")
                router.refresh()
              }
            })
          }
        >
          Create page
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
          title="No pages"
          description="Create About, Contact, and other marketing pages here."
        />
      ) : (
        <AdminDataTable headers={["", "Title", "Slug", "Status", "Updated", ""]}>
          {initial.items.map((page) => (
            <tr key={page.id} className="border-b border-border/60">
              <td className="px-3 py-2">
                <Checkbox
                  checked={selected.includes(page.id)}
                  onCheckedChange={(checked) =>
                    setSelected((prev) =>
                      checked
                        ? [...prev, page.id]
                        : prev.filter((id) => id !== page.id)
                    )
                  }
                />
              </td>
              <td className="px-3 py-2 font-medium">{page.title}</td>
              <td className="px-3 py-2 text-muted-foreground">/{page.slug}</td>
              <td className="px-3 py-2">
                <StatusBadge status={page.status} />
              </td>
              <td className="px-3 py-2 text-xs text-muted-foreground">
                {new Date(page.updatedAt).toLocaleString()}
              </td>
              <td className="px-3 py-2">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      const next =
                        page.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"
                      const res = await updatePageAction(page.id, {
                        status: next,
                      })
                      if (!res.ok) toast.error(res.message)
                      else {
                        toast.success(res.message)
                        router.refresh()
                      }
                    })
                  }
                >
                  {page.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                </Button>
              </td>
            </tr>
          ))}
        </AdminDataTable>
      )}

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete pages?"
        description="Selected pages will be permanently removed."
        confirmLabel="Delete"
        onConfirm={() =>
          start(async () => {
            const res = await deletePagesAction({ ids: selected })
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
