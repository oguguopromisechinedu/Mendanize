import Link from "next/link"
import {
  BookOpen,
  Cpu,
  GraduationCap,
  Newspaper,
  Sparkles,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import type { AskContent, HeroContent, StatItem } from "../types/types"
import { HeroAskBar } from "./hero-ask-bar"
import { HeroBrainVisual } from "./hero-brain-visual"
import { HomeSection } from "./section-primitives"

const STAT_ICONS: Record<string, LucideIcon> = {
  articles: BookOpen,
  tools: Cpu,
  learners: GraduationCap,
  subscribers: Users,
  content: Newspaper,
  hub: Sparkles,
}

export function HeroSection({
  content,
  ask,
  stats,
}: {
  content: HeroContent
  ask?: AskContent
  stats?: StatItem[]
}) {
  const brain = content.imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={content.imageUrl}
      alt=""
      className="size-full rounded-[2rem] border border-border object-cover shadow-glow"
    />
  ) : (
    <HeroBrainVisual />
  )

  return (
    <HomeSection
      fullBleed
      className="relative overflow-hidden border-b border-border bg-hero-gradient"
    >
      <Container
        size="xl"
        className="relative grid grid-cols-1 items-center gap-8 py-11 sm:gap-10 sm:py-14 lg:grid-cols-2 lg:gap-12 lg:py-16"
      >
        {/* Copy — always left column on desktop */}
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          {content.eyebrow ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Zap className="size-3" aria-hidden />
              {content.eyebrow}
            </span>
          ) : (
            <p className="font-display text-sm font-semibold uppercase tracking-[0.28em] text-primary">
              {content.brand}
            </p>
          )}

          <h1 className="type-display mt-4 text-[clamp(1.875rem,5vw,2.75rem)] leading-[1.05] tracking-[-0.02em] text-foreground lg:text-[2.75rem] lg:leading-[1.05] lg:tracking-[-0.02em]">
            {content.headline}
            {(content.headlineLead || content.headlineAccent) && (
              <>
                <br />
                {content.headlineLead ? `${content.headlineLead} ` : null}
                {content.headlineAccent ? (
                  <span className="text-gradient-brand">
                    {content.headlineAccent}
                  </span>
                ) : null}
              </>
            )}
          </h1>

          <p className="mt-3.5 max-w-[27rem] text-lg leading-[1.6] text-muted-foreground">
            {content.description}
          </p>

          <div className="mx-auto mt-6 max-w-[300px] lg:hidden">
            {content.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={content.imageUrl}
                alt=""
                className="w-full rounded-2xl border border-border object-cover shadow-glow"
              />
            ) : (
              <HeroBrainVisual height={260} />
            )}
          </div>

          {ask && content.showAskInHero !== false ? (
            <HeroAskBar content={ask} />
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2.5">
            <Button asChild size="lg" className="rounded-xl shadow-glow">
              <Link href={content.primaryCta.href}>
                {content.primaryCta.label}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl">
              <Link href={content.secondaryCta.href}>
                {content.secondaryCta.label}
              </Link>
            </Button>
          </div>

          {stats && stats.length > 0 ? (
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2.5">
              {stats.map((s) => {
                const Icon = STAT_ICONS[s.icon ?? s.id] ?? Sparkles
                return (
                  <div key={s.id} className="flex items-center gap-2">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <span className="text-lg font-bold text-foreground">
                      {s.value}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {s.label}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : content.trustLine ? (
            <p className="mt-6 text-sm text-muted-foreground">
              {content.trustLine}
            </p>
          ) : null}
        </div>

        {/* 3D brain — always right column on desktop */}
        <div className="relative hidden min-h-[380px] lg:col-start-2 lg:row-start-1 lg:block">
          {brain}
        </div>
      </Container>
    </HomeSection>
  )
}
