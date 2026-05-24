"use client";

import { useCallback, useRef, useState } from "react";
import { Copy, RotateCcw, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import { aiModels, DEFAULT_MODEL } from "@/lib/ai/models";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatWorkspace() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = useCallback(
    async (retryLast = false) => {
      const content = retryLast
        ? messages.filter((m) => m.role === "user").at(-1)?.content ?? ""
        : input.trim();

      if (!content || streaming) return;

      setError(null);
      setInput("");

      const userMessage: Message = { role: "user", content };
      const baseMessages = retryLast
        ? messages.slice(0, messages.findLastIndex((m) => m.role === "user"))
        : messages;

      const nextMessages = [...baseMessages, userMessage];
      setMessages([...nextMessages, { role: "assistant", content: "" }]);
      setStreaming(true);

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            messages: nextMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to generate response");
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let assistantText = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            assistantText += decoder.decode(value, { stream: true });
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: assistantText,
              };
              return updated;
            });
            scrollToBottom();
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError(err instanceof Error ? err.message : "Something went wrong");
          setMessages((prev) => prev.slice(0, -1));
        }
      } finally {
        setStreaming(false);
        scrollToBottom();
      }
    },
    [input, messages, model, streaming]
  );

  const copyMessage = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-400" />
          <h1 className="text-lg font-semibold text-white">AI Workspace</h1>
        </div>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white"
          aria-label="AI model"
        >
          {aiModels.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="mx-auto flex max-w-2xl flex-col items-center justify-center py-20 text-center">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <Sparkles className="mx-auto h-10 w-10 text-violet-400" />
              <h2 className="mt-4 text-xl font-semibold text-white">
                What can I help you create?
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Draft content, brainstorm ideas, analyze strategy, or refine copy —
                all in one premium workspace.
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "group rounded-2xl border p-4",
                  msg.role === "user"
                    ? "ml-8 border-violet-500/20 bg-violet-500/10"
                    : "mr-8 border-white/10 bg-white/5"
                )}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-500">
                    {msg.role === "user" ? "You" : "Mendanize"}
                  </span>
                  {msg.role === "assistant" && msg.content && (
                    <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyMessage(msg.content)}
                        aria-label="Copy"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {i === messages.length - 1 && !streaming && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => sendMessage(true)}
                          aria-label="Regenerate"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                {msg.role === "assistant" ? (
                  <MarkdownRenderer content={msg.content || "…"} />
                ) : (
                  <p className="whitespace-pre-wrap text-slate-200">{msg.content}</p>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {error && (
        <p className="px-4 text-center text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <div className="border-t border-white/10 p-4">
        <form
          className="mx-auto flex max-w-3xl gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Mendanize…"
            rows={2}
            className="min-h-[52px] resize-none border-white/10 bg-white/5 text-white"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={streaming}
          />
          <Button
            type="submit"
            disabled={streaming || !input.trim()}
            className="h-auto shrink-0 rounded-xl px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
