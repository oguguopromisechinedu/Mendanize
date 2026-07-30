"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import Link from "next/link"
import { Play, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type {
  CodeRunRecord,
  CodeWorkspaceRecord,
  WorkspacePresetRecord,
} from "../types"
import { runWorkspaceAction, saveWorkspaceFileAction } from "../actions"

export function CodingWorkspaceLab({
  workspace,
  presets,
  recentRuns,
  executionEnabled,
  dailyLimitNote,
}: {
  workspace: CodeWorkspaceRecord
  presets: WorkspacePresetRecord[]
  recentRuns: CodeRunRecord[]
  executionEnabled: boolean
  dailyLimitNote: string
}) {
  const main = workspace.files.find((f) => f.path === "main.js") ?? workspace.files[0]
  const [content, setContent] = useState(main?.content ?? "")
  const [path] = useState(main?.path ?? "main.js")
  const [pending, start] = useTransition()
  const [lastRun, setLastRun] = useState<CodeRunRecord | null>(recentRuns[0] ?? null)

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
            Coding Workspace
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Run JavaScript in an isolated QuickJS sandbox — no host filesystem or
            network. {dailyLimitNote}
          </p>
        </div>
        <Badge variant={executionEnabled ? "success" : "destructive"}>
          {executionEnabled ? "Sandbox ready" : "Execution disabled"}
        </Badge>
      </div>

      {presets.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">Presets</h2>
          <div className="flex flex-wrap gap-2">
            {presets.slice(0, 8).map((p) => (
              <Button
                key={p.id}
                type="button"
                size="sm"
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  if (p.starterPrompt) {
                    setContent(
                      `// Preset: ${p.title}\nconsole.log(${JSON.stringify(p.starterPrompt.slice(0, 200))});\n`,
                    )
                  }
                }}
              >
                {p.title}
              </Button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-xs text-muted-foreground">{path}</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl"
              disabled={pending || workspace.id === "local"}
              onClick={() =>
                start(async () => {
                  const res = await saveWorkspaceFileAction({
                    workspaceId: workspace.id,
                    path,
                    content,
                  })
                  if (!res.ok) toast.error(res.message)
                  else toast.success(res.message)
                })
              }
            >
              <Save className="mr-1.5 size-3.5" />
              Save
            </Button>
            <Button
              size="sm"
              className="rounded-xl"
              disabled={pending || !executionEnabled || workspace.id === "local"}
              onClick={() =>
                start(async () => {
                  const res = await runWorkspaceAction({
                    workspaceId: workspace.id,
                    entryPath: path,
                    path,
                    content,
                  })
                  if (!res.ok) toast.error(res.message)
                  else if (res.data) {
                    setLastRun({
                      id: res.data.id,
                      status: res.data.status,
                      stdout: res.data.stdout,
                      stderr: res.data.stderr,
                      exitCode: null,
                      durationMs: res.data.durationMs,
                      errorMessage: res.data.errorMessage,
                      entryPath: path,
                      createdAt: new Date().toISOString(),
                      finishedAt: new Date().toISOString(),
                    })
                    toast.success(res.data.status)
                  }
                })
              }
            >
              <Play className="mr-1.5 size-3.5" />
              Run
            </Button>
          </div>
        </div>
        <textarea
          className="min-h-[280px] w-full rounded-2xl border border-input bg-card/80 px-3 py-2 font-mono text-xs leading-relaxed"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          spellCheck={false}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card/80 p-4">
          <h3 className="mb-2 text-sm font-medium">stdout</h3>
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap font-mono text-xs text-muted-foreground">
            {lastRun?.stdout || "—"}
          </pre>
        </div>
        <div className="rounded-2xl border border-border bg-card/80 p-4">
          <h3 className="mb-2 text-sm font-medium">
            stderr / status{" "}
            {lastRun ? (
              <span className="text-muted-foreground">({lastRun.status})</span>
            ) : null}
          </h3>
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap font-mono text-xs text-muted-foreground">
            {lastRun?.stderr ||
              lastRun?.errorMessage ||
              (lastRun ? "—" : "Run code to see output.")}
          </pre>
          {lastRun?.durationMs != null ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {lastRun.durationMs} ms
            </p>
          ) : null}
        </div>
      </section>

      <p className="text-xs text-muted-foreground">
        Prefer guided prompts?{" "}
        <Link href="/ask" className="text-primary underline">
          Open AI Tutor
        </Link>
      </p>
    </div>
  )
}
