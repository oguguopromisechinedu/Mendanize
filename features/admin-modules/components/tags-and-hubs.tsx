"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { ListResult, TagAdminRecord } from "@/services/admin/types"
import {
  AdminActionToolbar,
  AdminDataTable,
  AdminEmptyState,
  AdminPageHeader,
  ConfirmationDialog,
} from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  createTagAction,
  deleteTagsAction,
  mergeTagsAction,
  updateTagAction,
} from "../actions/actions"

export function TagsListView({ initial }: { initial: ListResult<TagAdminRecord> }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [selected, setSelected] = useState<string[]>([])
  const [query, setQuery] = useState("")
  const [name, setName] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)

  function search() {
    const params = new URLSearchParams()
    if (query.trim()) params.set("query", query.trim())
    router.push(params.toString() ? `/dashboard/tags?${params}` : "/dashboard/tags")
  }

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Tags"
        description="Vocabulary for articles, tools, and discovery."
      />

      <AdminActionToolbar>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Search tags…"
          className="h-9 w-full max-w-xs rounded-lg border border-input bg-transparent px-3 text-sm"
        />
        <Button size="sm" variant="outline" onClick={search}>
          Search
        </Button>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New tag name"
          className="h-9 w-full max-w-xs rounded-lg border border-input bg-transparent px-3 text-sm"
        />
        <Button
          size="sm"
          disabled={pending || !name.trim()}
          onClick={() =>
            start(async () => {
              const res = await createTagAction({ name })
              if (!res.ok) toast.error(res.message)
              else {
                toast.success(res.message)
                setName("")
                router.refresh()
              }
            })
          }
        >
          Add tag
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={pending || selected.length !== 2}
          onClick={() =>
            start(async () => {
              const [sourceId, targetId] = selected
              const res = await mergeTagsAction({ sourceId, targetId })
              if (!res.ok) toast.error(res.message)
              else {
                toast.success(res.message)
                setSelected([])
                router.refresh()
              }
            })
          }
        >
          Merge selected
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
          title="No tags yet"
          description="Create tags to organize content across articles and tools."
        />
      ) : (
        <AdminDataTable headers={["", "Name", "Slug", "Articles", "Tools", "Posts", ""]}>
          {initial.items.map((tag) => (
            <tr key={tag.id} className="border-b border-border/60">
              <td className="px-3 py-2">
                <Checkbox
                  checked={selected.includes(tag.id)}
                  onCheckedChange={(checked) =>
                    setSelected((prev) =>
                      checked
                        ? [...prev, tag.id]
                        : prev.filter((id) => id !== tag.id)
                    )
                  }
                />
              </td>
              <td className="px-3 py-2 font-medium">{tag.name}</td>
              <td className="px-3 py-2 text-muted-foreground">{tag.slug}</td>
              <td className="px-3 py-2">{tag.articleCount}</td>
              <td className="px-3 py-2">{tag.toolCount}</td>
              <td className="px-3 py-2">{tag.postCount}</td>
              <td className="px-3 py-2">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() => {
                    const next = window.prompt("Rename tag", tag.name)
                    if (!next?.trim()) return
                    start(async () => {
                      const res = await updateTagAction(tag.id, { name: next })
                      if (!res.ok) toast.error(res.message)
                      else {
                        toast.success(res.message)
                        router.refresh()
                      }
                    })
                  }}
                >
                  Rename
                </Button>
              </td>
            </tr>
          ))}
        </AdminDataTable>
      )}

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete tags?"
        description="Joined content will lose these tags. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() =>
          start(async () => {
            const res = await deleteTagsAction({ ids: selected })
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
      <p className="mt-4 text-xs text-muted-foreground">
        {initial.total} tag(s). Select exactly two tags to merge (first → second).
      </p>
    </div>
  )
}

export function CreateHubView() {
  const items = [
    { label: "Article", href: "/dashboard/articles/new" },
    { label: "Guide", href: "/dashboard/guides/new" },
    { label: "AI Tool", href: "/dashboard/ai-tools/new" },
    { label: "Category", href: "/dashboard/categories/new" },
    { label: "Topic", href: "/dashboard/topics/new" },
    { label: "Page", href: "/dashboard/pages" },
    { label: "Upload media", href: "/dashboard/media/upload" },
    { label: "AI article draft", href: "/dashboard/ai-studio/article" },
  ]
  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        title="Create"
        description="Jump into a content type or studio workflow."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg border border-border px-4 py-3 text-sm font-medium transition hover:bg-muted/40"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

export function ContentHubView() {
  const items = [
    { label: "Articles", href: "/dashboard/articles", desc: "Long-form CMS" },
    { label: "Guides", href: "/dashboard/guides", desc: "Structured lessons" },
    { label: "AI Tools", href: "/dashboard/ai-tools", desc: "Directory listings" },
    { label: "Media", href: "/dashboard/media", desc: "Assets library" },
    { label: "Pages", href: "/dashboard/pages", desc: "Static / marketing" },
    { label: "Tags", href: "/dashboard/tags", desc: "Shared vocabulary" },
  ]
  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        title="Content"
        description="Open a content module. This hub replaces the legacy catch-all."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg border border-border px-4 py-3 transition hover:bg-muted/40"
          >
            <p className="text-sm font-medium">{item.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
