"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { NewsletterContent } from "../types/types"
import { HomeSection, SectionHeading } from "./section-primitives"

export function NewsletterSection({ content }: { content: NewsletterContent }) {
  return (
    <HomeSection id="newsletter">
      <div className="rounded-3xl border border-border bg-card px-6 py-10 sm:px-10">
        <SectionHeading
          title={content.headline}
          description={content.description}
        />
        <form
          className="flex max-w-lg flex-col gap-3 sm:flex-row"
          onSubmit={(e) => e.preventDefault()}
        >
          <Input
            type="email"
            name="email"
            placeholder={content.placeholder}
            aria-label="Email"
            disabled
          />
          <Button type="submit" disabled>
            {content.ctaLabel}
          </Button>
        </form>
        <p className="mt-3 text-xs text-muted-foreground">{content.privacy}</p>
      </div>
    </HomeSection>
  )
}
