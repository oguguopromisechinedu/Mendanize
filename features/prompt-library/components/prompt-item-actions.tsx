"use client"

import { useState } from "react"
import { Check, Copy, BookmarkPlus } from "lucide-react"

import { Button } from "@/components/ui/button"

export function PromptItemActions({
  title,
  prompt,
  signedIn,
}: {
  title: string
  prompt: string
  signedIn: boolean
}) {
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  async function save() {
    if (!signedIn) {
      window.location.href = `/sign-in?callbackUrl=${encodeURIComponent("/prompt-library")}`
      return
    }
    try {
      const res = await fetch("/api/public/prompts/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body: prompt }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <Button type="button" size="sm" variant="outline" onClick={copy}>
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        {copied ? "Copied" : "Copy prompt"}
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={save}>
        <BookmarkPlus className="size-3.5" />
        {saved ? "Saved" : "Save"}
      </Button>
    </div>
  )
}
