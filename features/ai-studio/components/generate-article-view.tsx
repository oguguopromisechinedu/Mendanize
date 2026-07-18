"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import type { AIGenerationRecord } from "@/services/ai/types"
import {
  generateArticleAction,
  sendToArticleEditorAction,
} from "../actions/actions"
import { ArticleRichTextEditor } from "@/features/articles/components/article-rich-text-editor"

export function GenerateArticleView({
  categories,
  topics,
  initialTopic,
}: {
  categories: Array<{ id: string; name: string; slug: string }>
  topics: Array<{
    id: string
    name: string
    slug: string
    categoryId?: string | null
  }>
  initialTopic?: string | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [topic, setTopic] = useState(initialTopic?.trim() ?? "")
  const [tone, setTone] = useState("clear and educational")
  const [targetLength, setTargetLength] = useState<"short" | "medium" | "long">(
    "medium"
  )
  const [categoryId, setCategoryId] = useState("")
  const [topicId, setTopicId] = useState("")
  const [generation, setGeneration] = useState<AIGenerationRecord | null>(null)
  const [draftHtml, setDraftHtml] = useState("")
  const [streamed, setStreamed] = useState("")
  const [streaming, setStreaming] = useState(false)

  const filteredTopics = useMemo(() => {
    if (!categoryId) return topics
    return topics.filter((t) => !t.categoryId || t.categoryId === categoryId)
  }, [categoryId, topics])

  useEffect(() => {
    const html = generation?.outputText
    if (!html) return
    let cancelled = false
    let i = 0
    const step = Math.max(8, Math.floor(html.length / 40))
    const id = window.setInterval(() => {
      if (cancelled) return
      i = Math.min(html.length, i + step)
      setStreamed(html.slice(0, i))
      if (i >= html.length) {
        window.clearInterval(id)
        setStreaming(false)
        setDraftHtml(html)
      } else {
        setStreaming(true)
      }
    }, 40)
    // Kick first tick asynchronously so we don't setState in the effect body.
    queueMicrotask(() => {
      if (!cancelled) {
        setStreaming(true)
        setStreamed("")
      }
    })
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [generation?.id, generation?.outputText])

  function runGenerate() {
    startTransition(async () => {
      const res = await generateArticleAction({
        topic,
        tone,
        targetLength,
        categoryId: categoryId || null,
        topicId: topicId || null,
      })
      if (!res.ok || !res.data) {
        toast.error(res.message)
        return
      }
      setGeneration(res.data)
      setDraftHtml(res.data.outputText ?? "")
      toast.success(res.message)
    })
  }

  function sendToEditor() {
    if (!generation || !draftHtml) return
    startTransition(async () => {
      const res = await sendToArticleEditorAction({
        generationId: generation.id,
        title: topic || "AI Studio draft",
        content: draftHtml,
        categoryId: categoryId || null,
        topicId: topicId || null,
      })
      if (!res.ok || !res.data) {
        toast.error(res.message)
        return
      }
      toast.success(res.message)
      router.push(`/dashboard/articles/${res.data.id}`)
    })
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AdminPageHeader
        title="Generate article"
        description="Claude writes the draft; OpenAI generates a featured image in parallel. Refine, then send into the Article Editor."
      />

      <AdminPanel title="Inputs">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. How transformers actually work"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tone">Tone / style</Label>
            <Input
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="length">Target length</Label>
            <Select
              id="length"
              value={targetLength}
              onChange={(e) =>
                setTargetLength(e.target.value as typeof targetLength)
              }
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Select
              id="category"
              value={categoryId || "__none"}
              onChange={(e) =>
                setCategoryId(e.target.value === "__none" ? "" : e.target.value)
              }
            >
              <option value="__none">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="taxonomyTopic">Taxonomy topic</Label>
            <Select
              id="taxonomyTopic"
              value={topicId || "__none"}
              onChange={(e) =>
                setTopicId(e.target.value === "__none" ? "" : e.target.value)
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
        </div>
        <div className="mt-4">
          <Button
            type="button"
            disabled={pending || !topic.trim()}
            onClick={runGenerate}
          >
            {pending ? "Claude + OpenAI generating…" : "Generate draft + image"}
          </Button>
        </div>
      </AdminPanel>

      {(streamed || draftHtml) && (
        <AdminPanel
          title="Output"
          description={
            streaming
              ? "Streaming preview…"
              : "Edit inline, then send to Article Editor"
          }
          action={
            <Button
              type="button"
              size="sm"
              disabled={pending || streaming || !generation}
              onClick={sendToEditor}
            >
              Send to Article Editor
            </Button>
          }
        >
          {generation?.outputUrls?.length ? (
            <div className="mb-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Featured image · OpenAI DALL·E
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {generation.outputUrls.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt={`Featured illustration for ${topic}`}
                    className="w-full rounded-xl border border-border object-cover"
                  />
                ))}
              </div>
            </div>
          ) : null}
          {streaming ? (
            <div
              className="prose prose-neutral max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: streamed }}
            />
          ) : (
            <ArticleRichTextEditor value={draftHtml} onChange={setDraftHtml} />
          )}
          {generation ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Article provider: {generation.provider} · model:{" "}
              {generation.model ?? "—"}
              {generation.outputUrls?.length
                ? " · Image: OpenAI DALL·E"
                : " · Image: not generated"}
            </p>
          ) : null}
        </AdminPanel>
      )}
    </div>
  )
}
