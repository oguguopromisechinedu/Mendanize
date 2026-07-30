"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { StaticPageRecord } from "@/services/admin/types"
import {
  AdminPageHeader,
  AdminPanel,
} from "@/features/admin-dashboard"
import { ArticleRichTextEditor } from "@/features/articles"
import { MediaPicker } from "@/features/media-library"
import {
  createPageAction,
  updatePageAction,
} from "@/features/admin-modules"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"

const STATUSES = ["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"] as const

function slugifyClient(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

type FormState = {
  title: string
  slug: string
  content: string
  excerpt: string
  hero: string
  featuredImageUrl: string
  featuredImageAlt: string
  status: (typeof STATUSES)[number]
  seoTitle: string
  seoDescription: string
}

function toForm(page?: StaticPageRecord | null): FormState {
  return {
    title: page?.title ?? "",
    slug: page?.slug ?? "",
    content: page?.content ?? "<p></p>",
    excerpt: page?.excerpt ?? "",
    hero: page?.hero ?? "",
    featuredImageUrl: page?.featuredImageUrl ?? "",
    featuredImageAlt: page?.featuredImageAlt ?? "",
    status: page?.status ?? "DRAFT",
    seoTitle: page?.seoTitle ?? "",
    seoDescription: page?.seoDescription ?? "",
  }
}

export function PageEditorForm({
  page,
}: {
  page?: StaticPageRecord | null
}) {
  const router = useRouter()
  const isEdit = Boolean(page?.id)
  const [form, setForm] = useState<FormState>(() => toForm(page))
  const [slugTouched, setSlugTouched] = useState(Boolean(page?.slug))
  const [pending, startTransition] = useTransition()

  function patch(partial: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...partial }))
  }

  function payload(statusOverride?: FormState["status"]) {
    return {
      title: form.title,
      slug: form.slug || undefined,
      content: form.content,
      excerpt: form.excerpt || null,
      hero: form.hero || null,
      featuredImageUrl: form.featuredImageUrl || null,
      featuredImageAlt: form.featuredImageAlt || null,
      status: statusOverride ?? form.status,
      seoTitle: form.seoTitle || null,
      seoDescription: form.seoDescription || null,
    }
  }

  function save(statusOverride?: FormState["status"]) {
    startTransition(async () => {
      if (!form.title.trim()) {
        toast.error("Title is required")
        return
      }
      const body = payload(statusOverride)
      const res = isEdit
        ? await updatePageAction(page!.id, body)
        : await createPageAction(body)

      if (!res.ok) {
        toast.error(res.message)
        return
      }
      toast.success(res.message ?? "Saved")
      if (!isEdit && res.data && typeof res.data === "object" && "id" in res.data) {
        router.push(`/dashboard/pages/${(res.data as { id: string }).id}`)
        router.refresh()
        return
      }
      if (statusOverride) patch({ status: statusOverride })
      router.refresh()
    })
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title={isEdit ? "Edit page" : "Create page"}
        description="Company and marketing pages — publish to show on the public site."
        actions={
          <div className="flex flex-wrap gap-2">
            {isEdit ? (
              <>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/dashboard/pages/${page!.id}/preview`}>
                    Preview
                  </Link>
                </Button>
                {form.status === "PUBLISHED" ? (
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/${form.slug}`} target="_blank">
                      View live
                    </Link>
                  </Button>
                ) : null}
              </>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => save("DRAFT")}
            >
              Save draft
            </Button>
            {form.status === "PUBLISHED" ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => save("DRAFT")}
              >
                Unpublish
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                disabled={pending}
                onClick={() => save("PUBLISHED")}
              >
                Publish
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={pending}
              onClick={() => save()}
            >
              Save
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Page title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => {
                const title = e.target.value
                patch({
                  title,
                  slug: slugTouched ? form.slug : slugifyClient(title),
                })
              }}
              placeholder="About"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/</span>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  patch({ slug: slugifyClient(e.target.value) })
                }}
                placeholder="about"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hero">Hero</Label>
            <Input
              id="hero"
              value={form.hero}
              onChange={(e) => patch({ hero: e.target.value })}
              placeholder="Optional eyebrow / hero line above the title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Short description</Label>
            <Textarea
              id="excerpt"
              value={form.excerpt}
              onChange={(e) => patch({ excerpt: e.target.value })}
              rows={2}
              placeholder="Shown under the title and as SEO fallback"
            />
          </div>

          <div className="space-y-2">
            <Label>Rich content</Label>
            <ArticleRichTextEditor
              value={form.content}
              onChange={(html) => patch({ content: html })}
            />
          </div>
        </div>

        <aside className="space-y-4">
          <AdminPanel title="Publishing">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  value={form.status}
                  onChange={(e) =>
                    patch({ status: e.target.value as FormState["status"] })
                  }
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </AdminPanel>

          <AdminPanel title="Featured image">
            <div className="space-y-3">
              <MediaPicker
                label="Featured image"
                value={form.featuredImageUrl || null}
                onChange={(url, asset) =>
                  patch({
                    featuredImageUrl: url || "",
                    featuredImageAlt:
                      form.featuredImageAlt || asset?.altText || "",
                  })
                }
              />
              <div className="space-y-1.5">
                <Label htmlFor="featuredImageAlt">Alt text</Label>
                <Input
                  id="featuredImageAlt"
                  value={form.featuredImageAlt}
                  onChange={(e) =>
                    patch({ featuredImageAlt: e.target.value })
                  }
                />
              </div>
            </div>
          </AdminPanel>

          <AdminPanel title="SEO">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="seoTitle">SEO title</Label>
                <Input
                  id="seoTitle"
                  value={form.seoTitle}
                  onChange={(e) => patch({ seoTitle: e.target.value })}
                  maxLength={70}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seoDescription">Meta description</Label>
                <Textarea
                  id="seoDescription"
                  value={form.seoDescription}
                  onChange={(e) => patch({ seoDescription: e.target.value })}
                  rows={3}
                  maxLength={160}
                />
              </div>
            </div>
          </AdminPanel>
        </aside>
      </div>
    </div>
  )
}
