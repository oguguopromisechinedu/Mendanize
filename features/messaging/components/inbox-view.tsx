"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import type { ThreadListItem } from "@/services/messaging"
import { blockUserAction, startThreadAction } from "../actions"

export function MessagesInboxView({
  threads,
  withUserId,
}: {
  threads: ThreadListItem[]
  withUserId?: string | null
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [email, setEmail] = useState("")
  const [body, setBody] = useState("")
  const [blockEmail, setBlockEmail] = useState("")

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Messages
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Private direct messages with other learners. Admins moderate reports
          only — they never impersonate your account.
        </p>
      </div>

      <section className="space-y-3 rounded-2xl border border-border bg-card/80 p-4">
        <h2 className="text-lg font-medium">New conversation</h2>
        {withUserId ? (
          <p className="text-xs text-muted-foreground">
            Deep-link user id: {withUserId} — enter their email to start.
          </p>
        ) : null}
        <input
          type="email"
          className="h-9 w-full rounded-xl border border-input bg-transparent px-3 text-sm"
          placeholder="Learner email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <textarea
          className="min-h-[80px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm"
          placeholder="Optional first message"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <Button
          className="rounded-xl"
          disabled={pending || !email.trim()}
          onClick={() =>
            start(async () => {
              const res = await startThreadAction({
                email,
                body: body || undefined,
              })
              if (!res.ok) toast.error(res.message)
              else {
                toast.success(res.message)
                setBody("")
                if (res.data?.threadId) {
                  router.push(`/account/messages/${res.data.threadId}`)
                } else router.refresh()
              }
            })
          }
        >
          Start chat
        </Button>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Inbox</h2>
        {threads.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No direct message threads yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {threads.map((t) => {
              const label =
                t.others.map((o) => o.name || o.email).join(", ") ||
                t.subject ||
                "Conversation"
              return (
                <li key={t.id}>
                  <Link
                    href={`/account/messages/${t.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/80 px-4 py-3 transition hover:border-primary/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {t.unread ? "● " : ""}
                        {label}
                        {t.muted ? " (muted)" : ""}
                      </p>
                      {t.lastPreview ? (
                        <p className="truncate text-xs text-muted-foreground">
                          {t.lastPreview}
                        </p>
                      ) : null}
                    </div>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {new Date(t.updatedAt).toLocaleDateString()}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3 border-t border-border/60 pt-8">
        <h2 className="text-lg font-medium">Block a learner</h2>
        <div className="flex flex-wrap gap-2">
          <input
            type="email"
            className="h-9 min-w-[200px] flex-1 rounded-xl border border-input bg-transparent px-3 text-sm"
            placeholder="email@example.com"
            value={blockEmail}
            onChange={(e) => setBlockEmail(e.target.value)}
          />
          <Button
            variant="outline"
            className="rounded-xl"
            disabled={pending || !blockEmail.trim()}
            onClick={() =>
              start(async () => {
                const res = await blockUserAction(blockEmail)
                if (!res.ok) toast.error(res.message)
                else {
                  toast.success(res.message)
                  setBlockEmail("")
                  router.refresh()
                }
              })
            }
          >
            Block
          </Button>
        </div>
      </section>

      <section className="space-y-3 border-t border-border/60 pt-8">
        <h2 className="text-lg font-medium">Also here</h2>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/ask">AI Tutor</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/community/discussions">Community</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
