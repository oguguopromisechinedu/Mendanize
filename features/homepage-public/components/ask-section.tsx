"use client"

import { AskContextualWidget } from "@/features/ask-mendanize"
import type { AskContent } from "../types/types"
import { HomeSection, SectionHeading } from "./section-primitives"

/** Homepage Ask section — Tier 1 widget with homepage context (MES-019). */
export function AskSection({ content }: { content: AskContent }) {
  return (
    <HomeSection id="ask">
      <SectionHeading
        eyebrow="Ask"
        title={content.title}
        description={content.description}
      />
      <AskContextualWidget
        contextType="HOMEPAGE"
        contextTitle={content.title}
        contextExcerpt={content.description}
        suggestions={content.suggestions}
      />
    </HomeSection>
  )
}
