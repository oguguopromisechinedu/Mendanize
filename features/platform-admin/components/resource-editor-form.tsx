"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function ResourceEditorForm({
  initial,
}: {
  initial?: {
    id: string
    title: string
    slug: string
    type: string
    description: string | null
    fileUrl: string
    category: string | null
    tags: string[]
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
      const res = await fetch("/api/dashboard/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: initial?.id,
          title: fd.get("title"),
          slug: fd.get("slug"),
          type: fd.get("type"),
          description: fd.get("description"),
          fileUrl: fd.get("fileUrl"),
          category: fd.get("category"),
          tags: String(fd.get("tags") || "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
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
        {initial ? "Edit resource" : "New resource"}
      </h1>
      <Input name="title" defaultValue={initial?.title} placeholder="Title" required />
      <Input name="slug" defaultValue={initial?.slug} placeholder="Slug" />
      <select
        name="type"
        defaultValue={initial?.type ?? "PDF"}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
      >
        {["PDF", "TEMPLATE", "CHECKLIST", "CHEATSHEET", "EBOOK"].map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <Textarea
        name="description"
        defaultValue={initial?.description ?? ""}
        placeholder="Description"
        rows={4}
      />
      <Input
        name="fileUrl"
        defaultValue={initial?.fileUrl}
        placeholder="File URL"
        required
      />
      <Input
        name="category"
        defaultValue={initial?.category ?? ""}
        placeholder="Category"
      />
      <Input
        name="tags"
        defaultValue={initial?.tags?.join(", ") ?? ""}
        placeholder="Tags (comma-separated)"
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
