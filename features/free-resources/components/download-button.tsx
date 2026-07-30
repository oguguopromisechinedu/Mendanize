"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

export function FreeResourceDownloadButton({
  resourceId,
  fileUrl,
}: {
  resourceId: string
  fileUrl: string
}) {
  const [busy, setBusy] = useState(false)

  async function handleClick() {
    setBusy(true)
    try {
      await fetch("/api/public/free-resources/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId }),
      })
    } catch {
      /* still open file */
    } finally {
      setBusy(false)
      window.open(fileUrl, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <Button type="button" onClick={handleClick} disabled={busy}>
      {busy ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" />
      )}
      Download
    </Button>
  )
}
