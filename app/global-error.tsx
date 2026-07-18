"use client"

import { useEffect } from "react"

import { ErrorState } from "@/components/ui/error-state"
import { logUnhandledError } from "@/lib/observability"

/**
 * Root layout error boundary (MES-028).
 * Must define its own <html>/<body> — does not nest under app/layout.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logUnhandledError(error, { boundary: "global-error" })
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ErrorState
          title="Application error"
          description="A critical error escaped the page tree. Trying again may recover."
          error={error}
          onRetry={reset}
        />
      </body>
    </html>
  )
}
