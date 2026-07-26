"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import type { DiscussionSummary } from "@/services/community"
import {
  createDiscussionAction,
  likeDiscussionAction,
  replyToDiscussionAction,
  reportContentAction,
} from "../actions/actions"
import { CommunityNav } from "./community-nav"

export function DiscussionListView({
  items,
  total,
  categories,
  signedIn,
  categorySlug,
  sort,
}: {
  items: DiscussionSummary[]
  total: number
  categories: Array<{ id: string; name: string; slug: string }>
  signedIn: boolean
  categorySlug?: string
  sort?: string
}) {
  return (
    <div>
      <CommunityNav currentPath="/community/discussions" />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Discussions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} thread{total === 1 ? "" : "s"}
          </p>
        </div>
        {signedIn ? (
          <Button asChild>
            <Link href="/community/discussions/new">New discussion</Link>
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href="/sign-in?callbackUrl=/community/discussions/new">
              Sign in to post
            </Link>
          </Button>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip href="/community/discussions" active={!categorySlug}>
          All
        </FilterChip>
        {categories.map((c) => (
          <FilterChip
            key={c.id}
            href={`/community/discussions?category=${c.slug}`}
            active={categorySlug === c.slug}
          >
            {c.name}
          </FilterChip>
        ))}
      </div>

      <div className="mb-4 flex gap-2 text-sm">
        <SortLink active={sort !== "popular" && sort !== "active"} href={`/community/discussions${categorySlug ? `?category=${categorySlug}` : ""}`}>
          Latest
        </SortLink>
        <SortLink
          active={sort === "popular"}
          href={`/community/discussions?sort=popular${categorySlug ? `&category=${categorySlug}` : ""}`}
        >
          Popular
        </SortLink>
        <SortLink
          active={sort === "active"}
          href={`/community/discussions?sort=active${categorySlug ? `&category=${categorySlug}` : ""}`}
        >
          Most active
        </SortLink>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No discussions yet.</p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {items.map((d) => (
            <li key={d.id}>
              <Link
                href={`/community/discussions/${d.id}`}
                className="block px-4 py-4 hover:bg-hover"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {d.pinned ? "📌 " : ""}
                      {d.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {d.bodyPreview}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {d.category.name} · {d.author.name ?? "Learner"} ·{" "}
                      {d.replyCount} replies · {d.likeCount} likes
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-lg bg-primary/15 px-3 py-1 text-sm text-foreground"
          : "rounded-lg border border-border px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
      }
    >
      {children}
    </Link>
  )
}

function SortLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={active ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}
    >
      {children}
    </Link>
  )
}

export function NewDiscussionForm({
  categories,
}: {
  categories: Array<{ id: string; name: string; slug: string }>
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "")
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [tags, setTags] = useState("")

  return (
    <div>
      <CommunityNav currentPath="/community/discussions" />
      <h1 className="font-display text-2xl font-bold">New discussion</h1>
      <form
        className="mt-6 max-w-2xl space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          start(async () => {
            const res = await createDiscussionAction({
              categoryId,
              title,
              body,
              tags,
            })
            if (!res.ok) toast.error(res.message)
            else {
              toast.success("Discussion posted")
              router.push(`/community/discussions/${res.id}`)
            }
          })
        }}
      >
        <label className="block text-sm">
          Category
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3"
            required
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3"
            required
          />
        </label>
        <label className="block text-sm">
          Body
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2"
            required
          />
        </label>
        <label className="block text-sm">
          Tags (comma-separated)
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3"
          />
        </label>
        <Button type="submit" disabled={pending} loading={pending}>
          Post discussion
        </Button>
      </form>
    </div>
  )
}

export function DiscussionDetailView({
  discussion,
  signedIn,
  isModerator,
}: {
  discussion: {
    id: string
    title: string
    body: string
    tags: string[]
    viewCount: number
    replyCount: number
    likeCount: number
    category: { name: string; slug: string }
    author: { name: string | null }
    createdAt: string
    replies: Array<{
      id: string
      body: string
      author: { name: string | null }
      createdAt: string
    }>
  }
  signedIn: boolean
  isModerator: boolean
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [reply, setReply] = useState("")
  const [reportReason, setReportReason] = useState("")

  return (
    <div>
      <CommunityNav currentPath="/community/discussions" />
      <p className="text-sm text-muted-foreground">
        <Link
          href={`/community/discussions?category=${discussion.category.slug}`}
          className="hover:text-foreground"
        >
          {discussion.category.name}
        </Link>
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold">{discussion.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {discussion.author.name ?? "Learner"} ·{" "}
        {new Date(discussion.createdAt).toLocaleDateString()} ·{" "}
        {discussion.viewCount} views · {discussion.likeCount} likes
      </p>
      {discussion.tags.length > 0 ? (
        <p className="mt-2 flex flex-wrap gap-2">
          {discussion.tags.map((t) => (
            <span
              key={t}
              className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </p>
      ) : null}

      <div className="mt-6 whitespace-pre-wrap text-foreground/90">
        {discussion.body}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {signedIn ? (
          <Button
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await likeDiscussionAction(discussion.id)
                if (!res.ok) toast.error(res.message)
                else router.refresh()
              })
            }
          >
            Like
          </Button>
        ) : null}
        <Button asChild variant="outline" size="sm">
          <Link href={`/ask?context=community&discussionId=${discussion.id}`}>
            Ask Mendanize AI
          </Link>
        </Button>
        {signedIn ? (
          <form
            className="flex flex-wrap items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              start(async () => {
                const res = await reportContentAction({
                  contentType: "DISCUSSION",
                  contentId: discussion.id,
                  reason: reportReason || "Reported as inappropriate",
                })
                if (!res.ok) toast.error(res.message)
                else {
                  toast.success("Report submitted")
                  setReportReason("")
                }
              })
            }}
          >
            <input
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Report reason"
              className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
            />
            <Button type="submit" size="sm" variant="ghost" disabled={pending}>
              Report
            </Button>
          </form>
        ) : null}
        {isModerator ? (
          <p className="text-xs text-muted-foreground">
            Community moderator — you can hide content within /community only.
          </p>
        ) : null}
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">
          Replies ({discussion.replies.length})
        </h2>
        <ul className="mt-4 space-y-4">
          {discussion.replies.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-border bg-surface/30 px-4 py-3"
            >
              <p className="text-xs text-muted-foreground">
                {r.author.name ?? "Learner"} ·{" "}
                {new Date(r.createdAt).toLocaleString()}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm">{r.body}</p>
            </li>
          ))}
        </ul>

        {signedIn ? (
          <form
            className="mt-6 space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              start(async () => {
                const res = await replyToDiscussionAction({
                  discussionId: discussion.id,
                  body: reply,
                })
                if (!res.ok) toast.error(res.message)
                else {
                  setReply("")
                  toast.success("Reply posted")
                  router.refresh()
                }
              })
            }}
          >
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={4}
              placeholder="Write a reply…"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              required
            />
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={pending} loading={pending}>
                Post reply
              </Button>
              <Button asChild type="button" variant="outline">
                <Link href={`/ask?context=community&discussionId=${discussion.id}`}>
                  Draft with Ask Mendanize AI
                </Link>
              </Button>
            </div>
          </form>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            <Link href="/sign-in" className="text-primary hover:underline">
              Sign in
            </Link>{" "}
            to reply.
          </p>
        )}
      </section>
    </div>
  )
}
