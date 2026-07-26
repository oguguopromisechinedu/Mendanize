"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { ArrowRight, Bot } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import MarkdownRenderer from "@/components/ai/MarkdownRenderer"
import type { AskTier1Result } from "@/services/ai/ask-types"
import {
  ASK_DASHBOARD_HREF,
  ASK_SIGN_IN_HREF,
} from "@/features/ask-mendanize/constants/constants"
import type { AskContent } from "../types/types"

function AskImages({ images }: { images: AskTier1Result["images"] }) {
  if (!images.length) return null
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Generated visual · OpenAI
      </p>
      <div className="grid gap-3 sm:grid-cols-1">
        {images.map((image) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={image.url}
            src={image.url}
            alt={image.alt}
            className="w-full rounded-xl border border-border object-cover"
          />
        ))}
      </div>
    </div>
  )
}

export function HeroAskBar({ content }: { content: AskContent }) {
  const [question, setQuestion] = useState("")
  const [result, setResult] = useState<AskTier1Result | null>(null)
  const [pending, startTransition] = useTransition()

  function ask(q?: string) {
    const next = (q ?? question).trim()
    if (!next) return
    setQuestion(next)
    setResult(null)
    startTransition(async () => {
      try {
        const res = await fetch("/api/public/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: next,
            contextType: "HOMEPAGE",
            contextId: null,
            contextTitle: content.title,
            contextExcerpt: content.description,
          }),
        })
        const json = await res.json()
        if (!res.ok || json.error) {
          toast.error(json.error?.message ?? "Ask failed")
          return
        }
        setResult(json.data as AskTier1Result)
      } catch {
        toast.error("Ask failed")
      }
    })
  }

  const continueHref = result
    ? `${ASK_SIGN_IN_HREF}?callbackUrl=${encodeURIComponent(`${ASK_DASHBOARD_HREF}?handoff=${result.handoffId}`)}`
    : ASK_SIGN_IN_HREF

  return (
    <div className="mt-5 space-y-2.5 sm:mt-8 sm:space-y-3">
      <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card/80 p-1.5 shadow-glow backdrop-blur-sm sm:gap-2 sm:rounded-2xl sm:p-2">
        <div className="ml-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground sm:size-8">
          <Bot className="size-3.5 sm:size-4" aria-hidden />
        </div>
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") ask()
          }}
          placeholder={content.placeholder}
          aria-label="Ask Mendanize AI"
          className="h-9 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0 sm:h-10 sm:text-base"
        />
        <Button
          type="button"
          size="icon"
          className="size-9 shrink-0 rounded-lg sm:size-10 sm:rounded-xl"
          disabled={pending || !question.trim()}
          onClick={() => ask()}
          aria-label="Submit question"
        >
          <ArrowRight className="size-4" />
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <span className="text-[11px] text-muted-foreground sm:text-xs">Try:</span>
        {content.suggestions.map((s) => (
          <button
            key={s}
            type="button"
            className="rounded-full border border-border bg-surface/60 px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:px-3 sm:py-1 sm:text-xs"
            onClick={() => ask(s)}
            disabled={pending}
          >
            {s}
          </button>
        ))}
      </div>

      {pending ? (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Claude is writing an article · OpenAI is generating an image…
        </p>
      ) : null}

      {result ? (
        <div
          className="space-y-4 rounded-2xl border border-border bg-card/70 p-4 shadow-sm backdrop-blur-sm"
          aria-live="polite"
        >
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-border px-2 py-0.5">
              Article: {result.providers?.text ?? "unknown"}
            </span>
            <span className="rounded-full border border-border px-2 py-0.5">
              Image: {result.providers?.image ?? "none"}
            </span>
          </div>
          {result.placeholder ? (
            <p className="text-xs text-muted-foreground">
              Article used a fallback reply — check Anthropic credits / API keys.
            </p>
          ) : null}
          <AskImages images={result.images ?? []} />
          <MarkdownRenderer
            content={result.answer}
            className="prose-neutral max-w-none text-sm dark:prose-invert"
          />
          {result.related.length > 0 ? (
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:mb-2 sm:text-xs">
                Related learning
              </p>
              <ul className="flex flex-col gap-1 sm:gap-1.5">
                {result.related.map((r) => (
                  <li key={r.href} className="min-w-0">
                    <Link
                      href={r.href}
                      className="block truncate text-sm text-primary hover:underline"
                    >
                      {r.title}
                    </Link>
                    {r.reason ? (
                      <span className="mt-0.5 block truncate text-[11px] text-muted-foreground sm:ml-0 sm:text-xs">
                        {r.reason}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="rounded-lg border border-dashed border-border px-3 py-3 text-sm">
            <p className="text-foreground">Want to keep going?</p>
            <p className="mt-1 text-muted-foreground">
              Sign in to open the full Ask Mendanize chat with this context.
            </p>
            <Button asChild size="sm" className="mt-3">
              <Link href={continueHref}>Continue in dashboard</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
