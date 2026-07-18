import Link from "next/link"
import { Clock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { ArticleItem } from "../types/types"
import { HomeSection, SectionHeading } from "./section-primitives"

const THUMB_GRADIENTS = [
  "from-violet-600/40 to-indigo-600/30",
  "from-indigo-600/40 to-cyan-600/30",
  "from-fuchsia-600/40 to-violet-600/30",
  "from-cyan-600/40 to-blue-600/30",
]

export function ArticlesSection({
  items,
  titleOverride,
  spacing,
}: {
  items: ArticleItem[]
  titleOverride?: string | null
  spacing?: string
}) {
  return (
    <HomeSection id="articles" wide spacing={spacing}>
      <SectionHeading
        eyebrow="Editor's Pick"
        title="Featured This Week"
        titleOverride={titleOverride}
        description="Hand-picked articles and guides to accelerate your AI journey."
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <Link
            key={item.id}
            href={item.href}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-[var(--motion-base)] hover:-translate-y-1 hover:border-primary/30 hover:shadow-glow"
          >
            <div
              className={`relative aspect-[16/10] bg-gradient-to-br ${THUMB_GRADIENTS[i % THUMB_GRADIENTS.length]}`}
            >
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <span className="text-3xl font-bold text-white/30">
                    {item.category.slice(0, 1)}
                  </span>
                </div>
              )}
              <Badge className="absolute left-3 top-3 bg-primary/90 text-[10px] uppercase tracking-wider text-primary-foreground">
                {item.category}
              </Badge>
            </div>

            <div className="flex flex-1 flex-col p-4">
              <h3 className="line-clamp-2 font-semibold text-foreground group-hover:text-primary">
                {item.title}
              </h3>
              <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
                {item.description}
              </p>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3" aria-hidden />
                {item.date} · {item.readingTime}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </HomeSection>
  )
}
