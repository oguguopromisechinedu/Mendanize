"use client"

import Link from "next/link"
import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Sparkles } from "lucide-react"

import type { ArticleRecord } from "@/services/content/types"
import type { ArticleEditorOptions } from "../types/types"
import {
  AdminPageHeader,
  AdminPanel,
} from "@/features/admin-dashboard"
import { MediaPicker } from "@/features/media-library"
import { SeoFieldsPanel } from "@/features/seo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select } from "@/components/ui/select"
import {
  createArticleAction,
  requestAiAssistAction,
  updateArticleAction,
} from "../actions/actions"
import { ARTICLE_STATUSES, STATUS_LABELS } from "../constants/constants"
import { ArticleRichTextEditor } from "./article-rich-text-editor"
import { estimateReadingTimeMin } from "@/services/content/reading-time"

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
  excerpt: string
  content: string
  status: (typeof ARTICLE_STATUSES)[number]
  featured: boolean
  categoryId: string
  topicId: string
  publishedAt: string
  scheduledAt: string
  seoTitle: string
  seoDescription: string
  focusKeyword: string
  canonicalUrl: string
  socialImageUrl: string
  featuredImageUrl: string
  featuredImageAlt: string
  tagNames: string
}

function toForm(article?: ArticleRecord | null): FormState {
  return {
    title: article?.title ?? "",
    slug: article?.slug ?? "",
    excerpt: article?.excerpt ?? "",
    content: article?.content ?? "<p></p>",
    status: article?.status ?? "DRAFT",
    featured: article?.featured ?? false,
    categoryId: article?.categoryId ?? "",
    topicId: article?.topicId ?? "",
    publishedAt: article?.publishedAt
      ? article.publishedAt.slice(0, 16)
      : "",
    scheduledAt: article?.scheduledAt
      ? article.scheduledAt.slice(0, 16)
      : "",
    seoTitle: article?.seoTitle ?? "",
    seoDescription: article?.seoDescription ?? "",
    focusKeyword: article?.focusKeyword ?? "",
    canonicalUrl: article?.canonicalUrl ?? "",
    socialImageUrl: article?.socialImageUrl ?? "",
    featuredImageUrl: article?.featuredImageUrl ?? "",
    featuredImageAlt: article?.featuredImageAlt ?? "",
    tagNames: article?.tags.map((t) => t.name).join(", ") ?? "",
  }
}

