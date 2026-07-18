import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { FaqItem } from "../types/types"
import { HomeSection, SectionHeading } from "./section-primitives"

export function FaqSection({
  items,
  titleOverride,
  spacing,
}: {
  items: FaqItem[]
  titleOverride?: string | null
  spacing?: string
}) {
  return (
    <HomeSection id="faq" className="bg-surface/40" spacing={spacing}>
      <SectionHeading
        eyebrow="FAQ"
        title="Common questions"
        titleOverride={titleOverride}
        description="Accessible accordion ready for CMS-managed answers."
      />
      <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card px-4">
        {items.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </HomeSection>
  )
}
