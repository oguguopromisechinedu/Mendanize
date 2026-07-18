"use client"

import Link from "next/link"
import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { LayoutGrid, List, Star } from "lucide-react"

import type { MediaListResult } from "@/services/media/types"
import type { MediaLibraryOptions } from "../types/types"
import {
  AdminActionToolbar,
  AdminEmptyState,
  AdminPageHeader,
  ConfirmationDialog,
  StatusBadge,
} from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select } from "@/components/ui/select"
import {
  bulkAssetStatusAction,
  deleteAssetsAction,
  moveToCollectionAction,
} from "../actions/actions"
import { ASSET_STATUS_LABELS, formatBytes } from "../constants/constants"
import { MediaCmsNav } from "./media-cms-nav"

export function MediaLibraryView({
  initial,
  options,
  title = "Media Library",
  description = "Central asset repository for images and future media types.",
  basePath = "/dashboard/media",
}: {
  initial: MediaListResult
  options: MediaLibraryOptions
  title?: string
  description?: string
  basePath?: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [selected, setSelected] = useState<string[]>([])
  const [query, setQuery] = useState("")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [moveTo, setMoveTo] = useState("")

  const allIds = useMemo(() => initial.items.map((i) => i.id), [initial.items])
  const allSelected =
    allIds.length > 0 && allIds.every((id) => selected.includes(id))

  function runSearch() {
    const params = new URLSearchParams()
    if (query.trim()) params.set("query", query.trim())
    const qs = params.toString()
    router.push(qs ? `${basePath}?${qs}` : basePath)
  }

  function runBulk(action: "delete" | "archive") {
    if (!selected.length) {
      toast.error("Select at least one asset")
      return
    }
    startTransition(async () => {
      if (action === "delete") {
        const res = await deleteAssetsAction({ ids: selected })
        if (!res.ok) toast.error(res.message)
        else {
          toast.success(res.message)
          setSelected([])
          router.refresh()
        }
        setConfirmOpen(false)
        return
      }
      const res = await bulkAssetStatusAction({
        ids: selected,
        status: "ARCHIVED",
      })
      if (!res.ok) toast.error(res.message)
      else {
        toast.success(res.message)
        setSelected([])
        router.refresh()
      }
    })
  }

  function moveSelected() {
    if (!selected.length || !moveTo) {
      toast.error("Select assets and a collection")
      return
    }
    startTransition(async () => {
      const res = await moveToCollectionAction({
        ids: selected,
        collectionId: moveTo,
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
            <Link href="/dashboard/media/upload">Upload</Link>
          </Button>
        }
      />
      <MediaCmsNav />

      <AdminActionToolbar>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
          placeholder="Search filename, alt, tags…"
          className="h-9 w-full max-w-xs rounded-lg border border-input bg-transparent px-3 text-sm"
          aria-label="Search media"
        />
        <Button type="button" size="sm" variant="outline" onClick={runSearch}>
          Search
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setView("grid")}
          aria-pressed={view === "grid"}
        >
          <LayoutGrid className="size-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setView("list")}
          aria-pressed={view === "list"}
        >
          <List className="size-4" />
        </Button>
        <Select
          className="w-44"
          value={moveTo}
          onChange={(e) => setMoveTo(e.target.value)}
          aria-label="Move to collection"
        >
          <option value="">Move to collection…</option>
          {options.collections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending || !selected.length || !moveTo}
          onClick={moveSelected}
        >
          Move
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

      <div className="mb-3 flex items-center gap-3 text-sm text-muted-foreground">
        <Checkbox
          checked={allSelected}
          onCheckedChange={(v) => setSelected(Boolean(v) ? allIds : [])}
          aria-label="Select all"
        />
        <span>
          {initial.total} assets · {ASSET_STATUS_LABELS.ACTIVE} shown
        </span>
      </div>

      {initial.items.length === 0 ? (
        <AdminEmptyState
          title="No assets yet"
          description="Upload images or save from AI Studio."
          actionLabel="Upload"
          href="/dashboard/media/upload"
        />
      ) : view === "grid" ? (
        <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {initial.items.map((item) => (
            <li
              key={item.id}
              className="overflow-hidden rounded-xl border border-border bg-surface/40"
            >
              <div className="relative aspect-[4/3] bg-muted/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.altText || ""}
                  className="size-full object-cover"
                />
                <div className="absolute left-2 top-2">
                  <Checkbox
                    checked={selected.includes(item.id)}
                    onCheckedChange={(v) =>
                      setSelected((prev) =>
                        Boolean(v)
                          ? [...new Set([...prev, item.id])]
                          : prev.filter((x) => x !== item.id)
                      )
                    }
                    aria-label={`Select ${item.filename}`}
                  />
                </div>
              </div>
              <div className="space-y-1 p-3">
                <Link
                  href={`/dashboard/media/${item.id}`}
                  className="inline-flex items-center gap-1 text-sm font-medium hover:text-primary"
                >
                  {item.filename}
                  {item.featured ? (
                    <Star className="size-3.5 fill-primary text-primary" />
                  ) : null}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {item.mimeType} · {formatBytes(item.sizeBytes)}
                  {item.width && item.height
                    ? ` · ${item.width}×${item.height}`
                    : ""}
                </p>
                <StatusBadge status={item.status.toLowerCase()} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2" />
                <th className="px-3 py-2">Thumb</th>
                <th className="px-3 py-2">Filename</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Size</th>
                <th className="px-3 py-2">Dims</th>
                <th className="px-3 py-2">Uploaded</th>
                <th className="px-3 py-2">Used</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {initial.items.map((item) => (
                <tr key={item.id} className="border-t border-border">
                  <td className="px-3 py-2">
                    <Checkbox
                      checked={selected.includes(item.id)}
                      onCheckedChange={(v) =>
                        setSelected((prev) =>
                          Boolean(v)
                            ? [...new Set([...prev, item.id])]
                            : prev.filter((x) => x !== item.id)
                        )
                      }
                      aria-label={`Select ${item.filename}`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt=""
                      className="size-10 rounded object-cover"
                    />
                  </td>
                  <td className="px-3 py-2 font-medium">
                    <Link href={`/dashboard/media/${item.id}`}>
                      {item.filename}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {item.mimeType}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {formatBytes(item.sizeBytes)}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {item.width && item.height
                      ? `${item.width}×${item.height}`
                      : "—"}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {item.usageCount}
                    {item.lastUsedAt
                      ? ` · ${new Date(item.lastUsedAt).toLocaleDateString()}`
                      : ""}
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={item.status.toLowerCase()} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/dashboard/media/${item.id}`}>Edit</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete selected assets?"
        description="Removes library records. Cloud objects are not deleted until storage is wired."
        confirmLabel="Delete"
        pending={pending}
        onConfirm={() => runBulk("delete")}
      />
    </div>
  )
}
