"use client"

import { useEffect } from "react"

import { ErrorState } from "@/components/ui/error-state"
import { logUnhandledError } from "@/lib/client-error-log"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logUnhandledError(error, { boundary: "public-error" })
  }, [error])

  return (
    <ErrorState
      title="Something went wrong"
      description="This public page failed to render. Try again or browse from home."
      error={error}
      onRetry={reset}
    />
  )
}
