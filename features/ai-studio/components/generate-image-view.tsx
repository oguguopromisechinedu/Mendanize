"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { toast } from "sonner"

import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import type { AIGenerationRecord } from "@/services/ai/types"
import {
  generateImageAction,
  saveImageToMediaAction,
} from "../actions/actions"

export function GenerateImageView({
  initialPrompt,
}: {
  initialPrompt?: string | null
}) {
  const [pending, startTransition] = useTransition()
  const [prompt, setPrompt] = useState(initialPrompt?.trim() ?? "")
  const [style, setStyle] = useState("editorial illustration, ink and amber")
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "4:3" | "9:16">(
    "1:1"
  )
  const [generation, setGeneration] = useState<AIGenerationRecord | null>(null)
  const [selected, setSelected] = useState<string | null>(null)

  function runGenerate() {
    startTransition(async () => {
      const res = await generateImageAction({ prompt, style, aspectRatio })
      if (!res.ok || !res.data) {
        toast.error(res.message)
        return
      }
      setGeneration(res.data)
      setSelected(res.data.outputUrls[0] ?? null)
      toast.success(res.message)
    })
  }

  function saveSelected() {
    if (!generation || !selected) return
    startTransition(async () => {
      const res = await saveImageToMediaAction({
        generationId: generation.id,
        url: selected,
      })
      if (!res.ok) {
        toast.error(res.message)
        return
      }
      toast.success(res.message)
    })
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AdminPageHeader
        title="Generate image"
        description="OpenAI owns every image — covers, figures, illustrations, and media-library assets."
        actions={
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/media">Open Media</Link>
          </Button>
        }
      />

      <AdminPanel title="Inputs">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="prompt">Prompt</Label>
            <Input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Learner studying attention maps on a quiet desk…"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="style">Style guidance</Label>
              <Input
                id="style"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="aspect">Aspect ratio</Label>
              <Select
                id="aspect"
                value={aspectRatio}
                onChange={(e) =>
                  setAspectRatio(e.target.value as typeof aspectRatio)
                }
              >
                <option value="1:1">1:1</option>
                <option value="16:9">16:9</option>
                <option value="4:3">4:3</option>
                <option value="9:16">9:16</option>
              </Select>
            </div>
          </div>
          <Button
            type="button"
            disabled={pending || !prompt.trim()}
            onClick={runGenerate}
          >
            {pending ? "Generating…" : "Generate images"}
          </Button>
        </div>
      </AdminPanel>

      {generation?.outputUrls?.length ? (
        <AdminPanel
          title="Image grid"
          action={
            <Button
              type="button"
              size="sm"
              disabled={pending || !selected}
              onClick={saveSelected}
            >
              Save selected to Media Library
            </Button>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {generation.outputUrls.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => setSelected(url)}
                className={`overflow-hidden rounded-lg border ${
                  selected === url
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Provider: {generation.provider} · MES-014 owns durable storage.
          </p>
        </AdminPanel>
      ) : null}
    </div>
  )
}
