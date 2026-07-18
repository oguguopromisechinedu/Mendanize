"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

import type { AIGenerationListResult } from "@/services/ai/types"
import {
  AdminActionToolbar,
  AdminDataTable,
  AdminEmptyState,
  AdminPageHeader,
  StatusBadge,
} from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"

export function GenerationHistoryView({
  initial,
}: {
  initial: AIGenerationListResult
}) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [type, setType] = useState("ALL")

  function applyFilters() {
    const params = new URLSearchParams()
    if (query.trim()) params.set("query", query.trim())
    if (type !== "ALL") params.set("type", type)
    const qs = params.toString()
    router.push(
      qs
        ? `/dashboard/ai-studio/history?${qs}`
        : "/dashboard/ai-studio/history"
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Generation history"
        description="Log of Studio outputs with optional links to Articles or Media."
        actions={
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/ai-studio">Back to Studio</Link>
          </Button>
        }
      />

      <AdminActionToolbar>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          placeholder="Search prompts…"
          className="h-9 w-full max-w-xs rounded-lg border border-input bg-transparent px-3 text-sm"
          aria-label="Search generations"
        />
        <Select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="max-w-[10rem]"
          aria-label="Filter by type"
        >
          <option value="ALL">All types</option>
          <option value="ARTICLE">Article</option>
          <option value="IMAGE">Image</option>
          <option value="VIDEO">Video</option>
        </Select>
        <Button type="button" size="sm" variant="outline" onClick={applyFilters}>
          Filter
        </Button>
      </AdminActionToolbar>

      {initial.items.length === 0 ? (
        <AdminEmptyState
          title="No generations yet"
          description="Run an article or image generation to populate history."
          actionLabel="Open Studio"
          href="/dashboard/ai-studio"
        />
      ) : (
        <AdminDataTable
          headers={[
            "Type",
            "Prompt",
            "Provider",
            "Status",
            "Linked",
            "Created",
            "",
          ]}
        >
          {initial.items.map((row) => (
            <tr key={row.id} className="hover:bg-hover/40">
              <td className="px-3 py-2.5 font-medium">{row.type}</td>
              <td className="max-w-[18rem] truncate px-3 py-2.5 text-muted-foreground">
                {row.prompt}
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {row.provider}
              </td>
              <td className="px-3 py-2.5">
                <StatusBadge status={row.status.toLowerCase()} />
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {row.articleId
                  ? `Article ${row.articleId.slice(0, 8)}…`
                  : row.mediaAssetId
                    ? `Media ${row.mediaAssetId.slice(0, 8)}…`
                    : "—"}
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {new Date(row.createdAt).toLocaleString()}
              </td>
              <td className="px-3 py-2.5 text-right">
                {row.articleId ? (
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/dashboard/articles/${row.articleId}`}>
                      Open article
                    </Link>
                  </Button>
                ) : row.type === "ARTICLE" ? (
                  <Button asChild size="sm" variant="ghost">
                    <Link href="/dashboard/ai-studio/article">Regenerate</Link>
                  </Button>
                ) : row.type === "IMAGE" ? (
                  <Button asChild size="sm" variant="ghost">
                    <Link href="/dashboard/ai-studio/image">Regenerate</Link>
                  </Button>
                ) : (
                  <Button asChild size="sm" variant="ghost">
                    <Link href="/dashboard/ai-studio/video">Open</Link>
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </AdminDataTable>
      )}
    </div>
  )
}
