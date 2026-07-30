"use client"

import { useState } from "react"
import { Heart } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ToolFavoriteButton({
  toolId,
  signedIn,
  initialFavorite = false,
}: {
  toolId: string
  signedIn: boolean
  initialFavorite?: boolean
}) {
  const [favorite, setFavorite] = useState(initialFavorite)
  const [busy, setBusy] = useState(false)

  async function toggle() {
    if (!signedIn) {
      window.location.href = `/sign-in?callbackUrl=${encodeURIComponent("/ai-tools")}`
      return
    }
    setBusy(true)
    try {
      const res = await fetch("/api/public/tools/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId, favorite: !favorite }),
      })
      if (res.ok) setFavorite(!favorite)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={toggle}
      disabled={busy}
      aria-pressed={favorite}
    >
      <Heart
        className={`size-4 ${favorite ? "fill-primary text-primary" : ""}`}
      />
      {favorite ? "Saved" : "Favorite"}
    </Button>
  )
}
