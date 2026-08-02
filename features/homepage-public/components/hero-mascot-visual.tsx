import {
  BookOpen,
  Cloud,
  Compass,
  Hammer,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

type FloatingCard = {
  icon: LucideIcon
  label: string
  sub: string
  className: string
}

const CARDS: FloatingCard[] = [
  {
    icon: BookOpen,
    label: "Learn",
    sub: "Courses & paths",
    className: "left-0 top-6",
  },
  {
    icon: Hammer,
    label: "Build",
    sub: "AI tools & apps",
    className: "left-2 bottom-10",
  },
  {
    icon: Compass,
    label: "Explore",
    sub: "News & resources",
    className: "right-0 top-16",
  },
  {
    icon: Cloud,
    label: "Cloud",
    sub: "Sync & deploy",
    className: "right-2 bottom-16",
  },
]

/**
 * Premium hero art: branded 3D mascot on a soft orange wash with
 * floating capability cards. Decorative — hidden from assistive tech.
 */
export function HeroMascotVisual({ src }: { src?: string | null }) {
  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[520px]"
      aria-hidden
    >
      {/* Soft brand glow */}
      <div className="absolute inset-8 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute inset-0 rounded-[2.5rem] bg-dot-grid opacity-60 [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]" />

      {/* Mascot */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src || "/images/hero-mascot.png"}
          alt=""
          className="w-[76%] max-w-[400px] object-contain drop-shadow-[0_24px_48px_rgba(241,90,36,0.18)]"
        />
      </div>

      {/* Floating capability cards */}
      {CARDS.map((card) => (
        <div
          key={card.label}
          className={cn(
            "absolute flex items-center gap-2.5 rounded-xl border border-border bg-card/90 px-3 py-2 shadow-elevated backdrop-blur-sm",
            card.className,
          )}
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <card.icon className="size-4" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-foreground">
              {card.label}
            </span>
            <span className="block text-[11px] text-muted-foreground">
              {card.sub}
            </span>
          </span>
        </div>
      ))}

      {/* Powered-by chip */}
      <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-card/90 px-4 py-1.5 shadow-elevated backdrop-blur-sm">
        <span className="flex size-5 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">
          M
        </span>
        <span className="text-xs font-medium text-foreground">
          Powered by MDANO AI
        </span>
        <TrendingUp className="size-3.5 text-primary" />
      </div>
    </div>
  )
}
