"use client"

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArticleRichTextEditor } from "@/features/articles"
import { AdminPanel } from "@/features/admin-dashboard"

export type StructureLesson = {
  id?: string
  title: string
  slug: string
  content: string
  readingTimeMin: number
  featuredImageUrl: string
  featuredImageAlt: string
  videoUrl: string
  codeExample: string
  resourceUrl: string
  articleId: string
  aiToolId: string
  sortOrder: number
}

export type StructureSection = {
  id?: string
  title: string
  slug: string
  description: string
  sortOrder: number
  lessons: StructureLesson[]
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function emptyLesson(order: number): StructureLesson {
  return {
    title: "New lesson",
    slug: `lesson-${order + 1}`,
    content: "<p></p>",
    readingTimeMin: 1,
    featuredImageUrl: "",
    featuredImageAlt: "",
    videoUrl: "",
    codeExample: "",
    resourceUrl: "",
    articleId: "",
    aiToolId: "",
    sortOrder: order,
  }
}

function emptySection(order: number): StructureSection {
  return {
    title: "New section",
    slug: `section-${order + 1}`,
    description: "",
    sortOrder: order,
    lessons: [emptyLesson(0)],
  }
}

function reindex(sections: StructureSection[]): StructureSection[] {
  return sections.map((s, si) => ({
    ...s,
    sortOrder: si,
    lessons: s.lessons.map((l, li) => ({ ...l, sortOrder: li })),
  }))
}

export function GuideStructureBuilder({
  sections,
  onChange,
}: {
  sections: StructureSection[]
  onChange: (sections: StructureSection[]) => void
}) {
  function updateSections(next: StructureSection[]) {
    onChange(reindex(next))
  }

  function moveSection(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= sections.length) return
    const next = [...sections]
    ;[next[index], next[target]] = [next[target], next[index]]
    updateSections(next)
  }

  function moveLesson(sectionIndex: number, lessonIndex: number, dir: -1 | 1) {
    const lessons = [...sections[sectionIndex].lessons]
    const target = lessonIndex + dir
    if (target < 0 || target >= lessons.length) return
    ;[lessons[lessonIndex], lessons[target]] = [
      lessons[target],
      lessons[lessonIndex],
    ]
    const next = [...sections]
    next[sectionIndex] = { ...next[sectionIndex], lessons }
    updateSections(next)
  }

  return (
    <AdminPanel
      title="Guide structure"
      description="Add, rename, reorder, and delete sections and lessons. Use Move up/down for keyboard-accessible reordering."
      action={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            updateSections([...sections, emptySection(sections.length)])
          }
        >
          <Plus className="size-3.5" />
          Add section
        </Button>
      }
    >
      <div className="space-y-4">
        {sections.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No sections yet. Add a section to start building lessons.
          </p>
        ) : null}
        {sections.map((section, sIdx) => (
          <div
            key={section.id ?? `s-${sIdx}`}
            className="rounded-xl border border-border bg-background/40 p-4"
          >
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div className="grid flex-1 gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Section title</Label>
                  <Input
                    value={section.title}
                    onChange={(e) => {
                      const title = e.target.value
                      const next = [...sections]
                      next[sIdx] = {
                        ...section,
                        title,
                        slug: slugify(title) || section.slug,
                      }
                      updateSections(next)
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Section slug</Label>
                  <Input
                    value={section.slug}
                    onChange={(e) => {
                      const next = [...sections]
                      next[sIdx] = {
                        ...section,
                        slug: slugify(e.target.value),
                      }
                      updateSections(next)
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Move section up"
                  disabled={sIdx === 0}
                  onClick={() => moveSection(sIdx, -1)}
                >
                  <ChevronUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Move section down"
                  disabled={sIdx === sections.length - 1}
                  onClick={() => moveSection(sIdx, 1)}
                >
                  <ChevronDown className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Delete section"
                  onClick={() =>
                    updateSections(sections.filter((_, i) => i !== sIdx))
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>

            <div className="mb-3 space-y-1">
              <Label>Section description</Label>
              <Textarea
                rows={2}
                value={section.description}
                onChange={(e) => {
                  const next = [...sections]
                  next[sIdx] = { ...section, description: e.target.value }
                  updateSections(next)
                }}
              />
            </div>

            <div className="space-y-3 border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Lessons
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const next = [...sections]
                    next[sIdx] = {
                      ...section,
                      lessons: [
                        ...section.lessons,
                        emptyLesson(section.lessons.length),
                      ],
                    }
                    updateSections(next)
                  }}
                >
                  <Plus className="size-3.5" />
                  Add lesson
                </Button>
              </div>

              {section.lessons.map((lesson, lIdx) => (
                <div
                  key={lesson.id ?? `l-${sIdx}-${lIdx}`}
                  className="rounded-lg border border-border/70 bg-surface/40 p-3"
                >
                  <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                    <div className="grid flex-1 gap-2 sm:grid-cols-2">
                      <Input
                        value={lesson.title}
                        aria-label="Lesson title"
                        onChange={(e) => {
                          const title = e.target.value
                          const next = [...sections]
                          const lessons = [...section.lessons]
                          lessons[lIdx] = {
                            ...lesson,
                            title,
                            slug: slugify(title) || lesson.slug,
                          }
                          next[sIdx] = { ...section, lessons }
                          updateSections(next)
                        }}
                      />
                      <Input
                        value={lesson.slug}
                        aria-label="Lesson slug"
                        onChange={(e) => {
                          const next = [...sections]
                          const lessons = [...section.lessons]
                          lessons[lIdx] = {
                            ...lesson,
                            slug: slugify(e.target.value),
                          }
                          next[sIdx] = { ...section, lessons }
                          updateSections(next)
                        }}
                      />
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label="Move lesson up"
                        disabled={lIdx === 0}
                        onClick={() => moveLesson(sIdx, lIdx, -1)}
                      >
                        <ChevronUp className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label="Move lesson down"
                        disabled={lIdx === section.lessons.length - 1}
                        onClick={() => moveLesson(sIdx, lIdx, 1)}
                      >
                        <ChevronDown className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label="Delete lesson"
                        onClick={() => {
                          const next = [...sections]
                          next[sIdx] = {
                            ...section,
                            lessons: section.lessons.filter((_, i) => i !== lIdx),
                          }
                          updateSections(next)
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Lesson content</Label>
                    <ArticleRichTextEditor
                      value={lesson.content}
                      onChange={(html) => {
                        const next = [...sections]
                        const lessons = [...section.lessons]
                        lessons[lIdx] = { ...lesson, content: html }
                        next[sIdx] = { ...section, lessons }
                        updateSections(next)
                      }}
                    />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        placeholder="Video URL (placeholder)"
                        value={lesson.videoUrl}
                        onChange={(e) => {
                          const next = [...sections]
                          const lessons = [...section.lessons]
                          lessons[lIdx] = {
                            ...lesson,
                            videoUrl: e.target.value,
                          }
                          next[sIdx] = { ...section, lessons }
                          updateSections(next)
                        }}
                      />
                      <Input
                        placeholder="Resource URL"
                        value={lesson.resourceUrl}
                        onChange={(e) => {
                          const next = [...sections]
                          const lessons = [...section.lessons]
                          lessons[lIdx] = {
                            ...lesson,
                            resourceUrl: e.target.value,
                          }
                          next[sIdx] = { ...section, lessons }
                          updateSections(next)
                        }}
                      />
                    </div>
                    <Textarea
                      rows={3}
                      placeholder="Code example placeholder"
                      value={lesson.codeExample}
                      onChange={(e) => {
                        const next = [...sections]
                        const lessons = [...section.lessons]
                        lessons[lIdx] = {
                          ...lesson,
                          codeExample: e.target.value,
                        }
                        next[sIdx] = { ...section, lessons }
                        updateSections(next)
                      }}
                    />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        placeholder="Linked article ID (MES-008)"
                        value={lesson.articleId}
                        onChange={(e) => {
                          const next = [...sections]
                          const lessons = [...section.lessons]
                          lessons[lIdx] = {
                            ...lesson,
                            articleId: e.target.value,
                          }
                          next[sIdx] = { ...section, lessons }
                          updateSections(next)
                        }}
                      />
                      <Input
                        placeholder="Linked AI tool ID (MES-012)"
                        value={lesson.aiToolId}
                        onChange={(e) => {
                          const next = [...sections]
                          const lessons = [...section.lessons]
                          lessons[lIdx] = {
                            ...lesson,
                            aiToolId: e.target.value,
                          }
                          next[sIdx] = { ...section, lessons }
                          updateSections(next)
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AdminPanel>
  )
}
