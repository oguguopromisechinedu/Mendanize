import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { PathItem } from "../types/types"
import { HomeSection, SectionHeading } from "./section-primitives"

export function PathsSection({
  items,
  titleOverride,
  spacing,
}: {
  items: PathItem[]
  titleOverride?: string | null
  spacing?: string
}) {
  return (
    <HomeSection id="paths" className="bg-surface/40" spacing={spacing}>
      <SectionHeading
        eyebrow="Practice"
        title="Learning paths"
        titleOverride={titleOverride}
        description="Guided sequences with clear difficulty and time expectations."
      />
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="flex h-full flex-col">
            <CardHeader>
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge variant="outline">{item.difficulty}</Badge>
                <Badge variant="secondary">{item.duration}</Badge>
              </div>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto space-y-3">
              <p className="text-sm text-muted-foreground">
                {item.lessons} lessons · progress placeholder
              </p>
              <Progress value={12} aria-label="Progress placeholder" />
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href={item.href}>Continue path</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </HomeSection>
  )
}
