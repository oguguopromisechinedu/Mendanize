"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { AIGenerationRecord } from "@/services/ai/types"
import { prepareVideoAction } from "../actions/actions"

/** Video provider interface only — no live generation in MES-011. */
export function GenerateVideoView() {
  const [pending, startTransition] = useTransition()
  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState("calm educational explainer")
  const [durationSec, setDurationSec] = useState("30")
  const [result, setResult] = useState<AIGenerationRecord | null>(null)

  function run() {
    startTransition(async () => {
      const res = await prepareVideoAction({
        prompt,
        style,
        durationSec: Number(durationSec) || 30,
      })
      if (!res.ok || !res.data) {
        toast.error(res.message)
        return
      }
      setResult(res.data)
      toast.success(res.message)
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Generate video"
        description="Architecture and UI only. Provider selection is deferred."
      />

      <AdminPanel title="Request (recorded to history)">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="style">Style</Label>
              <Input
                id="style"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                value={durationSec}
                onChange={(e) => setDurationSec(e.target.value)}
              />
            </div>
          </div>
          <Button
            type="button"
            disabled={pending || !prompt.trim()}
            onClick={run}
          >
            Record video request
          </Button>
        </div>
      </AdminPanel>

      {result ? (
        <AdminPanel title="Queued">
          <p className="text-sm text-muted-foreground">{result.outputText}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Provider: {result.provider} · {result.durationSec}s
          </p>
        </AdminPanel>
      ) : null}
    </div>
  )
}
