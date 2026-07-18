import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import type { AskContent, HeroContent } from "../types/types"
import { HeroAskBar } from "./hero-ask-bar"
import { HeroBrainVisual } from "./hero-brain-visual"
import { HomeSection } from "./section-primitives"

export function HeroSection({
  content,
  ask,
}: {
  content: HeroContent
  ask?: AskContent
}) {
  return (
    <HomeSection fullBleed className="relative overflow-hidden border-b border-border bg-hero-gradient">
      <Container
        size="xl"
        className="relative grid min-h-[70vh] items-center gap-8 py-12 sm:gap-10 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:min-h-[85vh] lg:py-24"
      >
        <div className="order-2 lg:order-1">
          {content.eyebrow ? (
            <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {content.eyebrow}
            </span>
          ) : (
            <p className="font-display text-sm font-semibold uppercase tracking-[0.28em] text-primary">
              {content.brand}
            </p>
          )}

          <h1 className="type-display mt-5 text-foreground">
            {content.headline}
            {content.headlineAccent ? (
              <>
                {" "}
                <span className="text-gradient-brand">{content.headlineAccent}</span>
              </>
            ) : null}
          </h1>

          <p className="mt-5 max-w-xl type-body-lg text-muted-foreground">
            {content.description}
          </p>

          {ask && content.showAskInHero !== false ? <HeroAskBar content={ask} /> : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-xl shadow-glow">
              <Link href={content.primaryCta.href}>{content.primaryCta.label}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl">
              <Link href={content.secondaryCta.href}>{content.secondaryCta.label}</Link>
            </Button>
          </div>

          {content.trustLine ? (
            <p className="mt-6 text-sm text-muted-foreground">{content.trustLine}</p>
          ) : null}
        </div>

        <div className="relative order-1 min-h-[16rem] lg:order-2 lg:min-h-[24rem]">
          {content.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={content.imageUrl}
              alt=""
              className="absolute inset-0 size-full rounded-[2rem] border border-border object-cover shadow-glow"
            />
          ) : (
            <HeroBrainVisual />
          )}
        </div>
      </Container>
    </HomeSection>
  )
}
