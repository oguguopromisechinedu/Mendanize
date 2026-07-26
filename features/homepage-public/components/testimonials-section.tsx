import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { TestimonialItem } from "../types/types"
import { HomeSection, SectionHeading } from "./section-primitives"

export function TestimonialsSection({
  items,
  titleOverride,
  spacing,
}: {
  items: TestimonialItem[]
  titleOverride?: string | null
  spacing?: string
}) {
  return (
    <HomeSection id="testimonials" className="bg-surface/40" spacing={spacing}>
      <SectionHeading
        eyebrow="Social proof"
        title="What learners say"
        titleOverride={titleOverride}
        description="Placeholder quotes — prepared for database integration later."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardDescription className="text-base text-foreground">
                “{item.quote}”
              </CardDescription>
              <CardTitle className="mt-4 text-sm font-medium">
                {item.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{item.role}</p>
            </CardHeader>
          </Card>
        ))}
      </div>
    </HomeSection>
  )
}
