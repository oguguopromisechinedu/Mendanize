import type { ReactNode } from "react"
import Link from "next/link"

import { Container } from "@/components/ui/container"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"

export type PageWidth = "standard" | "wide" | "full"

const widthToContainer = {
  standard: "lg",
  wide: "xl",
  full: "2xl",
} as const

export type Crumb = {
  label: string
  href?: string
}

type PageShellProps = {
  title: string
  description?: string
  crumbs?: Crumb[]
  width?: PageWidth
  children?: ReactNode
  className?: string
  /** Full-bleed hero/section area above the padded container */
  hero?: ReactNode
  /** Skip default title/description header (custom page headers) */
  hideHeader?: boolean
  /** Breadcrumb root — defaults to public homepage; account pages use /account */
  homeHref?: string
  homeLabel?: string
}

/**
 * Public page container + breadcrumb (MES-004).
 * Use for placeholder and future content pages under app/(public).
 */
export function PageShell({
  title,
  description,
  crumbs = [],
  width = "standard",
  children,
  className,
  hero,
  hideHeader = false,
  homeHref = "/",
  homeLabel = "Home",
}: PageShellProps) {
  return (
    <div className={cn("pb-[var(--space-16)]", className)}>
      {hero ? <div className="w-full">{hero}</div> : null}
      <Container size={widthToContainer[width]} className="pt-[var(--space-10)]">
        {crumbs.length > 0 ? (
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={homeHref}>{homeLabel}</BreadcrumbLink>
              </BreadcrumbItem>
              {crumbs.map((crumb, index) => {
                const isLast = index === crumbs.length - 1
                return (
                  <span key={`${crumb.label}-${index}`} className="contents">
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {isLast || !crumb.href ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.href}>
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </span>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        ) : null}

        {!hideHeader ? (
          <header className="mb-8 max-w-3xl">
            <h1 className="type-h1 text-foreground">{title}</h1>
            {description ? (
              <p className="mt-3 type-body-lg text-muted-foreground">
                {description}
              </p>
            ) : null}
          </header>
        ) : null}

        {children}
      </Container>
    </div>
  )
}

/** Convenience link list for empty placeholder states. */
export function PlaceholderLinks({
  links,
}: {
  links: Array<{ label: string; href: string }>
}) {
  return (
    <ul className="flex flex-wrap gap-3">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}
