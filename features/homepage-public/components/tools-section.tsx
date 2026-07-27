import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ToolItem } from "../types/types"
import { HomeSection, SectionHeading } from "./section-primitives"

export function ToolsSection({
  items,
  titleOverride,
  spacing,
}: {
  items: ToolItem[]
  titleOverride?: string | null
  spacing?: string
}) {
  return (
    <HomeSection id="tools" className="bg-surface/40" spacing={spacing}>
      <SectionHeading
        eyebrow="Discover"
        title="Featured AI tools"
        titleOverride={titleOverride}
        description="Curated directory entries — full profiles land in MES-027."
      />
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="flex h-full flex-col">
            <CardHeader>
              <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/15 font-display text-lg font-semibold text-primary">
                {item.name.slice(0, 1)}
              </div>
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge variant="outline">{item.category}</Badge>
                <Badge variant="secondary">{item.rating} ★</Badge>
              </div>
              <CardTitle>{item.name}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto">
              <Button asChild variant="outline" className="w-full">
                <Link href={item.href}>Learn more</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </HomeSection>
  )
}
