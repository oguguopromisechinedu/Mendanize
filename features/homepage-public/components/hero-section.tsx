import Link from "next/link"
import { Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import type { AskContent, HeroContent, StatItem } from "../types/types"
import { HeroAskBar } from "./hero-ask-bar"
import { HeroMascotVisual } from "./hero-mascot-visual"
import { LiveHomepageStats } from "./live-homepage-stats"
import { HomeSection } from "./section-primitives"

/** Ignore legacy stock-photo seeds so the branded mascot art shows by default. */
function resolveHeroImage(imageUrl?: string | null) {
  if (!imageUrl) return null
  if (/unsplash|placeholder|picsum/i.test(imageUrl)) return null
  return imageUrl
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
  const heroImage = resolveHeroImage(content.imageUrl)

  return (
    <HomeSection
      fullBleed
      className="relative overflow-hidden border-b border-border bg-hero-gradient"
    >
      <Container
        size="xl"
        className="relative grid grid-cols-1 items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:gap-14 lg:py-20"
      >
        {/* Copy — always left column on desktop */}
        <div className="min-w-0 max-w-2xl lg:col-start-1 lg:row-start-1">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground shadow-elevated">
            <Sparkles className="size-3.5 text-primary" aria-hidden />
            {content.eyebrow || content.brand}
          </span>

          <h1 className="type-display mt-5 text-balance text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.03] tracking-[-0.03em] text-foreground">
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

          <p className="mt-5 max-w-[32rem] text-lg leading-relaxed text-muted-foreground">
            {content.description}
          </p>

          {/* Mascot on mobile/tablet */}
          <div className="mt-8 lg:hidden">
            <HeroMascotVisual src={heroImage} />
          </div>

          {ask && content.showAskInHero !== false ? (
            <HeroAskBar content={ask} />
          ) : null}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch">
            <Button
              asChild
              size="lg"
              className="h-auto min-h-12 w-full !whitespace-normal rounded-xl px-6 py-3 text-center text-base font-semibold leading-snug shadow-glow sm:w-auto"
            >
              <Link href={content.primaryCta.href}>
                {content.primaryCta.label}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-auto min-h-12 w-full !whitespace-normal rounded-xl border-border bg-card px-6 py-3 text-center text-base font-medium leading-snug sm:w-auto"
            >
              <Link href={content.secondaryCta.href}>
                {content.secondaryCta.label}
              </Link>
            </Button>
          </div>

          {stats && stats.length > 0 ? (
            <LiveHomepageStats items={stats} variant="hero" />
          ) : content.trustLine ? (
            <p className="mt-7 text-sm text-muted-foreground">
              {content.trustLine}
            </p>
          ) : null}
        </div>

        {/* Mascot — right column on desktop */}
        <div className="relative hidden min-h-[460px] items-center justify-center lg:col-start-2 lg:row-start-1 lg:flex">
          <HeroMascotVisual src={heroImage} />
        </div>
      </Container>
    </HomeSection>
  )
}
