"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function GlossaryEditorForm({
  initial,
}: {
  initial?: {
    id: string
    term: string
    slug: string
    definition: string
    category: string | null
    status: string
    seoTitle: string | null
    seoDescription: string | null
  }
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch("/api/dashboard/glossary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: initial?.id,
          term: fd.get("term"),
          slug: fd.get("slug"),
          definition: fd.get("definition"),
          category: fd.get("category"),
          status: fd.get("status"),
          seoTitle: fd.get("seoTitle"),
          seoDescription: fd.get("seoDescription"),
        }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error?.message ?? "Save failed")
      }
      router.push("/dashboard/resources")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">
        {initial ? "Edit glossary term" : "New glossary term"}
      </h1>
      <Input name="term" defaultValue={initial?.term} placeholder="Term" required />
      <Input name="slug" defaultValue={initial?.slug} placeholder="Slug" />
      <Textarea
        name="definition"
        defaultValue={initial?.definition ?? ""}
        placeholder="Definition"
        rows={6}
        required
      />
      <Input
        name="category"
        defaultValue={initial?.category ?? ""}
        placeholder="Category"
      />
      <select
        name="status"
        defaultValue={initial?.status ?? "DRAFT"}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
      >
        <option value="DRAFT">Draft</option>
        <option value="PUBLISHED">Published</option>
        <option value="ARCHIVED">Archived</option>
      </select>
      <Input
        name="seoTitle"
        defaultValue={initial?.seoTitle ?? ""}
        placeholder="SEO title"
      />
      <Textarea
        name="seoDescription"
        defaultValue={initial?.seoDescription ?? ""}
        placeholder="SEO description"
        rows={2}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={busy}>
        {busy ? "Saving…" : "Save"}
      </Button>
    </form>
  )
}
