"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Clock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ArticleItem } from "../types/types"
import { HomeSection, SectionHeading } from "./section-primitives"

const THUMB_GRADIENTS = [
  "from-violet-600/40 to-indigo-600/30",
  "from-indigo-600/40 to-cyan-600/30",
  "from-fuchsia-600/40 to-violet-600/30",
  "from-cyan-600/40 to-blue-600/30",
]

/** Arrows fade out after this much inactivity; any touch/pointer wakes them. */
const ARROW_IDLE_MS = 3000

export function ArticlesSection({
  items,
  titleOverride,
  spacing,
}: {
  items: ArticleItem[]
  titleOverride?: string | null
  spacing?: string
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const hideTimer = useRef<number | null>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)
  const [page, setPage] = useState(0)
  const [pageCount, setPageCount] = useState(1)
  const [arrowsAwake, setArrowsAwake] = useState(true)

  const update = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft < max - 4)
    const pages = Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth))
    setPageCount(pages)
    // Map scroll progress proportionally so the last dot is always reachable
    const progress = max > 0 ? (el.scrollLeft / max) * (pages - 1) : 0
    setPage(Math.min(pages - 1, Math.max(0, Math.round(progress))))
  }, [])

  const wakeArrows = useCallback(() => {
    setArrowsAwake(true)
    if (hideTimer.current) window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(
      () => setArrowsAwake(false),
      ARROW_IDLE_MS,
    )
  }, [])

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      update()
      wakeArrows()
    })
    const el = trackRef.current
    if (!el) {
      return () => cancelAnimationFrame(frame)
    }
    const onScroll = () => {
      update()
      wakeArrows()
    }
    el.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      cancelAnimationFrame(frame)
      el.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", update)
      if (hideTimer.current) window.clearTimeout(hideTimer.current)
    }
  }, [update, wakeArrows])

  const scrollByPage = (dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" })
  }

  const goToPage = (i: number) => {
    const el = trackRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    const target = pageCount > 1 ? (i / (pageCount - 1)) * max : 0
    el.scrollTo({ left: target, behavior: "smooth" })
  }

  const arrowClass = (visible: boolean) =>
    cn(
      "absolute top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-md backdrop-blur transition-opacity duration-300 hover:border-primary/40 hover:text-primary",
      visible && arrowsAwake
        ? "opacity-100"
        : "pointer-events-none opacity-0",
    )

  return (
    <HomeSection id="articles" wide spacing={spacing}>
      <SectionHeading
        eyebrow="Editor's Pick"
        title="Featured This Week"
        description="Hand-picked articles and guides to accelerate your AI journey."
        titleOverride={titleOverride}
        action={{ label: "View all articles", href: "/articles" }}
      />

      <div
        className="relative"
        onPointerMove={wakeArrows}
        onPointerDown={wakeArrows}
        onTouchStart={wakeArrows}
      >
        {/* Swipeable snap track — native touch scrolling on all devices */}
        <div
          ref={trackRef}
          className="-mx-1 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item, i) => (
            <Link
              key={item.id}
              href={item.href}
              className="group flex w-[210px] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-[var(--motion-base)] hover:-translate-y-1 hover:border-primary/30 hover:shadow-glow sm:w-[240px] lg:w-[calc((100%-2.625rem)/4)]"
            >
              <div
                className={`relative flex h-[136px] items-center justify-center bg-gradient-to-br ${THUMB_GRADIENTS[i % THUMB_GRADIENTS.length]}`}
              >
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white/30">
                    {item.category.slice(0, 1)}
                  </span>
                )}
                <Badge className="absolute left-0 top-0 rounded-none rounded-br-md bg-primary/90 text-[9px] uppercase tracking-wider text-primary-foreground">
                  {item.category}
                </Badge>
              </div>

              <div className="flex flex-1 flex-col px-3.5 py-3">
                <h3 className="line-clamp-2 font-display text-base font-semibold leading-6 text-foreground group-hover:text-primary">
                  {item.title}
                </h3>
                <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-5 text-muted-foreground">
                  {item.description}
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3" aria-hidden />
                  {item.date} · {item.readingTime}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <button
          type="button"
          aria-label="Previous articles"
          onClick={() => scrollByPage(-1)}
          className={cn(arrowClass(canLeft), "left-1")}
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Next articles"
          onClick={() => scrollByPage(1)}
          className={cn(arrowClass(canRight), "right-1")}
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>

      {pageCount > 1 ? (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === page ? "true" : undefined}
              onClick={() => goToPage(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === page
                  ? "w-5 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60",
              )}
            />
          ))}
        </div>
      ) : null}
    </HomeSection>
  )
}
