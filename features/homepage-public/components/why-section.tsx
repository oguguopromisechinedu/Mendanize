import {
  Bell,
  BookOpen,
  Brain,
  Cpu,
  Play,
  RefreshCw,
  Sparkles,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react"

import type { WhyItem } from "../types/types"
import { HomeSection, SectionHeading } from "./section-primitives"

const ICONS: Record<string, LucideIcon> = {
  insights: Cpu,
  tutorials: BookOpen,
  reviews: Star,
  videos: Play,
  updated: Bell,
  community: Users,
  brain: Brain,
  sparkles: Sparkles,
  refresh: RefreshCw,
}

export function WhySection({
  items,
  titleOverride,
  spacing,
}: {
  items: WhyItem[]
  titleOverride?: string | null
  spacing?: string
}) {
  return (
    <HomeSection
      id="why"
      spacing={spacing}
      className="border-t border-border"
    >
      <SectionHeading
        eyebrow="Why Mendanize"
        title="Why Learn with Mendanize?"
        titleOverride={titleOverride}
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6 lg:gap-5">
        {items.map((item) => {
          const Icon = ICONS[item.icon ?? item.id] ?? Sparkles
          return (
            <div key={item.id}>
              <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Icon className="size-4" aria-hidden />
              </div>
              <p className="text-xs font-semibold text-foreground">{item.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          )
        })}
      </div>
    </HomeSection>
  )
}

