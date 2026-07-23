"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ADMIN_COMMAND_SUGGESTIONS,
  resolveAdminIntent,
} from "../utils/admin-intent"

export function AdminAiCommandBar({ className }: { className?: string }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [pending, startTransition] = useTransition()

  function submit(text?: string) {
    const next = (text ?? query).trim()
    if (!next) return

    const intent = resolveAdminIntent(next)
    startTransition(() => {
      if (intent.openAsk) {
        // Organizing / planning work → Ask Admin with CMS surface
        router.push(
          `/ask?draft=${encodeURIComponent(intent.draft)}&intent=${encodeURIComponent(intent.kind)}`,
        )
        return
      }
      // Direct generate tools → Studio (optionally still open Ask for complex asks)
      router.push(intent.href)
    })
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card/80 p-2 shadow-sm">
        <Sparkles className="ml-2 size-4 shrink-0 text-primary" aria-hidden />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit()
          }}
          placeholder="Generate content or organize the CMS — ask anything…"
          aria-label="Ask Mendanize Admin"
          className="h-9 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <Button
          type="button"
          size="sm"
          className="shrink-0 rounded-lg"
          disabled={pending || !query.trim()}
          onClick={() => submit()}
        >
          {pending ? "…" : "Go"}
          <ArrowRight className="size-3.5" />
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Can generate articles/images or help organize articles, categories,
        homepage, SEO, media, and publishing.
      </p>
      <div className="flex flex-wrap gap-2">
        {ADMIN_COMMAND_SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            type="button"
            className="rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            onClick={() => {
              setQuery(s.draft)
              submit(s.draft)
            }}
            disabled={pending}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
