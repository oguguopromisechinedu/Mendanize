import type { ReactNode } from "react"

import { Container } from "@/components/ui/container"
import { cn } from "@/lib/utils"

export function HomeSection({
  id,
  children,
  className,
  wide = false,
  fullBleed = false,
  spacing,
}: {
  id?: string
  children: ReactNode
  className?: string
  wide?: boolean
  fullBleed?: boolean
  spacing?: string
}) {
  const spacingClass =
    spacing === "compact"
      ? "py-10 lg:py-14"
      : spacing === "spacious"
        ? "py-20 lg:py-32"
        : "section-y"

  if (fullBleed) {
    return (
      <section id={id} className={cn("w-full", className)}>
        {children}
      </section>
    )
  }

  return (
    <section id={id} className={cn(spacingClass, className)}>
      <Container size={wide ? "xl" : "lg"}>{children}</Container>
    </section>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  titleOverride,
}: {
  eyebrow?: string
  title: string
  description?: string
  titleOverride?: string | null
}) {
  const displayTitle = titleOverride?.trim() || title
  return (
    <div className="mb-8 max-w-2xl lg:mb-10">
      {eyebrow ? (
        <p className="type-caption text-primary mb-3">{eyebrow}</p>
      ) : null}
      <h2 className="type-h2 text-foreground">{displayTitle}</h2>
      {description ? (
        <p className="mt-3 text-muted-foreground type-body-lg">{description}</p>
      ) : null}
    </div>
  )
}
