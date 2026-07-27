"use client"

import Link from "next/link"
import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type {
  ToolFeatureKindValue,
  ToolRecord,
} from "@/services/content/types"
import type { ToolEditorOptions } from "../types/types"
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
  createToolAction,
  updateToolAction,
} from "../actions/actions"
import {
  TOOL_AVAILABILITIES,
  TOOL_AVAILABILITY_LABELS,
  TOOL_DIFFICULTIES,
  TOOL_DIFFICULTY_LABELS,
  TOOL_FEATURE_KIND_LABELS,
  TOOL_FEATURE_KINDS,
  TOOL_PRICINGS,
  TOOL_PRICING_LABELS,
  TOOL_SOURCES,
  TOOL_SOURCE_LABELS,
  TOOL_STATUSES,
  TOOL_STATUS_LABELS,
  TOOL_PLATFORMS,
} from "../constants/constants"

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

type FeatureDraft = {
  id?: string
  label: string
  kind: ToolFeatureKindValue
}

export function ToolEditorForm({
  tool,
  options,
  basePath = "/dashboard/ai-tools",
}: {
  tool?: ToolRecord | null
  options: ToolEditorOptions
  basePath?: string
}) {
  const router = useRouter()
  const isEdit = Boolean(tool?.id)
  const [pending, startTransition] = useTransition()
  const [slugTouched, setSlugTouched] = useState(Boolean(tool?.slug))
  const [name, setName] = useState(tool?.name ?? "")
  const [slug, setSlug] = useState(tool?.slug ?? "")
  const [shortDescription, setShortDescription] = useState(
    tool?.shortDescription ?? ""
  )
  const [fullDescription, setFullDescription] = useState(
    tool?.fullDescription ?? ""
  )
  const [websiteUrl, setWebsiteUrl] = useState(tool?.websiteUrl ?? "")
  const [documentationUrl, setDocumentationUrl] = useState(
    tool?.documentationUrl ?? ""
  )
  const [developer, setDeveloper] = useState(tool?.developer ?? "")
  const [platforms, setPlatforms] = useState<string[]>(tool?.platforms ?? [])
  const [aiCapabilities, setAiCapabilities] = useState(
    listToLines(tool?.aiCapabilities ?? [])
  )
  const [availability, setAvailability] = useState(
    tool?.availability ?? "AVAILABLE"
  )
  const [pricing, setPricing] = useState(tool?.pricing ?? "FREEMIUM")
  const [difficulty, setDifficulty] = useState(tool?.difficulty ?? "BEGINNER")
  const [recommendedFor, setRecommendedFor] = useState(
    listToLines(tool?.recommendedFor ?? [])
  )
  const [learningOutcomes, setLearningOutcomes] = useState(
    listToLines(tool?.learningOutcomes ?? [])
  )
  const [relatedArticleIds, setRelatedArticleIds] = useState(
    listToLines(tool?.relatedArticleIds ?? [])
  )
  const [relatedGuideIds, setRelatedGuideIds] = useState(
    listToLines(tool?.relatedGuideIds ?? [])
  )
  const [relatedToolIds, setRelatedToolIds] = useState(
    listToLines(tool?.relatedToolIds ?? [])
  )
  const [demoVideoUrl, setDemoVideoUrl] = useState(tool?.demoVideoUrl ?? "")
  const [featured, setFeatured] = useState(tool?.featured ?? false)
  const [verified, setVerified] = useState(tool?.verified ?? false)
  const [source, setSource] = useState(tool?.source ?? "THIRD_PARTY")
  const [status, setStatus] = useState(tool?.status ?? "DRAFT")
  const [seoTitle, setSeoTitle] = useState(tool?.seoTitle ?? "")
  const [seoDescription, setSeoDescription] = useState(
    tool?.seoDescription ?? ""
  )
  const [focusKeyword, setFocusKeyword] = useState(tool?.focusKeyword ?? "")
  const [canonicalUrl, setCanonicalUrl] = useState(tool?.canonicalUrl ?? "")
  const [categoryId, setCategoryId] = useState(tool?.categoryIds[0] ?? "")
  const [topicId, setTopicId] = useState(tool?.topicIds[0] ?? "")
  const [tagNames, setTagNames] = useState(listToLines(tool?.tagNames ?? []))
  const [logoUrl, setLogoUrl] = useState(tool?.logoUrl ?? "")
  const [coverUrl, setCoverUrl] = useState(tool?.coverUrl ?? "")
  const [screenshots, setScreenshots] = useState(
    listToLines(
      tool?.images.filter((i) => i.kind === "SCREENSHOT").map((i) => i.url) ??
        []
    )
  )
  const [features, setFeatures] = useState<FeatureDraft[]>(
    () =>
      tool?.features.map((f) => ({
        id: f.id,
        label: f.label,
        kind: f.kind,
      })) ?? []
  )
  const [featureDraft, setFeatureDraft] = useState("")
  const [featureKind, setFeatureKind] =
    useState<ToolFeatureKindValue>("FEATURE")

  const filteredTopics = useMemo(() => {
    if (!categoryId) return options.topics
    return options.topics.filter(
      (t) => !t.categoryId || t.categoryId === categoryId
    )
  }, [categoryId, options.topics])

  function addFeature() {
    const label = featureDraft.trim()
    if (!label) return
    setFeatures((prev) => [...prev, { label, kind: featureKind }])
    setFeatureDraft("")
  }

  function save(statusOverride?: typeof status) {
    startTransition(async () => {
      const body = {
        name,
        slug: slug || undefined,
        shortDescription: shortDescription || null,
        fullDescription: fullDescription || null,
        websiteUrl: websiteUrl || null,
        documentationUrl: documentationUrl || null,
        developer: developer || null,
        platforms,
        aiCapabilities: linesToList(aiCapabilities),
        availability,
        pricing,
        difficulty,
        recommendedFor: linesToList(recommendedFor),
        learningOutcomes: linesToList(learningOutcomes),
        relatedArticleIds: linesToList(relatedArticleIds),
        relatedGuideIds: linesToList(relatedGuideIds),
        relatedToolIds: linesToList(relatedToolIds),
        demoVideoUrl: demoVideoUrl || null,
        featured,
        verified,
        source,
        status: statusOverride ?? status,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        focusKeyword: focusKeyword || null,
        canonicalUrl: canonicalUrl || null,
        categoryIds: categoryId ? [categoryId] : [],
        topicIds: topicId ? [topicId] : [],
        tagNames: linesToList(tagNames),
        features: features.map((f, i) => ({
          id: f.id,
          label: f.label,
          kind: f.kind,
          sortOrder: i,
        })),
        logoUrl: logoUrl || null,
        coverUrl: coverUrl || null,
        screenshotUrls: linesToList(screenshots),
      }

      const res = isEdit
        ? await updateToolAction(tool!.id, body)
        : await createToolAction(body)

      if (!res.ok) {
        toast.error(res.message)
        return
      }
      toast.success(res.message)
      if (!isEdit && res.data?.id) {
        router.push(`${basePath}/${res.data.id}`)
        router.refresh()
        return
      }
      router.refresh()
    })
  }

  function togglePlatform(platform: string) {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform],
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title={isEdit ? "Edit AI tool" : "Add AI tool"}
        description="Marketplace catalog entry — Official, Third-party, or Built on Mendanize. Publish when ready for the public directory."
        actions={
          <div className="flex flex-wrap gap-2">
            {isEdit ? (
              <Button asChild size="sm" variant="outline">
                <Link href={`${basePath}/${tool!.id}/preview`}>
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
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                const next = e.target.value
                setName(next)
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="developer">Company / Developer</Label>
              <Input
                id="developer"
                value={developer}
                onChange={(e) => setDeveloper(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Official website</Label>
              <Input
                id="website"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="docs">Documentation URL</Label>
            <Input
              id="docs"
              type="url"
              value={documentationUrl}
              onChange={(e) => setDocumentationUrl(e.target.value)}
              placeholder="https://"
            />
          </div>
          <div className="space-y-2">
            <Label>Platforms</Label>
            <div className="flex flex-wrap gap-2">
              {TOOL_PLATFORMS.map((platform) => {
                const on = platforms.includes(platform)
                return (
                  <Button
                    key={platform}
                    type="button"
                    size="sm"
                    variant={on ? "secondary" : "outline"}
                    onClick={() => togglePlatform(platform)}
                  >
                    {platform}
                  </Button>
                )
              })}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="capabilities">AI capabilities</Label>
            <Textarea
              id="capabilities"
              rows={3}
              value={aiCapabilities}
              onChange={(e) => setAiCapabilities(e.target.value)}
              placeholder="One capability per line (e.g. Chat, Image generation)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="short">Description</Label>
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
              rows={6}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
            />
          </div>

          <AdminPanel title="Features & positioning">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Select
                  value={featureKind}
                  onChange={(e) =>
                    setFeatureKind(e.target.value as ToolFeatureKindValue)
                  }
                  aria-label="Feature kind"
                >
                  {TOOL_FEATURE_KINDS.map((k) => (
                    <option key={k} value={k}>
                      {TOOL_FEATURE_KIND_LABELS[k]}
                    </option>
                  ))}
                </Select>
                <Input
                  value={featureDraft}
                  onChange={(e) => setFeatureDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addFeature()}
                  placeholder="Add label…"
                  className="min-w-[12rem] flex-1"
                />
                <Button type="button" size="sm" variant="outline" onClick={addFeature}>
                  Add
                </Button>
              </div>
              {features.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Add features, use cases, advantages, and limitations.
                </p>
              ) : (
                <ul className="space-y-2">
                  {features.map((f, i) => (
                    <li
                      key={`${f.kind}-${f.label}-${i}`}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm"
                    >
                      <span>
                        <span className="text-xs text-muted-foreground">
                          {TOOL_FEATURE_KIND_LABELS[f.kind]} ·{" "}
                        </span>
                        {f.label}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setFeatures((prev) => prev.filter((_, j) => j !== i))
                        }
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </AdminPanel>

          <AdminPanel
            title="Educational links"
            description="Curated related IDs boost Recommendations (MES-018) alongside taxonomy overlap."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="rel-articles">Related article IDs</Label>
                <Textarea
                  id="rel-articles"
                  rows={3}
                  value={relatedArticleIds}
                  onChange={(e) => setRelatedArticleIds(e.target.value)}
                  placeholder="One ID per line"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rel-guides">Related guide IDs</Label>
                <Textarea
                  id="rel-guides"
                  rows={3}
                  value={relatedGuideIds}
                  onChange={(e) => setRelatedGuideIds(e.target.value)}
                  placeholder="One ID per line"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rel-tools">Related tool IDs</Label>
                <Textarea
                  id="rel-tools"
                  rows={3}
                  value={relatedToolIds}
                  onChange={(e) => setRelatedToolIds(e.target.value)}
                  placeholder="One ID per line"
                />
              </div>
            </div>
          </AdminPanel>
        </div>

        <aside className="space-y-4">
          <AdminPanel title="Publishing">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                >
                  {TOOL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {TOOL_STATUS_LABELS[s]}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pricing">Pricing</Label>
                <Select
                  id="pricing"
                  value={pricing}
                  onChange={(e) =>
                    setPricing(e.target.value as typeof pricing)
                  }
                >
                  {TOOL_PRICINGS.map((p) => (
                    <option key={p} value={p}>
                      {TOOL_PRICING_LABELS[p]}
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
                  {TOOL_DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {TOOL_DIFFICULTY_LABELS[d]}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="availability">Availability</Label>
                <Select
                  id="availability"
                  value={availability}
                  onChange={(e) =>
                    setAvailability(e.target.value as typeof availability)
                  }
                >
                  {TOOL_AVAILABILITIES.map((a) => (
                    <option key={a} value={a}>
                      {TOOL_AVAILABILITY_LABELS[a]}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="source">Marketplace label</Label>
                <Select
                  id="source"
                  value={source}
                  onChange={(e) =>
                    setSource(e.target.value as typeof source)
                  }
                >
                  {TOOL_SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {TOOL_SOURCE_LABELS[s]}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Featured</Label>
                <Switch
                  id="featured"
                  checked={featured}
                  onCheckedChange={setFeatured}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="verified">Verified</Label>
                <Switch
                  id="verified"
                  checked={verified}
                  onCheckedChange={setVerified}
                />
              </div>
            </div>
          </AdminPanel>

          <AdminPanel title="Classification">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Select
                  id="category"
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value)
                    setTopicId("")
                  }}
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
                <Label htmlFor="topic">Topic</Label>
                <Select
                  id="topic"
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                >
                  <option value="">None</option>
                  {filteredTopics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tags">Tags (one per line)</Label>
                <Textarea
                  id="tags"
                  rows={3}
                  value={tagNames}
                  onChange={(e) => setTagNames(e.target.value)}
                />
              </div>
            </div>
          </AdminPanel>

          <AdminPanel title="Educational">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="recommended">Recommended for</Label>
                <Textarea
                  id="recommended"
                  rows={3}
                  value={recommendedFor}
                  onChange={(e) => setRecommendedFor(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="outcomes">Learning outcomes</Label>
                <Textarea
                  id="outcomes"
                  rows={3}
                  value={learningOutcomes}
                  onChange={(e) => setLearningOutcomes(e.target.value)}
                />
              </div>
            </div>
          </AdminPanel>

          <AdminPanel title="Media">
            <div className="space-y-3">
              <MediaPicker
                label="Logo"
                value={logoUrl || null}
                onChange={(url) => setLogoUrl(url || "")}
              />
              <MediaPicker
                label="Cover"
                value={coverUrl || null}
                onChange={(url) => setCoverUrl(url || "")}
              />
              <div className="space-y-1.5">
                <Label htmlFor="shots">Screenshot URLs</Label>
                <Textarea
                  id="shots"
                  rows={3}
                  value={screenshots}
                  onChange={(e) => setScreenshots(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="demo">Demo video URL</Label>
                <Input
                  id="demo"
                  type="url"
                  value={demoVideoUrl}
                  onChange={(e) => setDemoVideoUrl(e.target.value)}
                />
              </div>
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
