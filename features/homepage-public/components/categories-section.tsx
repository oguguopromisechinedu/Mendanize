import Link from "next/link"
import {
  BarChart3,
  Bot,
  Brain,
  ChevronRight,
  Code2,
  Database,
  Globe,
  Layers,
  Lock,
  Palette,
  Rocket,
  Server,
  Shield,
  Smartphone,
  Sparkles,
  Terminal,
  type LucideIcon,
} from "lucide-react"

import type { CategoryItem } from "../types/types"
import { HomeSection, SectionHeading } from "./section-primitives"

const ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  code: Code2,
  database: Database,
  rocket: Rocket,
  brain: Brain,
  layers: Layers,
  terminal: Terminal,
  shield: Shield,
  palette: Palette,
  globe: Globe,
  server: Server,
  bot: Bot,
  chart: BarChart3,
  mobile: Smartphone,
  lock: Lock,
}

const DEFAULT_COLORS = [
  "#E8940C",
  "#0D0D0D",
  "#D97706",
  "#334155",
  "#F59E0B",
  "#1E293B",
  "#B45309",
]

export function CategoriesSection({
  items,
  titleOverride,
  spacing,
}: {
  items: CategoryItem[]
  titleOverride?: string | null
  spacing?: string
}) {
  return (
    <HomeSection
      id="categories"
      wide
      spacing={spacing}
      className="border-t border-border bg-surface/30"
    >
      <SectionHeading
        eyebrow="Explore"
        title="Browse by Category"
        description="Find exactly what you want to learn across every tech discipline."
        titleOverride={titleOverride}
        action={{
          label: "Explore all categories",
          href: "/categories",
          className: "hidden sm:inline-flex",
        }}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {items.map((item, i) => {
          const Icon = ICONS[item.icon] ?? Sparkles
          const color =
            item.iconColor ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]

          return (
            <Link
              key={item.id}
              href={item.href}
              className="group flex min-h-14 items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 transition-all duration-[var(--motion-base)] hover:border-primary/40 hover:bg-card hover:shadow-[0_8px_24px_rgba(13,13,13,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-h-16 sm:gap-4 sm:px-5 sm:py-4"
            >
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105 sm:size-11"
                style={{ backgroundColor: `${color}20`, color }}
              >
                <Icon className="size-4 sm:size-5" aria-hidden />
              </div>
              <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-foreground sm:text-base">
                {item.title}
              </span>
              <ChevronRight
                className="size-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          )
        })}
      </div>

      <Link
        href="/categories"
        className="group mt-4 flex w-full items-center justify-center gap-1 rounded-xl border border-primary/35 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition-all hover:border-primary/60 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:mt-5 sm:hidden"
      >
        Explore all categories
        <ChevronRight
          className="size-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </HomeSection>
  )
}
