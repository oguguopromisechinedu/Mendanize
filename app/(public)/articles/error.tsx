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
    logUnhandledError(error, { boundary: "segment-error" })
  }, [error])

  return <ErrorState error={error} onRetry={reset} />
}
