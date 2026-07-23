"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  deleteMyAccountAction,
  exportMyDataAction,
} from "@/features/privacy/actions"

export function PrivacyControls() {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Your data</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Export a JSON copy of your account data, or permanently delete your
          account (cancels billing first, then cascades personalization and Ask
          history).
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await exportMyDataAction()
              if (!res.ok) {
                setMessage(res.message)
                return
              }
              const blob = new Blob([JSON.stringify(res.data, null, 2)], {
                type: "application/json",
              })
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = `mendanize-export-${Date.now()}.json`
              a.click()
              URL.revokeObjectURL(url)
              setMessage("Export downloaded.")
            })
          }
        >
          Export my data
        </Button>
        <Button
          type="button"
          variant="destructive"
          disabled={pending}
          onClick={() => {
            if (
              !confirm(
                "Permanently delete your account and personal data? This cannot be undone.",
              )
            ) {
              return
            }
            start(async () => {
              const res = await deleteMyAccountAction()
              if (!res.ok) {
                setMessage(res.message)
                return
              }
              router.push("/")
              router.refresh()
            })
          }}
        >
          Delete my account
        </Button>
      </div>
      {message ? (
        <p className="text-sm text-muted-foreground" role="status">
          {message}
        </p>
      ) : null}
    </div>
  )
}
