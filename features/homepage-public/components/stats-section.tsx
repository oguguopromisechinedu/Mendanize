"use client"

import {
  BookOpen,
  Cpu,
  Newspaper,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react"
import { useEffect, useState } from "react"

import { Container } from "@/components/ui/container"
import type { StatItem } from "../types/types"

const ICONS: Record<string, LucideIcon> = {
  articles: BookOpen,
  tools: Cpu,
  subscribers: Users,
  content: Newspaper,
  hub: Sparkles,
}

function AnimatedStat({ item, index }: { item: StatItem; index: number }) {
  const [show, setShow] = useState(false)
  const Icon = ICONS[item.icon ?? item.id] ?? Sparkles

  useEffect(() => {
    const id = window.setTimeout(() => setShow(true), index * 80)
    return () => window.clearTimeout(id)
  }, [index])

  return (
    <div
      className={`flex flex-col items-center gap-2 px-4 py-2 text-center transition-all duration-[var(--motion-slow)] ease-[var(--ease-out)] sm:flex-row sm:text-left ${
        show ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Icon className="size-5" aria-hidden />
      </div>
      <div>
        <p className="text-lg font-semibold text-foreground">{item.value}</p>
        <p className="text-xs text-muted-foreground">{item.label}</p>
      </div>
    </div>
  )
}

export function StatsSection({
  items,
  spacing,
}: {
  items: StatItem[]
  spacing?: string
}) {
  const spacingClass =
    spacing === "compact"
      ? "py-6"
      : spacing === "spacious"
        ? "py-12"
        : "py-8"

  return (
    <section id="stats" className={`border-y border-border bg-surface/50 ${spacingClass}`}>
      <Container size="xl">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {items.map((item, i) => (
            <AnimatedStat key={item.id} item={item} index={i} />
          ))}
        </div>
      </Container>
    </section>
  )
}
