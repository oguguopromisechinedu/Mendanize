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
  "#A855F7",
  "#EC4899",
  "#10B981",
  "#F59E0B",
  "#3B82F6",
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
    <HomeSection id="categories" wide spacing={spacing}>
      <SectionHeading
        eyebrow="Explore"
        title="Browse by Category"
        titleOverride={titleOverride}
        description="Find exactly what you want to learn across every tech discipline."
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {items.map((item, i) => {
          const Icon = ICONS[item.icon] ?? Sparkles
          const color = item.iconColor ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]

          return (
            <Link
              key={item.id}
              href={item.href}
              className="group flex flex-col items-center gap-2.5 rounded-xl border border-border bg-card/60 p-4 text-center transition-all duration-[var(--motion-base)] hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card hover:shadow-glow sm:gap-3"
            >
              <div
                className="flex size-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${color}20`, color }}
              >
                <Icon className="size-5" aria-hidden />
              </div>
              <span className="line-clamp-2 text-xs font-medium leading-tight text-foreground sm:text-sm">
                {item.title}
              </span>
              <ChevronRight
                className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 lg:hidden"
                aria-hidden
              />
            </Link>
          )
        })}
      </div>
    </HomeSection>
  )
}
