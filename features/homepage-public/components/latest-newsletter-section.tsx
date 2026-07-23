"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Calendar, CheckCircle2, ChevronDown, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ArticleItem, NewsletterContent } from "../types/types"
import { HomeSection, SectionHeading } from "./section-primitives"

const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-indigo-500",
  "bg-cyan-500",
  "bg-fuchsia-500",
  "bg-blue-500",
]

const PAGE_SIZE = 4

function ArticleThumb({ item }: { item: ArticleItem }) {
  return (
    <Link
      href={item.href}
      className="group flex gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-border hover:bg-surface/60"
    >
      <div className="relative size-[54px] shrink-0 overflow-hidden rounded-[10px] border border-border bg-gradient-to-br from-primary/30 via-accent/20 to-cyan-500/20">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-xs font-bold text-primary">
            {item.category.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 font-display text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
          {item.title}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Calendar className="size-3" aria-hidden />
          {item.date} · {item.readingTime}
        </p>
      </div>
    </Link>
  )
}

function NewsletterForm({ newsletter }: { newsletter: NewsletterContent }) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle")
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === "submitting") return

    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus("error")
      setMessage("Please enter a valid email address.")
      return
    }

    setStatus("submitting")
    setMessage(null)
    try {
      const res = await fetch("/api/public/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(
          json?.error?.message ?? "Something went wrong. Please try again.",
        )
      }
      setStatus("success")
      setEmail("")
    } catch (error) {
      setStatus("error")
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      )
    }
  }

  if (status === "success") {
    return (
      <div className="mt-6 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-4">
        <CheckCircle2 className="size-5 shrink-0 text-primary" aria-hidden />
        <p className="text-sm text-foreground">
          You&apos;re subscribed! Watch your inbox for the next issue.
        </p>
      </div>
    )
  }

  return (
    <form className="mt-6 space-y-3" onSubmit={handleSubmit} noValidate>
      <Input
        type="email"
        name="email"
        placeholder={newsletter.placeholder}
        aria-label="Email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          if (status === "error") {
            setStatus("idle")
            setMessage(null)
          }
        }}
        disabled={status === "submitting"}
        aria-invalid={status === "error" || undefined}
        className="h-11 rounded-xl"
      />
      <Button
        type="submit"
        disabled={status === "submitting"}
        className="h-11 w-full rounded-xl"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Subscribing…
          </>
        ) : (
          newsletter.ctaLabel
        )}
      </Button>
      {status === "error" && message ? (
        <p role="alert" className="text-xs text-destructive">
          {message}
        </p>
      ) : null}
    </form>
  )
}

export function LatestNewsletterSection({
  articles,
  newsletter,
  titleOverride,
  spacing,
}: {
  articles: ArticleItem[]
  newsletter: NewsletterContent
  titleOverride?: string | null
  spacing?: string
}) {
  const [visibleCount, setVisibleCount] = useState(
    Math.min(PAGE_SIZE, articles.length),
  )
  const visible = useMemo(
    () => articles.slice(0, visibleCount),
    [articles, visibleCount],
  )
  const canLoadMore = visibleCount < articles.length

  return (
    <HomeSection
      id="newsletter"
      wide
      spacing={spacing}
      className="border-t border-border"
    >
      <SectionHeading
        eyebrow="Fresh"
        title="Latest Articles"
        description="Stay current with the newest guides and insights."
        titleOverride={titleOverride}
      />
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
        <div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {visible.map((item) => (
              <ArticleThumb key={item.id} item={item} />
            ))}
          </div>

          {canLoadMore ? (
            <Button
              type="button"
              variant="outline"
              className="mt-6 rounded-lg text-xs font-medium text-muted-foreground"
              onClick={() =>
                setVisibleCount((n) => Math.min(n + PAGE_SIZE, articles.length))
              }
            >
              Load More Articles
              <ChevronDown className="size-3.5" aria-hidden />
            </Button>
          ) : articles.length > 0 ? (
            <Button
              asChild
              variant="outline"
              className="mt-6 rounded-lg text-xs font-medium text-muted-foreground"
            >
              <Link href="/articles">
                Load More Articles
                <ChevronDown className="size-3.5" aria-hidden />
              </Link>
            </Button>
          ) : null}
        </div>

        <aside className="border-gradient-brand relative self-start rounded-3xl p-px shadow-glow">
          <div className="rounded-[calc(1.5rem-1px)] bg-card px-6 py-8 sm:px-8">
            <h3 className="type-h2 text-foreground">{newsletter.headline}</h3>
            <p className="mt-3 text-muted-foreground">
              {newsletter.description}
            </p>

            <NewsletterForm newsletter={newsletter} />

            {newsletter.socialProof ? (
              <div className="mt-6 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {AVATAR_COLORS.map((color, i) => (
                    <div
                      key={i}
                      className={`size-8 rounded-full border-2 border-card ${color}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {newsletter.socialProof}
                </p>
              </div>
            ) : null}

            <p className="mt-4 text-xs text-muted-foreground">
              {newsletter.privacy}
            </p>
          </div>
        </aside>
      </div>
    </HomeSection>
  )
}
