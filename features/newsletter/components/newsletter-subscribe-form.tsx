"use client"

import { useState } from "react"
import { CheckCircle2, Loader2, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const PREFERENCE_OPTIONS = [
  { id: "guides", label: "Guides & courses" },
  { id: "tools", label: "AI tools" },
  { id: "prompts", label: "Prompt library" },
  { id: "community", label: "Community" },
]

export function NewsletterSubscribeForm() {
  const [email, setEmail] = useState("")
  const [preferences, setPreferences] = useState<string[]>(["guides", "tools"])
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  )
  const [message, setMessage] = useState<string | null>(null)

  function togglePref(id: string) {
    setPreferences((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

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
        body: JSON.stringify({ email: trimmed, preferences }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(json?.error?.message ?? "Something went wrong.")
      }
      setStatus("success")
      setEmail("")
    } catch (error) {
      setStatus("error")
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      )
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-4">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
        <div>
          <p className="font-medium text-foreground">You&apos;re subscribed</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Check your inbox to verify your email when prompted. You can update
            preferences anytime from newsletter emails.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card/50 p-5 sm:p-6"
    >
      <div className="mb-4 inline-flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <Mail className="size-4" aria-hidden />
      </div>
      <p className="font-display text-base font-semibold">Subscribe</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose topics, then enter your email.
      </p>
      <fieldset className="mt-4">
        <legend className="sr-only">Preferences</legend>
        <div className="flex flex-wrap gap-2">
          {PREFERENCE_OPTIONS.map((opt) => {
            const active = preferences.includes(opt.id)
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => togglePref(opt.id)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  active
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
                aria-pressed={active}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </fieldset>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
          aria-label="Email"
          className="sm:flex-1"
        />
        <Button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          Subscribe
        </Button>
      </div>
      {message ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {message}
        </p>
      ) : null}
    </form>
  )
}
