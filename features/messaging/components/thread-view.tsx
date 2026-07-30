"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import type { ThreadListItem, ThreadMessageItem } from "@/services/messaging"
import {
  muteThreadAction,
  recallMessageAction,
  reportMessageAction,
  sendMessageAction,
} from "../actions"

export function ThreadView({
  thread,
  messages,
}: {
  thread: ThreadListItem
  messages: ThreadMessageItem[]
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [body, setBody] = useState("")
  const [attachmentUrl, setAttachmentUrl] = useState("")
  const [reportFor, setReportFor] = useState<string | null>(null)
  const [reason, setReason] = useState("")

  const title =
    thread.others.map((o) => o.name || o.email).join(", ") ||
    thread.subject ||
    "Conversation"

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 rounded-xl">
            <Link href="/account/messages">← Inbox</Link>
          </Button>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
            {title}
          </h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await muteThreadAction(thread.id, !thread.muted)
              if (!res.ok) toast.error(res.message)
              else {
                toast.success(res.message)
                router.refresh()
              }
            })
          }
        >
          {thread.muted ? "Unmute" : "Mute"}
        </Button>
      </div>

      <ul className="max-h-[55vh] space-y-3 overflow-y-auto rounded-2xl border border-border bg-card/60 p-4">
        {messages.map((m) => (
          <li
            key={m.id}
            className={`rounded-xl px-3 py-2 text-sm ${
              m.mine ? "ml-8 bg-primary/10" : "mr-8 bg-muted/50"
            }`}
          >
            {m.deletedAt ? (
              <p className="italic text-muted-foreground">Message deleted</p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  {m.sender.name || m.sender.email} ·{" "}
                  {new Date(m.createdAt).toLocaleString()}
                </p>
                <p className="mt-1 whitespace-pre-wrap">{m.body}</p>
                {m.attachmentUrl ? (
                  <a
                    href={m.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block text-xs text-primary underline"
                  >
                    Attachment
                  </a>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-2">
                  {m.canRecall ? (
                    <button
                      type="button"
                      className="text-xs text-muted-foreground underline"
                      disabled={pending}
                      onClick={() =>
                        start(async () => {
                          const res = await recallMessageAction(m.id)
                          if (!res.ok) toast.error(res.message)
                          else {
                            toast.success(res.message)
                            router.refresh()
                          }
                        })
                      }
                    >
                      Recall
                    </button>
                  ) : null}
                  {!m.mine ? (
                    <button
                      type="button"
                      className="text-xs text-muted-foreground underline"
                      onClick={() => setReportFor(m.id)}
                    >
                      Report
                    </button>
                  ) : null}
                </div>
              </>
            )}
          </li>
        ))}
        {messages.length === 0 ? (
          <li className="text-sm text-muted-foreground">No messages yet.</li>
        ) : null}
      </ul>

      {reportFor ? (
        <div className="space-y-2 rounded-xl border border-border p-3">
          <p className="text-sm font-medium">Report message</p>
          <textarea
            className="min-h-[60px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you reporting this?"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              className="rounded-xl"
              disabled={pending || reason.trim().length < 3}
              onClick={() =>
                start(async () => {
                  const res = await reportMessageAction({
                    messageId: reportFor,
                    reason,
                  })
                  if (!res.ok) toast.error(res.message)
                  else {
                    toast.success(res.message)
                    setReportFor(null)
                    setReason("")
                  }
                })
              }
            >
              Submit report
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="rounded-xl"
              onClick={() => setReportFor(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <textarea
          className="min-h-[90px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm"
          placeholder="Write a message…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <input
          className="h-9 w-full rounded-xl border border-input bg-transparent px-3 text-sm"
          placeholder="Optional image URL"
          value={attachmentUrl}
          onChange={(e) => setAttachmentUrl(e.target.value)}
        />
        <Button
          className="rounded-xl"
          disabled={pending || !body.trim()}
          onClick={() =>
            start(async () => {
              const res = await sendMessageAction({
                threadId: thread.id,
                body,
                attachmentUrl: attachmentUrl.trim() || null,
              })
              if (!res.ok) toast.error(res.message)
              else {
                setBody("")
                setAttachmentUrl("")
                router.refresh()
              }
            })
          }
        >
          Send
        </Button>
      </div>
    </div>
  )
}
