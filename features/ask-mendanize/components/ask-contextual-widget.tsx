"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Mic, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import MarkdownRenderer from "@/components/ai/MarkdownRenderer";
import type { AskContextTypeValue, AskTier1Result } from "@/services/ai/ask-types";
import { ASK_DASHBOARD_HREF, ASK_SIGN_IN_HREF } from "../constants/constants";

type AskContextualWidgetProps = {
  contextType: AskContextTypeValue;
  contextId?: string | null;
  contextTitle: string;
  contextExcerpt?: string | null;
  suggestions?: string[];
};

/**
 * Tier 1 — public contextual Ask widget (ephemeral, no auth required).
 */
export function AskContextualWidget({
  contextType,
  contextId,
  contextTitle,
  contextExcerpt,
  suggestions = [
    "Explain this simply",
    "What should I learn next?",
    "Give me a quick checklist",
  ],
}: AskContextualWidgetProps) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AskTier1Result | null>(null);
  const [pending, startTransition] = useTransition();

  function ask(q?: string) {
    const next = (q ?? question).trim();
    if (!next) return;
    setQuestion(next);
    startTransition(async () => {
      try {
        const res = await fetch("/api/public/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: next,
            contextType,
            contextId: contextId ?? null,
            contextTitle,
            contextExcerpt: contextExcerpt ?? null,
          }),
        });
        const json = await res.json();
        if (!res.ok || json.error) {
          toast.error(json.error?.message ?? "Ask failed");
          return;
        }
        setResult(json.data as AskTier1Result);
      } catch {
        toast.error("Ask failed");
      }
    });
  }

  const continueHref = result
    ? `${ASK_SIGN_IN_HREF}?callbackUrl=${encodeURIComponent(`${ASK_DASHBOARD_HREF}?handoff=${result.handoffId}`)}`
    : ASK_SIGN_IN_HREF;

  return (
    <section className="rounded-2xl border border-border bg-surface/60 p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="size-4 text-primary" aria-hidden />
        <h2 className="text-sm font-semibold text-foreground">Ask about this</h2>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">
        Single-turn help for <span className="text-foreground">{contextTitle}</span>.
        Sign in to continue the conversation.
      </p>

      <div className="space-y-3">
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about this page…"
          rows={3}
          aria-label="Ask Mendanize question"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={pending || !question.trim()}
            onClick={() => ask()}
          >
            {pending ? "Thinking…" : "Ask"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled
            title="Voice placeholder"
            aria-label="Voice input placeholder"
          >
            <Mic className="size-4" />
          </Button>
        </div>
        <ul className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
                onClick={() => ask(s)}
                disabled={pending}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {result ? (
        <div className="mt-5 space-y-4 border-t border-border pt-4" aria-live="polite">
          {result.placeholder ? (
            <p className="text-xs text-muted-foreground">
              Article used a fallback reply — check Anthropic credits / API keys.
            </p>
          ) : null}
          {result.images?.length ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Generated visual · OpenAI
              </p>
              {result.images.map((image) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={image.url}
                  src={image.url}
                  alt={image.alt}
                  className="w-full rounded-xl border border-border object-cover"
                />
              ))}
            </div>
          ) : null}
          <MarkdownRenderer
            content={result.answer}
            className="prose-neutral max-w-none text-sm dark:prose-invert"
          />
          {result.related.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Related learning
              </p>
              <ul className="space-y-1.5">
                {result.related.map((r) => (
                  <li key={r.href}>
                    <Link
                      href={r.href}
                      className="text-sm text-primary hover:underline"
                    >
                      {r.title}
                    </Link>
                    {r.reason ? (
                      <span className="ml-2 text-xs text-muted-foreground">
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
    </section>
  );
}
