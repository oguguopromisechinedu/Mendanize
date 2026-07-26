import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import type { FinalCtaContent } from "../types/types"
import { HomeSection } from "./section-primitives"

export function FinalCtaSection({
  content,
  spacing,
}: {
  content: FinalCtaContent
  spacing?: string
}) {
  const spacingClass =
    spacing === "compact"
      ? "py-12"
      : spacing === "spacious"
        ? "py-28"
        : "py-20"

  return (
    <HomeSection fullBleed id="get-started" className="border-t border-border">
      <div
        className={spacingClass}
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 50% 0%, rgba(139,92,246,0.18), transparent 60%)",
        }}
      >
        <Container size="lg" className="text-center">
          <h2 className="type-h1 text-foreground">{content.headline}</h2>
          <p className="mx-auto mt-4 max-w-2xl type-body-lg text-muted-foreground">
            {content.description}
          </p>
          <div className="mt-6 flex w-full flex-col gap-2 sm:mt-8 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={content.primaryCta.href}>{content.primaryCta.label}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href={content.secondaryCta.href}>
                {content.secondaryCta.label}
              </Link>
            </Button>
          </div>
        </Container>
      </div>
    </HomeSection>
  )
}
