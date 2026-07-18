"use client"

import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"

import type { MediaAsset } from "@/services/media/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * Reusable Media Picker — single implementation for editors + AI Studio handoffs.
 * Search, filter (images), preview, select, replace, remove.
 */
export function MediaPicker({
  value,
  onChange,
  label = "Media",
  allowClear = true,
}: {
  value?: string | null
  onChange: (url: string | null, asset?: MediaAsset | null) => void
  label?: string
  allowClear?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [pending, startTransition] = useTransition()
  const [preview, setPreview] = useState<MediaAsset | null>(null)

  useEffect(() => {
    if (!open) return
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/dashboard/media?query=${encodeURIComponent(query)}&mimePrefix=image/`
        )
        const json = (await res.json()) as {
          data?: MediaAsset[]
          error?: { message?: string }
        }
        if (json.error) {
          toast.error(json.error.message || "Failed to load media")
          return
        }
        setAssets(json.data ?? [])
      } catch {
        toast.error("Failed to load media")
      }
    })
  }, [open, query])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setOpen((v) => !v)}
          >
            {value ? "Replace" : "Select"}
          </Button>
          {allowClear && value ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                onChange(null, null)
                setPreview(null)
              }}
            >
              Remove
            </Button>
          ) : null}
        </div>
      </div>

      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="max-h-32 w-full rounded-lg border border-border object-cover"
        />
      ) : (
        <p className="text-xs text-muted-foreground">No media selected</p>
      )}

      {open ? (
        <div className="rounded-xl border border-border bg-background p-3 shadow-sm">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search library…"
            className="mb-3"
            aria-label="Search media picker"
          />
          {pending && assets.length === 0 ? (
            <p className="text-xs text-muted-foreground">Loading…</p>
          ) : (
            <ul className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
              {assets.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    className={`overflow-hidden rounded-lg border ${
                      preview?.id === a.id
                        ? "border-primary"
                        : "border-border"
                    }`}
                    onClick={() => setPreview(a)}
                    onDoubleClick={() => {
                      onChange(a.url, a)
                      setOpen(false)
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.url}
                      alt={a.altText || a.filename}
                      className="aspect-square w-full object-cover"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {preview ? preview.filename : "Double-click or Confirm to select"}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!preview}
                onClick={() => {
                  if (!preview) return
                  onChange(preview.url, preview)
                  setOpen(false)
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
