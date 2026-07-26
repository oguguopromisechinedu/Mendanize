"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Loader2 } from "lucide-react";

import {
  MendanizeRobot,
  RobotSpeechBubble,
} from "@/components/brand/MendanizeRobot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Compact AI assistant — routes to Tier-2 Ask.
 * Provider API keys stay on the server; this UI never touches secrets.
 */
export function AiAssistantCard({ userName }: { userName?: string | null }) {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [pending, startTransition] = useTransition();
  const first = userName?.trim().split(/\s+/)[0] || "there";

  function submit(e?: FormEvent) {
    e?.preventDefault();
    const q = question.trim();
    startTransition(() => {
      const href = q ? `/ask?draft=${encodeURIComponent(q)}` : "/ask";
      router.push(href);
    });
  }

  return (
    <section className="rounded-2xl border border-border bg-card/90 p-4 shadow-md backdrop-blur-sm">
      <div className="mb-3 flex items-start gap-3">
        <div className="relative shrink-0">
          <MendanizeRobot variant="avatar" className="h-14 w-12" />
          <span className="absolute bottom-1 right-0 size-2.5 rounded-full bg-success ring-2 ring-card" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              AI Assistant
            </h3>
            <span className="rounded-md bg-success/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success">
              Online
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Mendanize AI</p>
          <RobotSpeechBubble className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Hi {first}! I’m here to help you learn faster — ask for a path, a
            quiz, or an explanation.
          </RobotSpeechBubble>
        </div>
      </div>

      <form onSubmit={submit} className="flex gap-2">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask me anything…"
          className="h-10 rounded-xl bg-background/70"
          aria-label="Ask Mendanize AI"
          disabled={pending}
        />
        <Button
          type="submit"
          size="icon"
          className="size-10 shrink-0 rounded-xl"
          disabled={pending}
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ArrowUpRight className="size-4" />
          )}
          <span className="sr-only">Open AI Tutor</span>
        </Button>
      </form>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Powered by platform AI settings — keys never leave the server.
      </p>
    </section>
  );
}
