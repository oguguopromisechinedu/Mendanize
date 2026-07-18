import {
  BookOpen,
  Brain,
  RefreshCw,
  Sparkles,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react"

import type { WhyItem } from "../types/types"
import { HomeSection, SectionHeading } from "./section-primitives"

const ICONS: Record<string, LucideIcon> = {
  insights: Brain,
  tutorials: BookOpen,
  community: Users,
  updated: RefreshCw,
  skills: Target,
  ai: Sparkles,
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
    <HomeSection id="why" className="bg-surface/30" spacing={spacing}>
      <SectionHeading
        eyebrow="Why Mendanize"
        title="Why Learn with Mendanize?"
        titleOverride={titleOverride}
        description="Everything you need to master AI and modern technology."
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {items.map((item) => {
          const Icon = ICONS[item.icon ?? item.id] ?? Sparkles
          return (
            <div
              key={item.id}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Icon className="size-6" aria-hidden />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          )
        })}
      </div>
    </HomeSection>
  )
}
