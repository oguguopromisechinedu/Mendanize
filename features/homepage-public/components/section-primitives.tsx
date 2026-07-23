import type { ReactNode } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

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
  action,
}: {
  eyebrow?: string
  title: string
  description?: string
  titleOverride?: string | null
  /** Right-side explore / view-all link (MES-005). */
  action?: { label: string; href: string; className?: string }
}) {
  const displayTitle = titleOverride?.trim() || title
  return (
    <div
      className={cn(
        "mb-8 lg:mb-10",
        action
          ? "flex flex-wrap items-end justify-between gap-3"
          : "max-w-2xl",
      )}
    >
      <div className={action ? "min-w-0 max-w-2xl" : undefined}>
        {eyebrow ? (
          <p className="type-eyebrow mb-3 text-primary">{eyebrow}</p>
        ) : null}
        <h2 className="type-h2 text-foreground">{displayTitle}</h2>
        {description ? (
          <p className="mt-3 text-lg leading-[1.6] text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className={cn(
            "inline-flex shrink-0 items-center gap-1 text-sm text-primary hover:underline",
            action.className,
          )}
        >
          {action.label}
          <ChevronRight className="size-3.5" aria-hidden />
        </Link>
      ) : null}
    </div>
  )
}
