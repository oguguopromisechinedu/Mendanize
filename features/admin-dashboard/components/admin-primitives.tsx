import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function AdminPageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        "mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="min-w-0 space-y-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}

export function AdminActionToolbar({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-wrap items-center gap-2 border-b border-border pb-4",
        className
      )}
    >
      {children}
    </div>
  )
}

export function AdminFilterBar({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("mb-4 flex flex-wrap items-center gap-2", className)}>
      {children}
    </div>
  )
}

export function AdminSearchBar({
  placeholder = "Search…",
  disabled = true,
  className,
}: {
  placeholder?: string
  disabled?: boolean
  className?: string
}) {
  return (
    <input
      type="search"
      disabled={disabled}
      placeholder={placeholder}
      aria-label={placeholder}
      className={cn(
        "h-9 w-full max-w-sm rounded-lg border border-input bg-transparent px-3 text-sm text-muted-foreground",
        className
      )}
    />
  )
}

export function AdminPanel({
  title,
  description,
  children,
  className,
  action,
}: {
  title?: string
  description?: string
  children: ReactNode
  className?: string
  action?: ReactNode
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-surface/60 p-4 sm:p-5",
        className
      )}
    >
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title ? (
              <h2 className="text-sm font-semibold tracking-wide text-foreground">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function AdminEmptyState({
  title,
  description,
  actionLabel,
  href,
}: {
  title: string
  description: string
  actionLabel?: string
  href?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-surface/40 px-6 py-14 text-center">
      <h3 className="text-base font-medium text-foreground">{title}</h3>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {actionLabel && href ? (
        <Button asChild size="sm" variant="outline">
          <a href={href}>{actionLabel}</a>
        </Button>
      ) : null}
    </div>
  )
}

export function AdminLoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
      <span className="size-4 animate-pulse rounded-full bg-primary/40" />
      {label}
    </div>
  )
}
