"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { CategoryRecord } from "@/services/content/types"
import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard"
import { MediaPicker } from "@/features/media-library"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select } from "@/components/ui/select"
import {
  createCategoryAction,
  updateCategoryAction,
} from "../actions/actions"
import {
  TAXONOMY_STATUSES,
  TAXONOMY_STATUS_LABELS,
} from "../constants/constants"

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

type FormState = {
  name: string
  slug: string
  description: string
  icon: string
  accentColor: string
  status: (typeof TAXONOMY_STATUSES)[number]
  featured: boolean
  displayOrder: string
  seoTitle: string
  seoDescription: string
  focusKeyword: string
  canonicalUrl: string
  imageUrl: string
  imageAlt: string
}

function toForm(category?: CategoryRecord | null): FormState {
  return {
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    description: category?.description ?? "",
    icon: category?.icon ?? "",
    accentColor: category?.accentColor ?? "#E8940C",
    status: category?.status ?? "ACTIVE",
    featured: category?.featured ?? false,
    displayOrder: String(category?.displayOrder ?? 0),
    seoTitle: category?.seoTitle ?? "",
    seoDescription: category?.seoDescription ?? "",
    focusKeyword: category?.focusKeyword ?? "",
    canonicalUrl: category?.canonicalUrl ?? "",
    imageUrl: category?.imageUrl ?? "",
    imageAlt: category?.imageAlt ?? "",
  }
}

export function CategoryEditorForm({
  category,
  mediaPlaceholders: _mediaPlaceholders,
}: {
  category?: CategoryRecord | null
  mediaPlaceholders: Array<{ id: string; filename: string; url: string }>
}) {
  const router = useRouter()
  const isEdit = Boolean(category?.id)
  const [form, setForm] = useState(() => toForm(category))
  const [slugTouched, setSlugTouched] = useState(Boolean(category?.slug))
  const [pending, startTransition] = useTransition()

  function patch(partial: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...partial }))
  }

  function save() {
    startTransition(async () => {
      const body = {
        name: form.name,
        slug: form.slug || undefined,
        description: form.description || null,
        icon: form.icon || null,
        accentColor: form.accentColor || null,
        status: form.status,
        featured: form.featured,
        displayOrder: Number(form.displayOrder) || 0,
        seoTitle: form.seoTitle || null,
        seoDescription: form.seoDescription || null,
        focusKeyword: form.focusKeyword || null,
        canonicalUrl: form.canonicalUrl || null,
        imageUrl: form.imageUrl || null,
        imageAlt: form.imageAlt || null,
      }
      const res = isEdit
        ? await updateCategoryAction(category!.id, body)
        : await createCategoryAction(body)
      if (!res.ok) {
        toast.error(res.message)
        return
      }
      toast.success(res.message)
      if (!isEdit && res.data?.id) {
        router.push(`/dashboard/categories/${res.data.id}`)
        router.refresh()
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title={isEdit ? "Edit category" : "Create category"}
        description="Categories are the root of the shared taxonomy."
        actions={
          <Button type="button" size="sm" disabled={pending} onClick={save}>
            Save
          </Button>
        }
      />

      <AdminPanel title="Basics">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => {
                const name = e.target.value
                patch({
                  name,
                  slug: slugTouched ? form.slug : slugify(name),
                })
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true)
                patch({ slug: slugify(e.target.value) })
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={(e) => patch({ description: e.target.value })}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="icon">Icon</Label>
              <Input
                id="icon"
                value={form.icon}
                onChange={(e) => patch({ icon: e.target.value })}
                placeholder="sparkles"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="accentColor">Accent color</Label>
              <Input
                id="accentColor"
                value={form.accentColor}
                onChange={(e) => patch({ accentColor: e.target.value })}
                placeholder="#E8940C"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="status">Visibility / status</Label>
              <Select
                id="status"
                value={form.status}
                onChange={(e) =>
                  patch({
                    status: e.target.value as FormState["status"],
                  })
                }
              >
                {TAXONOMY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {TAXONOMY_STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="displayOrder">Display order</Label>
              <Input
                id="displayOrder"
                type="number"
                value={form.displayOrder}
                onChange={(e) => patch({ displayOrder: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="featured">Featured</Label>
            <Switch
              id="featured"
              checked={form.featured}
              onCheckedChange={(v) => patch({ featured: v })}
            />
          </div>
        </div>
      </AdminPanel>

      <AdminPanel title="Featured image" description="Select from Media Library.">
        <div className="space-y-3">
          <MediaPicker
            label="Featured image"
            value={form.imageUrl || null}
            onChange={(url, asset) =>
              patch({
                imageUrl: url || "",
                imageAlt: form.imageAlt || asset?.altText || "",
              })
            }
          />
          <Input
            value={form.imageUrl}
            onChange={(e) => patch({ imageUrl: e.target.value })}
            placeholder="Image URL"
          />
          <Input
            value={form.imageAlt}
            onChange={(e) => patch({ imageAlt: e.target.value })}
            placeholder="Alt text"
          />
        </div>
      </AdminPanel>

      <AdminPanel title="SEO">
        <div className="space-y-3">
          <Input
            value={form.seoTitle}
            onChange={(e) => patch({ seoTitle: e.target.value })}
            placeholder="SEO title"
            maxLength={70}
          />
          <Textarea
            value={form.seoDescription}
            onChange={(e) => patch({ seoDescription: e.target.value })}
            placeholder="SEO description"
            rows={3}
            maxLength={160}
          />
          <Input
            value={form.focusKeyword}
            onChange={(e) => patch({ focusKeyword: e.target.value })}
            placeholder="Focus keyword"
          />
          <Input
            value={form.canonicalUrl}
            onChange={(e) => patch({ canonicalUrl: e.target.value })}
            placeholder="Canonical URL"
          />
        </div>
      </AdminPanel>
    </div>
  )
}
