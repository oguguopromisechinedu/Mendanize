"use client"

import { useState, useSyncExternalStore } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { saveConsentAction } from "@/features/privacy/actions"

const STORAGE_KEY = "mendanize_cookie_consent_v1"

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange)
  return () => window.removeEventListener("storage", onStoreChange)
}

function getConsentStored() {
  try {
    return Boolean(localStorage.getItem(STORAGE_KEY))
  } catch {
    return false
  }
}

export function ConsentBanner() {
  // SSR: assume stored so the banner does not flash; client re-reads localStorage.
  const stored = useSyncExternalStore(subscribe, getConsentStored, () => true)
  const [dismissed, setDismissed] = useState(false)

  if (stored || dismissed) return null

  async function accept(analytics: boolean, marketing: boolean) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ analytics, marketing, at: Date.now() }),
      )
    } catch {
      /* ignore */
    }
    setDismissed(true)
    await saveConsentAction({ analytics, marketing })
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 p-4 shadow-lg backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          We use cookies for essential site function and optional analytics. See
          our{" "}
          <Link href="/privacy" className="text-primary underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => accept(false, false)}
          >
            Essential only
          </Button>
          <Button type="button" size="sm" onClick={() => accept(true, false)}>
            Accept analytics
          </Button>
        </div>
      </div>
    </div>
  )
}
