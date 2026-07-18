"use client"

import Link from "next/link"
import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { GuideRecord } from "@/services/content/types"
import type { GuideEditorOptions } from "../types/types"
import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard"
import { MediaPicker } from "@/features/media-library"
import { SeoFieldsPanel } from "@/features/seo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select } from "@/components/ui/select"
import {
  createGuideAction,
  updateGuideAction,
} from "../actions/actions"
import {
  GUIDE_DIFFICULTIES,
  GUIDE_DIFFICULTY_LABELS,
  GUIDE_STATUSES,
  GUIDE_STATUS_LABELS,
} from "../constants/constants"
import {
  GuideStructureBuilder,
  type StructureSection,
} from "./guide-structure-builder"

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function linesToList(value: string) {
  return value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
}

function listToLines(values: string[]) {
  return values.join("\n")
}

function sectionsFromGuide(guide?: GuideRecord | null): StructureSection[] {
  if (!guide?.sections?.length) return []
  return guide.sections.map((s) => ({
    id: s.id,
    title: s.title,
    slug: s.slug,
    description: s.description ?? "",
    sortOrder: s.sortOrder,
    lessons: s.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      slug: l.slug,
      content: l.content,
      readingTimeMin: l.readingTimeMin,
      featuredImageUrl: l.featuredImageUrl ?? "",
      featuredImageAlt: l.featuredImageAlt ?? "",
      videoUrl: l.videoUrl ?? "",
      codeExample: l.codeExample ?? "",
      resourceUrl: l.resourceUrl ?? "",
      articleId: l.articleId ?? "",
      aiToolId: l.aiToolId ?? "",
      sortOrder: l.sortOrder,
    })),
  }))
}

