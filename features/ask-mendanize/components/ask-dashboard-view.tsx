"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Settings, ThumbsUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import MarkdownRenderer from "@/components/ai/MarkdownRenderer";
import type { AskDashboardPayload } from "@/services/ai/ask-types";
import {
  ADMIN_COMMAND_SUGGESTIONS,
  adminActionsForQuery,
  resolveAdminIntent,
} from "@/features/admin-dashboard/utils/admin-intent";
import {
  createAskConversationAction,
  sendAskMessageAction,
  submitAskFeedbackAction,
} from "../actions/actions";

export function AskDashboardView({
  payload,
  initialDraft,
  initialIntent,
}: {
  payload: AskDashboardPayload;
  initialDraft?: string | null;
  initialIntent?: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState(initialDraft ?? "");
  const [activeId, setActiveId] = useState(payload.active?.id ?? null);
  const autoSent = useRef(false);

  const active = useMemo(() => {
    if (!activeId) return payload.active;
    if (payload.active?.id === activeId) return payload.active;
    return payload.active;
  }, [activeId, payload.active]);

  const cmsShortcuts = useMemo(() => {
    const q = draft.trim() || initialDraft?.trim() || "organize CMS";
    return adminActionsForQuery(q);
  }, [draft, initialDraft]);

  const intentHint = useMemo(() => {
    const q = draft.trim() || initialDraft?.trim();
    if (!q) return null;
    const intent = resolveAdminIntent(q);
    if (intent.kind === "ask_general") return null;
    return intent;
  }, [draft, initialDraft]);

  function selectConversation(id: string) {
    setActiveId(id);
    router.push(`/dashboard/ask?c=${id}`);
  }

  function newChat() {
    startTransition(async () => {
      const res = await createAskConversationAction({ contextType: "GENERAL" });
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      const data = res.data as { id: string };
      toast.success(res.message);
      router.push(`/dashboard/ask?c=${data.id}`);
      router.refresh();
    });
  }

  function send(text?: string) {
    const content = (text ?? draft).trim();
    if (!content) return;
    if (!active?.id) {
      startTransition(async () => {
        const created = await createAskConversationAction({
          contextType: "GENERAL",
          title: content.slice(0, 60),
        });
        if (!created.ok) {
          toast.error(created.message);
          return;
        }
        const conv = created.data as { id: string };
        const sent = await sendAskMessageAction({
          conversationId: conv.id,
          content,
        });
        if (!sent.ok) toast.error(sent.message);
        else {
          setDraft("");
          router.push(`/dashboard/ask?c=${conv.id}`);
          router.refresh();
        }
      });
      return;
    }

    startTransition(async () => {
      const res = await sendAskMessageAction({
        conversationId: active.id,
        content,
      });
      if (!res.ok) toast.error(res.message);
      else {
        setDraft("");
        router.refresh();
      }
    });
  }

  function feedback(messageId: string) {
    startTransition(async () => {
      const res = await submitAskFeedbackAction({
        conversationId: active?.id,
        messageId,
        rating: 5,
      });
      if (!res.ok) toast.error(res.message);
      else toast.success(res.message);
    });
  }

  useEffect(() => {
    const seed = initialDraft?.trim();
    if (!seed || autoSent.current) return;
    const key = `mendanize-ask-auto:${seed.slice(0, 120)}`;
    try {
      if (typeof window !== "undefined" && sessionStorage.getItem(key)) {
        autoSent.current = true;
        return;
      }
      sessionStorage.setItem(key, "1");
    } catch {
      /* ignore storage failures */
    }
    autoSent.current = true;
    send(seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- command-bar handoff once
  }, [initialDraft]);

  return (
    <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[14rem_minmax(0,1fr)_14rem]">
      <aside className="space-y-3 rounded-xl border border-border bg-surface p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            History
          </p>
          <Button type="button" size="sm" variant="outline" onClick={newChat} disabled={pending}>
            <Plus className="size-3.5" />
          </Button>
        </div>
        <ul className="space-y-1">
          {payload.conversations.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => selectConversation(c.id)}
                className={`w-full rounded-lg px-2 py-2 text-left text-sm ${
                  active?.id === c.id
                    ? "bg-primary/15 text-primary"
                    : "text-foreground hover:bg-hover"
                }`}
              >
                <span className="line-clamp-2">{c.title}</span>
              </button>
            </li>
          ))}
          {!payload.conversations.length ? (
            <li className="px-2 text-xs text-muted-foreground">No chats yet</li>
          ) : null}
        </ul>
      </aside>

      <section className="flex min-h-[32rem] flex-col rounded-xl border border-border bg-background">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div>
            <h1 className="font-display text-lg font-semibold">Ask Mendanize Admin</h1>
            <p className="text-xs text-muted-foreground">
              {active?.contextTitle
                ? `CMS context: ${active.contextTitle}`
                : "Generate content or organize the CMS — not the live frontend"}
            </p>
            {intentHint || initialIntent ? (
              <p className="mt-1 text-[11px] text-primary">
                {intentHint
                  ? `Intent: ${intentHint.label}`
                  : `Intent: ${initialIntent}`}
              </p>
            ) : null}
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href={payload.aiSettingsHref}>
              <Settings className="mr-1.5 size-3.5" />
              AI settings
            </Link>
          </Button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
          {!active?.messages.length ? (
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Ask to generate articles/images or organize articles, categories,
                homepage, SEO, media, and publishing.
              </p>
              <ul className="flex flex-wrap gap-2">
                {(payload.suggestions.length
                  ? payload.suggestions
                  : ADMIN_COMMAND_SUGGESTIONS.map((s) => s.draft)
                ).map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      className="rounded-full border border-border px-3 py-1 text-xs hover:border-primary/40 hover:text-foreground"
                      onClick={() => send(s)}
                      disabled={pending}
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            active.messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-xl px-3 py-2 text-sm ${
                  m.role === "USER"
                    ? "ml-8 bg-primary/10 text-foreground"
                    : "mr-8 border border-border bg-surface"
                }`}
              >
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {m.role === "USER" ? "You" : "Ask Mendanize"}
                </p>
                {m.role === "ASSISTANT" ? (
                  <MarkdownRenderer
                    content={m.content}
                    className="prose-neutral max-w-none text-sm dark:prose-invert"
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                )}
                {m.role === "ASSISTANT" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="mt-1 h-7 px-2"
                    onClick={() => feedback(m.id)}
                    disabled={pending}
                  >
                    <ThumbsUp className="mr-1 size-3.5" />
                    Helpful
                  </Button>
                ) : null}
              </div>
            ))
          )}
        </div>

        <form
          className="border-t border-border p-3"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Generate an article, organize drafts, update homepage, SEO checklist…"
            rows={3}
            aria-label="Message"
          />
          <div className="mt-2 flex justify-end">
            <Button type="submit" disabled={pending || !draft.trim()}>
              {pending ? "Sending…" : "Send"}
            </Button>
          </div>
        </form>
      </section>

      <aside className="space-y-4 rounded-xl border border-border bg-surface p-3">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            CMS actions
          </p>
          <ul className="space-y-2">
            {cmsShortcuts.map((a) => (
              <li key={a.href}>
                <Link
                  href={a.href}
                  className="block rounded-lg border border-border px-2 py-2 text-left text-sm hover:border-primary/40"
                >
                  <span className="font-medium text-foreground">{a.title}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {a.reason}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Prompt templates
          </p>
          <ul className="space-y-2">
            {payload.templates.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className="w-full rounded-lg border border-border px-2 py-2 text-left text-sm hover:border-primary/40"
                  onClick={() => {
                    setDraft(t.promptText);
                  }}
                >
                  <span className="font-medium text-foreground">{t.name}</span>
                  {t.description ? (
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {t.description}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">
          AI configuration is owned by Platform Settings — this screen only links there
          (MES-020).
        </p>
      </aside>
    </div>
  );
}