export function ArticleEditorForm({
  article,
  options,
}: {
  article?: ArticleRecord | null
  options: ArticleEditorOptions
}) {
  const router = useRouter()
  const isEdit = Boolean(article?.id)
  const [form, setForm] = useState<FormState>(() => toForm(article))
  const [slugTouched, setSlugTouched] = useState(Boolean(article?.slug))
  const [pending, startTransition] = useTransition()

  const readingTime = useMemo(
    () => estimateReadingTimeMin(form.content),
    [form.content]
  )

  const filteredTopics = useMemo(() => {
    if (!form.categoryId) return options.topics
    return options.topics.filter(
      (t) => !t.categoryId || t.categoryId === form.categoryId
    )
  }, [form.categoryId, options.topics])

  function patch(partial: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...partial }))
  }

  function payload(statusOverride?: FormState["status"]) {
    return {
      title: form.title,
      slug: form.slug || undefined,
      excerpt: form.excerpt || null,
      content: form.content,
      status: statusOverride ?? form.status,
      featured: form.featured,
      categoryId: form.categoryId || null,
      topicId: form.topicId || null,
      publishedAt: form.publishedAt
        ? new Date(form.publishedAt).toISOString()
        : null,
      scheduledAt: form.scheduledAt
        ? new Date(form.scheduledAt).toISOString()
        : null,
      seoTitle: form.seoTitle || null,
      seoDescription: form.seoDescription || null,
      focusKeyword: form.focusKeyword || null,
      canonicalUrl: form.canonicalUrl || null,
      socialImageUrl: form.socialImageUrl || null,
      featuredImageUrl: form.featuredImageUrl || null,
      featuredImageAlt: form.featuredImageAlt || null,
      tagNames: form.tagNames
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    }
  }

  function save(statusOverride?: FormState["status"]) {
    startTransition(async () => {
      const body = payload(statusOverride)
      const res = isEdit
        ? await updateArticleAction(article!.id, body)
        : await createArticleAction(body)

      if (!res.ok) {
        toast.error(res.message)
        return
      }
      toast.success(res.message ?? "Saved")
      if (!isEdit && res.data?.id) {
        router.push(`/dashboard/articles/${res.data.id}`)
        router.refresh()
        return
      }
      router.refresh()
    })
  }

  function runAi(mode: "draft" | "rewrite" | "summarize") {
    startTransition(async () => {
      const res = await requestAiAssistAction({
        mode,
        prompt: form.title || "Untitled article",
        content: form.content,
      })
      if (!res.ok) {
        toast.message("Generate with AI", { description: res.message })
        return
      }
      if (res.data?.content) {
        patch({ content: res.data.content })
        toast.success("AI suggestion applied")
      }
    })
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title={isEdit ? "Edit article" : "Create article"}
        description="Save drafts, schedule, publish, and prepare SEO — visitors cannot publish."
        actions={
          <div className="flex flex-wrap gap-2">
            {isEdit ? (
              <Button asChild size="sm" variant="outline">
                <Link href={`/dashboard/articles/${article!.id}/preview`}>
                  Preview
                </Link>
              </Button>
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
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => save("ARCHIVED")}
            >
              Archive
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={pending}
              onClick={() => save("PUBLISHED")}
            >
              Publish
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
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
              placeholder="Article title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true)
                patch({ slug: slugifyClient(e.target.value) })
              }}
              placeholder="url-slug"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Short description</Label>
            <Textarea
              id="excerpt"
              value={form.excerpt}
              onChange={(e) => patch({ excerpt: e.target.value })}
              rows={3}
              placeholder="One or two sentences for cards and SEO fallback"
            />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label>Main content</Label>
              <div className="flex flex-wrap gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => runAi("draft")}
                >
                  <Sparkles className="size-3.5" />
                  Generate with AI
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() => runAi("rewrite")}
                >
                  Rewrite
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() => runAi("summarize")}
                >
                  Summarize
                </Button>
              </div>
            </div>
            <ArticleRichTextEditor
              value={form.content}
              onChange={(html) => patch({ content: html })}
            />
            <p className="text-xs text-muted-foreground">
              Estimated reading time: {readingTime} min · AI Studio (MES-011)
              powers live generation later.
            </p>
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
                  {ARTICLE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="featured">Featured</Label>
                <Switch
                  id="featured"
                  checked={form.featured}
                  onCheckedChange={(v) => patch({ featured: v })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="publishedAt">Publish date</Label>
                <Input
                  id="publishedAt"
                  type="datetime-local"
                  value={form.publishedAt}
                  onChange={(e) => patch({ publishedAt: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="scheduledAt">Schedule</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => patch({ scheduledAt: e.target.value })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Author: {article?.authorName ?? "Current editor"}
              </p>
            </div>
          </AdminPanel>

          <AdminPanel title="Taxonomy" description="Category / Topic land fully in MES-009">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Select
                  id="category"
                  value={form.categoryId || "__none"}
                  onChange={(e) =>
                    patch({
                      categoryId:
                        e.target.value === "__none" ? "" : e.target.value,
                    })
                  }
                >
                  <option value="__none">None</option>
                  {options.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="topic">Topic</Label>
                <Select
                  id="topic"
                  value={form.topicId || "__none"}
                  onChange={(e) =>
                    patch({
                      topicId:
                        e.target.value === "__none" ? "" : e.target.value,
                    })
                  }
                >
                  <option value="__none">None</option>
                  {filteredTopics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={form.tagNames}
                  onChange={(e) => patch({ tagNames: e.target.value })}
                  placeholder="ai, learning, cms"
                />
              </div>
            </div>
          </AdminPanel>

          <AdminPanel
            title="Featured image"
            description="Select from the Media Library (MES-014)."
          >
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
                  onChange={(e) => patch({ featuredImageAlt: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="featuredImageUrl">Image URL</Label>
                <Input
                  id="featuredImageUrl"
                  value={form.featuredImageUrl}
                  onChange={(e) => patch({ featuredImageUrl: e.target.value })}
                  placeholder="https://… or pick above"
                />
              </div>
            </div>
          </AdminPanel>

          <SeoFieldsPanel
            value={{
              seoTitle: form.seoTitle,
              seoDescription: form.seoDescription,
              focusKeyword: form.focusKeyword,
              canonicalUrl: form.canonicalUrl,
              socialImageUrl: form.socialImageUrl,
              ogImageUrl: form.socialImageUrl,
            }}
            onChange={(p) =>
              patch({
                seoTitle: p.seoTitle ?? form.seoTitle,
                seoDescription: p.seoDescription ?? form.seoDescription,
                focusKeyword: p.focusKeyword ?? form.focusKeyword,
                canonicalUrl: p.canonicalUrl ?? form.canonicalUrl,
                socialImageUrl:
                  p.socialImageUrl ?? p.ogImageUrl ?? form.socialImageUrl,
              })
            }
          />
        </aside>
      </div>
    </div>
  )
}