export function GuideEditorForm({
  guide,
  options,
}: {
  guide?: GuideRecord | null
  options: GuideEditorOptions
}) {
  const router = useRouter()
  const isEdit = Boolean(guide?.id)
  const [pending, startTransition] = useTransition()
  const [slugTouched, setSlugTouched] = useState(Boolean(guide?.slug))
  const [title, setTitle] = useState(guide?.title ?? "")
  const [slug, setSlug] = useState(guide?.slug ?? "")
  const [shortDescription, setShortDescription] = useState(
    guide?.shortDescription ?? ""
  )
  const [fullDescription, setFullDescription] = useState(
    guide?.fullDescription ?? ""
  )
  const [coverImageUrl, setCoverImageUrl] = useState(guide?.coverImageUrl ?? "")
  const [coverImageAlt, setCoverImageAlt] = useState(guide?.coverImageAlt ?? "")
  const [status, setStatus] = useState(guide?.status ?? "DRAFT")
  const [difficulty, setDifficulty] = useState(guide?.difficulty ?? "BEGINNER")
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    String(guide?.estimatedMinutes ?? 30)
  )
  const [objectives, setObjectives] = useState(
    listToLines(guide?.learningObjectives ?? [])
  )
  const [prerequisites, setPrerequisites] = useState(
    listToLines(guide?.prerequisites ?? [])
  )
  const [featured, setFeatured] = useState(guide?.featured ?? false)
  const [categoryId, setCategoryId] = useState(guide?.categoryId ?? "")
  const [topicId, setTopicId] = useState(guide?.topicId ?? "")
  const [seoTitle, setSeoTitle] = useState(guide?.seoTitle ?? "")
  const [seoDescription, setSeoDescription] = useState(
    guide?.seoDescription ?? ""
  )
  const [focusKeyword, setFocusKeyword] = useState(guide?.focusKeyword ?? "")
  const [canonicalUrl, setCanonicalUrl] = useState(guide?.canonicalUrl ?? "")
  const [sections, setSections] = useState<StructureSection[]>(() =>
    sectionsFromGuide(guide)
  )

  const filteredTopics = useMemo(() => {
    if (!categoryId) return options.topics
    return options.topics.filter(
      (t) => !t.categoryId || t.categoryId === categoryId
    )
  }, [categoryId, options.topics])

  function save(statusOverride?: typeof status) {
    if (!topicId) {
      toast.error("Topic is required")
      return
    }
    startTransition(async () => {
      const body = {
        title,
        slug: slug || undefined,
        shortDescription: shortDescription || null,
        fullDescription: fullDescription || null,
        coverImageUrl: coverImageUrl || null,
        coverImageAlt: coverImageAlt || null,
        status: statusOverride ?? status,
        difficulty,
        estimatedMinutes: Number(estimatedMinutes) || 30,
        learningObjectives: linesToList(objectives),
        prerequisites: linesToList(prerequisites),
        featured,
        categoryId: categoryId || null,
        topicId,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        focusKeyword: focusKeyword || null,
        canonicalUrl: canonicalUrl || null,
        sections: sections.map((s) => ({
          id: s.id,
          title: s.title,
          slug: s.slug,
          description: s.description || null,
          sortOrder: s.sortOrder,
          lessons: s.lessons.map((l) => ({
            id: l.id,
            title: l.title,
            slug: l.slug,
            content: l.content,
            readingTimeMin: l.readingTimeMin,
            featuredImageUrl: l.featuredImageUrl || null,
            featuredImageAlt: l.featuredImageAlt || null,
            videoUrl: l.videoUrl || null,
            codeExample: l.codeExample || null,
            resourceUrl: l.resourceUrl || null,
            articleId: l.articleId || null,
            aiToolId: l.aiToolId || null,
            sortOrder: l.sortOrder,
          })),
        })),
      }

      const res = isEdit
        ? await updateGuideAction(guide!.id, body)
        : await createGuideAction(body)

      if (!res.ok) {
        toast.error(res.message)
        return
      }
      toast.success(res.message)
      if (!isEdit && res.data?.id) {
        router.push(`/dashboard/guides/${res.data.id}`)
        router.refresh()
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title={isEdit ? "Edit guide" : "Create guide"}
        description="Guides belong to a Topic and contain Sections → Lessons."
        actions={
          <div className="flex flex-wrap gap-2">
            {isEdit ? (
              <Button asChild size="sm" variant="outline">
                <Link href={`/dashboard/guides/${guide!.id}/preview`}>
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

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                const next = e.target.value
                setTitle(next)
                if (!slugTouched) setSlug(slugify(next))
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(slugify(e.target.value))
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="short">Short description</Label>
            <Textarea
              id="short"
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="full">Full description</Label>
            <Textarea
              id="full"
              rows={4}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
            />
          </div>

          <GuideStructureBuilder sections={sections} onChange={setSections} />
        </div>

        <aside className="space-y-4">
          <AdminPanel title="Publishing">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as typeof status)
                  }
                >
                  {GUIDE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {GUIDE_STATUS_LABELS[s]}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(e.target.value as typeof difficulty)
                  }
                >
                  {GUIDE_DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {GUIDE_DIFFICULTY_LABELS[d]}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="minutes">Estimated minutes</Label>
                <Input
                  id="minutes"
                  type="number"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Featured</Label>
                <Switch
                  id="featured"
                  checked={featured}
                  onCheckedChange={setFeatured}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Author: {guide?.authorName ?? "Current editor"}
              </p>
            </div>
          </AdminPanel>

          <AdminPanel title="Taxonomy" description="Topic required (MES-009)">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Select
                  id="category"
                  value={categoryId || "__none"}
                  onChange={(e) =>
                    setCategoryId(
                      e.target.value === "__none" ? "" : e.target.value
                    )
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
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  required
                >
                  <option value="">Select topic…</option>
                  {filteredTopics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </AdminPanel>

          <AdminPanel title="Objectives & prerequisites">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="objectives">Learning objectives (one per line)</Label>
                <Textarea
                  id="objectives"
                  rows={4}
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prereqs">Prerequisites (one per line)</Label>
                <Textarea
                  id="prereqs"
                  rows={3}
                  value={prerequisites}
                  onChange={(e) => setPrerequisites(e.target.value)}
                />
              </div>
            </div>
          </AdminPanel>

          <AdminPanel title="Cover image">
            <div className="space-y-2">
              <MediaPicker
                label="Cover image"
                value={coverImageUrl || null}
                onChange={(url, asset) => {
                  setCoverImageUrl(url || "")
                  if (asset?.altText && !coverImageAlt) {
                    setCoverImageAlt(asset.altText)
                  }
                }}
              />
              <Input
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="Cover image URL"
              />
              <Input
                value={coverImageAlt}
                onChange={(e) => setCoverImageAlt(e.target.value)}
                placeholder="Alt text"
              />
            </div>
          </AdminPanel>

          <SeoFieldsPanel
            value={{
              seoTitle,
              seoDescription,
              focusKeyword,
              canonicalUrl,
            }}
            onChange={(p) => {
              if (p.seoTitle !== undefined) setSeoTitle(p.seoTitle)
              if (p.seoDescription !== undefined)
                setSeoDescription(p.seoDescription)
              if (p.focusKeyword !== undefined) setFocusKeyword(p.focusKeyword)
              if (p.canonicalUrl !== undefined) setCanonicalUrl(p.canonicalUrl)
            }}
            showSocialImage={false}
          />
        </aside>
      </div>
    </div>
  )
}
