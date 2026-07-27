"use client"

import { Container } from "@/components/ui/container"
import type { StatItem } from "../types/types"
import { LiveHomepageStats } from "./live-homepage-stats"

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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-4">
          <LiveHomepageStats items={items} variant="grid" />
        </div>
      </Container>
    </section>
  )
}
