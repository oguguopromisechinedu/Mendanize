"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function NewsletterManageClient() {
  const params = useSearchParams()
  const [token, setToken] = useState(params.get("token") ?? "")
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">(
    "idle"
  )
  const [message, setMessage] = useState<string | null>(null)

  async function run(action: "unsubscribe" | "verify") {
    setStatus("working")
    setMessage(null)
    try {
      const res = await fetch("/api/public/newsletter/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, token }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error?.message ?? "Request failed")
      setStatus("done")
      setMessage(
        action === "verify"
          ? "Email verified. You're on the list."
          : "You've been unsubscribed."
      )
    } catch (e) {
      setStatus("error")
      setMessage(e instanceof Error ? e.message : "Request failed")
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
        Manage newsletter
      </h1>
      <p className="mt-3 text-muted-foreground">
        Paste the token from your email to verify or unsubscribe.
      </p>
      <div className="mt-6 space-y-3">
        <Input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Token from email"
          aria-label="Token"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={!token || status === "working"}
            onClick={() => run("verify")}
          >
            Verify email
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!token || status === "working"}
            onClick={() => run("unsubscribe")}
          >
            Unsubscribe
          </Button>
        </div>
        {message ? (
          <p
            className={`text-sm ${status === "error" ? "text-destructive" : "text-foreground"}`}
            role="status"
          >
            {message}
          </p>
        ) : null}
      </div>
    </div>
  )
}
