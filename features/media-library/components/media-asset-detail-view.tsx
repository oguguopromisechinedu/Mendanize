"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { MediaAssetRecord } from "@/services/media/types"
import type { MediaLibraryOptions } from "../types/types"
import {
  AdminPageHeader,
  AdminPanel,
  StatusBadge,
} from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { updateAssetAction } from "../actions/actions"
import {
  ASSET_STATUSES,
  ASSET_STATUS_LABELS,
  MEDIA_VISIBILITIES,
  MEDIA_VISIBILITY_LABELS,
  formatBytes,
} from "../constants/constants"
import { MediaCmsNav } from "./media-cms-nav"

export function MediaAssetDetailView({
  asset,
  options,
}: {
  asset: MediaAssetRecord
  options: MediaLibraryOptions
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState({
    filename: asset.filename,
    altText: asset.altText ?? "",
    caption: asset.caption ?? "",
    description: asset.description ?? "",
    copyright: asset.copyright ?? "",
    visibility: asset.visibility,
    featured: asset.featured,
    status: asset.status,
    categoryId: asset.categoryId ?? "",
    collectionIds: asset.collectionIds,
    tags: asset.tagNames.join("\n"),
  })

  function save() {
    startTransition(async () => {
      const res = await updateAssetAction(asset.id, {
        filename: form.filename,
        altText: form.altText || null,
        caption: form.caption || null,
        description: form.description || null,
        copyright: form.copyright || null,
        visibility: form.visibility,
        featured: form.featured,
        status: form.status,
        categoryId: form.categoryId || null,
        collectionIds: form.collectionIds,
        tagNames: form.tags
          .split("\n")
          .map((t) => t.trim())
          .filter(Boolean),
      })
      if (!res.ok) toast.error(res.message)
      else {
        toast.success(res.message)
        router.refresh()
      }
    })
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AdminPageHeader
        title={asset.filename}
        description="Asset details — metadata, taxonomy, and status."
        actions={
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/media">Back</Link>
            </Button>
            <Button size="sm" disabled={pending} onClick={save}>
              Save
            </Button>
          </div>
        }
      />
      <MediaCmsNav />

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset.url}
            alt={form.altText || ""}
            className="max-h-80 w-full rounded-xl border border-border object-contain bg-muted/20"
          />
          <AdminPanel title="Editable metadata">
            <div className="space-y-3">
              {(
                [
                  ["filename", "Filename"],
                  ["altText", "Alt text"],
                  ["caption", "Caption"],
                  ["copyright", "Copyright"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-1.5">
                  <Label>{label}</Label>
                  <Input
                    value={form[key]}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                  />
                </div>
              ))}
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tags (one per line)</Label>
                <Textarea
                  rows={3}
                  value={form.tags}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, tags: e.target.value }))
                  }
                />
              </div>
            </div>
          </AdminPanel>
        </div>

        <aside className="space-y-4">
          <AdminPanel title="Properties">
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                Status: <StatusBadge status={asset.status.toLowerCase()} />
              </li>
              <li>Type: {asset.mimeType}</li>
              <li>Size: {formatBytes(asset.sizeBytes)}</li>
              <li>
                Dimensions:{" "}
                {asset.width && asset.height
                  ? `${asset.width}×${asset.height}`
                  : "—"}
              </li>
              <li>Usage count: {asset.usageCount}</li>
              <li>
                Uploaded: {new Date(asset.createdAt).toLocaleString()}
              </li>
              <li>
                Updated: {new Date(asset.updatedAt).toLocaleString()}
              </li>
              <li>
                Last used:{" "}
                {asset.lastUsedAt
                  ? new Date(asset.lastUsedAt).toLocaleString()
                  : "—"}
              </li>
              <li className="break-all text-xs">
                Storage: {asset.storageProvider}
                {asset.storageKey ? ` · ${asset.storageKey}` : ""}
              </li>
            </ul>
          </AdminPanel>

          <AdminPanel title="Publishing">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      status: e.target.value as typeof form.status,
                    }))
                  }
                >
                  {ASSET_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {ASSET_STATUS_LABELS[s]}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Visibility</Label>
                <Select
                  value={form.visibility}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      visibility: e.target
                        .value as typeof form.visibility,
                    }))
                  }
                >
                  {MEDIA_VISIBILITIES.map((v) => (
                    <option key={v} value={v}>
                      {MEDIA_VISIBILITY_LABELS[v]}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Featured</Label>
                <Switch
                  checked={form.featured}
                  onCheckedChange={(v) =>
                    setForm((prev) => ({ ...prev, featured: Boolean(v) }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      categoryId: e.target.value,
                    }))
                  }
                >
                  <option value="">None</option>
                  {options.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </AdminPanel>

          <AdminPanel title="Collections">
            <ul className="space-y-2">
              {options.collections.map((c) => (
                <li key={c.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={form.collectionIds.includes(c.id)}
                    onCheckedChange={(v) =>
                      setForm((prev) => ({
                        ...prev,
                        collectionIds: Boolean(v)
                          ? [...new Set([...prev.collectionIds, c.id])]
                          : prev.collectionIds.filter((x) => x !== c.id),
                      }))
                    }
                    aria-label={c.name}
                  />
                  {c.name}
                </li>
              ))}
            </ul>
          </AdminPanel>
        </aside>
      </div>
    </div>
  )
}
