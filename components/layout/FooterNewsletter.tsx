"use client"

import { useState } from "react"
import { CheckCircle2, Loader2, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type FooterNewsletterProps = {
  headline: string
  placeholder: string
}

export function FooterNewsletter({
  headline,
  placeholder,
}: FooterNewsletterProps) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle")
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === "submitting") return

    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus("error")
      setMessage("Please enter a valid email address.")
      return
    }

    setStatus("submitting")
    setMessage(null)
    try {
      const res = await fetch("/api/public/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(
          json?.error?.message ?? "Something went wrong. Please try again.",
        )
      }
      setStatus("success")
      setEmail("")
    } catch (error) {
      setStatus("error")
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      )
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div className="max-w-xl">
          <div className="mb-2 inline-flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Mail className="size-4" aria-hidden />
          </div>
          <p className="font-display text-base font-semibold text-foreground sm:text-lg">
            {headline}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Practical AI guides, tool picks, and learning tips from Mendanize —
            about once a week. Unsubscribe anytime.
          </p>
        </div>

        {status === "success" ? (
          <div className="flex w-full max-w-md items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3">
            <CheckCircle2 className="size-5 shrink-0 text-primary" aria-hidden />
            <p className="text-sm text-foreground">
              You&apos;re in. Watch your inbox for the next tip.
            </p>
          </div>
        ) : (
          <form
            className="w-full max-w-md space-y-2"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="email"
                name="email"
                autoComplete="email"
                placeholder={placeholder}
                aria-label="Email for newsletter"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (status === "error") {
                    setStatus("idle")
                    setMessage(null)
                  }
                }}
                disabled={status === "submitting"}
                aria-invalid={status === "error" || undefined}
                className="h-11 flex-1 rounded-xl bg-background"
              />
              <Button
                type="submit"
                disabled={status === "submitting"}
                className="h-11 shrink-0 rounded-xl px-5"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Subscribing…
                  </>
                ) : (
                  "Subscribe"
                )}
              </Button>
            </div>
            {status === "error" && message ? (
              <p role="alert" className="text-xs text-destructive">
                {message}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                No spam. We only send what helps you learn.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
