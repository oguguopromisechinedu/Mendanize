"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type {
  MediaCategoryRecord,
  MediaCollectionRecord,
} from "@/services/media/types"
import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  deleteCategoryAction,
  deleteCollectionAction,
  saveCategoryAction,
  saveCollectionAction,
} from "../actions/actions"
import { MediaCmsNav } from "./media-cms-nav"

export function MediaCategoriesView({
  categories,
}: {
  categories: MediaCategoryRecord[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  function create() {
    if (!name.trim()) return
    startTransition(async () => {
      const res = await saveCategoryAction({
        name: name.trim(),
        description: description || null,
      })
      if (!res.ok) toast.error(res.message)
      else {
        toast.success(res.message)
        setName("")
        setDescription("")
        router.refresh()
      }
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Media categories"
        description="Images, Logos, Icons, Documents, Video/Audio — organize by type."
      />
      <MediaCmsNav />
      <AdminPanel title="Add category">
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="max-w-xs"
          />
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="max-w-sm flex-1"
          />
          <Button size="sm" disabled={pending} onClick={create}>
            Create
          </Button>
        </div>
      </AdminPanel>
      <AdminPanel title="Categories">
        <ul className="divide-y divide-border">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 py-3 text-sm"
            >
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {c.slug} · {c.assetCount} assets
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const res = await deleteCategoryAction(c.id)
                    if (!res.ok) toast.error(res.message)
                    else {
                      toast.success(res.message)
                      router.refresh()
                    }
                  })
                }
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      </AdminPanel>
    </div>
  )
}

export function MediaCollectionsView({
  collections,
}: {
  collections: MediaCollectionRecord[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [name, setName] = useState("")
  const [renameId, setRenameId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")

  function create() {
    if (!name.trim()) return
    startTransition(async () => {
      const res = await saveCollectionAction({ name: name.trim() })
      if (!res.ok) toast.error(res.message)
      else {
        toast.success(res.message)
        setName("")
        router.refresh()
      }
    })
  }

  function rename() {
    if (!renameId || !renameValue.trim()) return
    startTransition(async () => {
      const res = await saveCollectionAction(
        { name: renameValue.trim() },
        renameId
      )
      if (!res.ok) toast.error(res.message)
      else {
        toast.success(res.message)
        setRenameId(null)
        router.refresh()
      }
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Media collections"
        description="Homepage, Articles, Guides, AI Tools, Branding, Marketing — move assets between them from the library."
      />
      <MediaCmsNav />
      <AdminPanel title="Add collection">
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="max-w-xs"
          />
          <Button size="sm" disabled={pending} onClick={create}>
            Create
          </Button>
        </div>
      </AdminPanel>
      <AdminPanel title="Collections">
        <ul className="divide-y divide-border">
          {collections.map((c) => (
            <li key={c.id} className="space-y-2 py-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.slug} · {c.assetCount} assets
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setRenameId(c.id)
                      setRenameValue(c.name)
                    }}
                  >
                    Rename
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const res = await deleteCollectionAction(c.id)
                        if (!res.ok) toast.error(res.message)
                        else {
                          toast.success(res.message)
                          router.refresh()
                        }
                      })
                    }
                  >
                    Delete
                  </Button>
                </div>
              </div>
              {renameId === c.id ? (
                <div className="flex gap-2">
                  <Label className="sr-only">Rename</Label>
                  <Input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                  />
                  <Button size="sm" disabled={pending} onClick={rename}>
                    Save
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </AdminPanel>
    </div>
  )
}
