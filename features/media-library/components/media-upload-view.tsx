"use client"

import { useCallback, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { MediaLibraryOptions } from "../types/types"
import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { uploadMediaAction } from "../actions/actions"
import { ALLOWED_UPLOAD_MIME } from "../constants/constants"
import { MediaCmsNav } from "./media-cms-nav"

type QueueItem = {
  id: string
  filename: string
  mimeType: string
  sizeBytes: number
  status: "queued" | "uploading" | "done" | "error" | "cancelled"
  progress: number
  url?: string
  error?: string
}

export function MediaUploadView({ options }: { options: MediaLibraryOptions }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [urlPaste, setUrlPaste] = useState("")
  const [categoryId, setCategoryId] = useState(
    options.categories[0]?.id ?? ""
  )
  const [collectionId, setCollectionId] = useState("")
  const [dragOver, setDragOver] = useState(false)

  const enqueueFiles = useCallback((files: FileList | File[]) => {
    const list = Array.from(files)
    const next: QueueItem[] = []
    for (const file of list) {
      if (
        !ALLOWED_UPLOAD_MIME.includes(
          file.type as (typeof ALLOWED_UPLOAD_MIME)[number]
        ) &&
        !file.type.startsWith("image/")
      ) {
        toast.error(`Skipped ${file.name}: type not allowed`)
        continue
      }
      next.push({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        filename: file.name,
        mimeType: file.type || "image/webp",
        sizeBytes: file.size,
        status: "queued",
        progress: 0,
      })
    }
    setQueue((prev) => [...next, ...prev])
  }, [])

  function cancelItem(id: string) {
    setQueue((prev) =>
      prev.map((q) =>
        q.id === id && (q.status === "queued" || q.status === "uploading")
          ? { ...q, status: "cancelled", progress: 0 }
          : q
      )
    )
  }

  function retryItem(id: string) {
    setQueue((prev) =>
      prev.map((q) =>
        q.id === id
          ? { ...q, status: "queued", progress: 0, error: undefined }
          : q
      )
    )
  }

  function uploadQueued() {
    startTransition(async () => {
      const pendingItems = queue.filter((q) => q.status === "queued")
      for (const item of pendingItems) {
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: "uploading", progress: 40 }
              : q
          )
        )
        // Architecture prepared for cloud storage — placeholder provider + seed URL.
        const res = await uploadMediaAction({
          filename: item.filename,
          mimeType: item.mimeType,
          sizeBytes: item.sizeBytes,
          categoryId: categoryId || null,
          collectionId: collectionId || null,
        })
        if (!res.ok) {
          setQueue((prev) =>
            prev.map((q) =>
              q.id === item.id
                ? {
                    ...q,
                    status: "error",
                    progress: 0,
                    error: res.message,
                  }
                : q
            )
          )
          toast.error(res.message)
          continue
        }
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? {
                  ...q,
                  status: "done",
                  progress: 100,
                  url: res.data?.url,
                }
              : q
          )
        )
      }
      router.refresh()
    })
  }

  function uploadFromUrl() {
    if (!urlPaste.trim()) {
      toast.error("Paste an image URL")
      return
    }
    startTransition(async () => {
      const filename =
        urlPaste.split("/").pop()?.split("?")[0] || `remote-${Date.now()}.webp`
      const res = await uploadMediaAction({
        filename,
        mimeType: "image/webp",
        url: urlPaste.trim(),
        categoryId: categoryId || null,
        collectionId: collectionId || null,
      })
      if (!res.ok) toast.error(res.message)
      else {
        toast.success(res.message)
        setUrlPaste("")
        if (res.data?.id) router.push(`/dashboard/media/${res.data.id}`)
        else router.refresh()
      }
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Upload media"
        description="Drag-and-drop or paste a URL. Cloud storage (Supabase) is prepared via storageProvider/storageKey."
        actions={
          <Button
            size="sm"
            disabled={pending || !queue.some((q) => q.status === "queued")}
            onClick={uploadQueued}
          >
            Upload queue
          </Button>
        }
      />
      <MediaCmsNav />

      <AdminPanel title="Destination">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">None</option>
              {options.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Collection</Label>
            <Select
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
            >
              <option value="">None</option>
              {options.collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </AdminPanel>

      <AdminPanel title="Dropzone">
        <div
          role="button"
          tabIndex={0}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            if (e.dataTransfer.files?.length) enqueueFiles(e.dataTransfer.files)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              document.getElementById("media-file-input")?.click()
            }
          }}
          className={`flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-8 text-center text-sm ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border text-muted-foreground"
          }`}
          onClick={() => document.getElementById("media-file-input")?.click()}
        >
          <p>Drop images here or click to browse</p>
          <p className="mt-1 text-xs">JPEG, PNG, WebP, GIF, SVG</p>
          <input
            id="media-file-input"
            type="file"
            accept={ALLOWED_UPLOAD_MIME.join(",")}
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) enqueueFiles(e.target.files)
              e.target.value = ""
            }}
          />
        </div>
      </AdminPanel>

      <AdminPanel title="Or paste image URL">
        <div className="flex flex-wrap gap-2">
          <Input
            value={urlPaste}
            onChange={(e) => setUrlPaste(e.target.value)}
            placeholder="https://…"
            className="min-w-[16rem] flex-1"
          />
          <Button
            type="button"
            size="sm"
            disabled={pending}
            onClick={uploadFromUrl}
          >
            Add URL
          </Button>
        </div>
      </AdminPanel>

      {queue.length > 0 ? (
        <AdminPanel title="Upload queue">
          <ul className="space-y-3">
            {queue.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{item.filename}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.status}
                    {item.error ? ` — ${item.error}` : ""}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <div className="mt-2 flex gap-2">
                  {(item.status === "queued" ||
                    item.status === "uploading") && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => cancelItem(item.id)}
                    >
                      Cancel
                    </Button>
                  )}
                  {item.status === "error" || item.status === "cancelled" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => retryItem(item.id)}
                    >
                      Retry
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </AdminPanel>
      ) : null}
    </div>
  )
}
