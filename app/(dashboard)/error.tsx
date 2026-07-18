"use client"

import { useEffect } from "react"

import { ErrorState } from "@/components/ui/error-state"
import { logUnhandledError } from "@/lib/observability"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logUnhandledError(error, { boundary: "dashboard-error" })
  }, [error])

  return (
    <ErrorState
      title="Dashboard error"
      description="This admin view failed to load. Retry or return to the dashboard home."
      error={error}
      onRetry={reset}
      homeHref="/dashboard"
    />
  )
}
