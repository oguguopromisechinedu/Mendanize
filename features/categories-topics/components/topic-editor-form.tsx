"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { CategorySummary, TopicRecord } from "@/services/content/types"
import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select } from "@/components/ui/select"
import { createTopicAction, updateTopicAction } from "../actions/actions"
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
  categoryId: string
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

function toForm(topic?: TopicRecord | null): FormState {
  return {
    name: topic?.name ?? "",
    slug: topic?.slug ?? "",
    description: topic?.description ?? "",
    categoryId: topic?.categoryId ?? "",
    status: topic?.status ?? "ACTIVE",
    featured: topic?.featured ?? false,
    displayOrder: String(topic?.displayOrder ?? 0),
    seoTitle: topic?.seoTitle ?? "",
    seoDescription: topic?.seoDescription ?? "",
    focusKeyword: topic?.focusKeyword ?? "",
    canonicalUrl: topic?.canonicalUrl ?? "",
    imageUrl: topic?.imageUrl ?? "",
    imageAlt: topic?.imageAlt ?? "",
  }
}

export function TopicEditorForm({
  topic,
  categories,
  mediaPlaceholders,
  initialCategoryId,
}: {
  topic?: TopicRecord | null
  categories: CategorySummary[]
  mediaPlaceholders: Array<{ id: string; filename: string; url: string }>
  initialCategoryId?: string
}) {
  const router = useRouter()
  const isEdit = Boolean(topic?.id)
  const [form, setForm] = useState(() => {
    const base = toForm(topic)
    if (!topic && initialCategoryId) {
      return { ...base, categoryId: initialCategoryId }
    }
    return base
  })
  const [slugTouched, setSlugTouched] = useState(Boolean(topic?.slug))
  const [pending, startTransition] = useTransition()

  function patch(partial: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...partial }))
  }

  function save() {
    if (!form.categoryId) {
      toast.error("Parent category is required")
      return
    }
    startTransition(async () => {
      const body = {
        name: form.name,
        slug: form.slug || undefined,
        description: form.description || null,
        categoryId: form.categoryId,
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
        ? await updateTopicAction(topic!.id, body)
        : await createTopicAction(body)
      if (!res.ok) {
        toast.error(res.message)
        return
      }
      toast.success(res.message)
      if (!isEdit && res.data?.id) {
        router.push(`/dashboard/topics/${res.data.id}`)
        router.refresh()
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title={isEdit ? "Edit topic" : "Create topic"}
        description="Every topic must belong to a parent category."
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
            <Label htmlFor="categoryId">Parent category</Label>
            <Select
              id="categoryId"
              value={form.categoryId}
              onChange={(e) => patch({ categoryId: e.target.value })}
              required
            >
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
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
              <Label htmlFor="status">Status</Label>
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

      <AdminPanel title="Featured image">
        <div className="space-y-3">
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
          <div className="flex flex-wrap gap-2">
            {mediaPlaceholders.map((m) => (
              <button
                key={m.id}
                type="button"
                className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:border-primary"
                onClick={() => patch({ imageUrl: m.url })}
              >
                Use {m.filename}
              </button>
            ))}
          </div>
        </div>
      </AdminPanel>

      <AdminPanel title="SEO">
        <div className="space-y-3">
          <Input
            value={form.seoTitle}
            onChange={(e) => patch({ seoTitle: e.target.value })}
            placeholder="SEO title"
          />
          <Textarea
            value={form.seoDescription}
            onChange={(e) => patch({ seoDescription: e.target.value })}
            placeholder="SEO description"
            rows={3}
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
