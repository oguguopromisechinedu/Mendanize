"use client"

import Link from "next/link"
import { Calendar } from "lucide-react"

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

function ArticleThumb({ item }: { item: ArticleItem }) {
  return (
    <Link
      href={item.href}
      className="group flex gap-4 rounded-xl border border-transparent p-3 transition-colors hover:border-border hover:bg-surface/60"
    >
      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-gradient-to-br from-primary/30 via-accent/20 to-cyan-500/20">
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
        <p className="line-clamp-2 font-medium text-foreground group-hover:text-primary">
          {item.title}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="size-3" aria-hidden />
          {item.date} · {item.readingTime}
        </p>
      </div>
    </Link>
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
  return (
    <HomeSection id="newsletter" wide spacing={spacing}>
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
        <div>
          <SectionHeading
            eyebrow="Fresh"
            title="Latest Articles"
            titleOverride={titleOverride}
            description="Stay current with the newest guides and insights."
          />
          <div className="space-y-1">
            {articles.map((item) => (
              <ArticleThumb key={item.id} item={item} />
            ))}
          </div>
        </div>

        <div className="border-gradient-brand relative rounded-3xl p-px shadow-glow">
          <div className="rounded-[calc(1.5rem-1px)] bg-card px-6 py-8 sm:px-8">
            <h3 className="type-h2 text-foreground">{newsletter.headline}</h3>
            <p className="mt-3 text-muted-foreground">{newsletter.description}</p>

            <form
              className="mt-6 space-y-3"
              onSubmit={(e) => e.preventDefault()}
            >
              <Input
                type="email"
                name="email"
                placeholder={newsletter.placeholder}
                aria-label="Email"
                disabled
                className="h-11 rounded-xl"
              />
              <Button type="submit" disabled className="h-11 w-full rounded-xl">
                {newsletter.ctaLabel}
              </Button>
            </form>

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
                <p className="text-sm text-muted-foreground">{newsletter.socialProof}</p>
              </div>
            ) : null}

            <p className="mt-4 text-xs text-muted-foreground">{newsletter.privacy}</p>
          </div>
        </div>
      </div>
    </HomeSection>
  )
}
