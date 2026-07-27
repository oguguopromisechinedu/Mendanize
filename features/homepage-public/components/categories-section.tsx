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
  "#8B5CF6",
  "#6366F1",
  "#22D3EE",
  "#10B981",
  "#F59E0B",
  "#3B82F6",
  "#EC4899",
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

      {/* Desktop / tablet grid */}
      <div className="hidden grid-cols-2 gap-2.5 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {items.map((item, i) => {
          const Icon = ICONS[item.icon] ?? Sparkles
          const color =
            item.iconColor ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]

          return (
            <Link
              key={item.id}
              href={item.href}
              className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-1.5 py-3 text-center transition-all duration-[var(--motion-base)] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_0_24px_rgba(139,92,246,0.12)]"
            >
              <div
                className="flex size-9 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${color}20`, color }}
              >
                <Icon className="size-4" aria-hidden />
              </div>
              <span className="line-clamp-2 text-[10px] font-medium leading-tight text-foreground sm:text-xs">
                {item.title}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Mobile list — two columns */}
      <div className="grid grid-cols-2 gap-1.5 sm:hidden">
        {items.map((item, i) => {
          const Icon = ICONS[item.icon] ?? Sparkles
          const color =
            item.iconColor ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]

          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-2.5 py-2.5 transition-colors hover:border-primary/40 hover:bg-card hover:shadow-[0_0_20px_rgba(139,92,246,0.1)]"
            >
              <div
                className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${color}20`, color }}
              >
                <Icon className="size-3.5" aria-hidden />
              </div>
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
                {item.title}
              </span>
              <ChevronRight
                className="size-3.5 shrink-0 text-muted-foreground/60"
                aria-hidden
              />
            </Link>
          )
        })}
      </div>

      <Link
        href="/categories"
        className="group mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-primary/35 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition-all hover:border-primary/60 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:hidden"
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
