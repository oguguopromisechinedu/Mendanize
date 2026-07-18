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
    logUnhandledError(error, { boundary: "app-error" })
  }, [error])

  return (
    <ErrorState
      title="Oops! Something went wrong"
      description="We encountered an unexpected error. You can retry or return home."
      error={error}
      onRetry={reset}
    />
  )
}
