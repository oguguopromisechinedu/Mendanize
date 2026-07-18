"use client"

import Link from "next/link"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ErrorStateProps = {
  title?: string
  description?: string
  error?: Error & { digest?: string }
  onRetry?: () => void
  homeHref?: string
  className?: string
  children?: ReactNode
}

/**
 * Shared error / retry surface for App Router error boundaries (MES-028).
 */
export function ErrorState({
  title = "Something went wrong",
  description = "We hit an unexpected problem. You can try again or head home.",
  error,
  onRetry,
  homeHref = "/",
  className,
  children,
}: ErrorStateProps) {
  return (
    <div
      data-slot="error-state"
      role="alert"
      className={cn(
        "mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-6 px-4 py-16 text-center",
        className
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <svg
          className="size-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {process.env.NODE_ENV === "development" && error ? (
        <div className="w-full rounded-lg border border-border bg-muted/40 p-3 text-left">
          <p className="break-words font-mono text-xs text-destructive">
            {error.message || "Unknown error"}
          </p>
          {error.digest ? (
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              Digest: {error.digest}
            </p>
          ) : null}
        </div>
      ) : null}

      {children}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry ? (
          <Button type="button" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
        <Button asChild variant="outline">
          <Link href={homeHref}>Go home</Link>
        </Button>
      </div>

      {error?.digest ? (
        <p className="text-xs text-muted-foreground">
          Error ID: {error.digest}
        </p>
      ) : null}
    </div>
  )
}
