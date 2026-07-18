import {
  bulkUpdateArticleStatus,
  bulkUpdateGuideStatus,
  bulkUpdateToolStatus,
  listArticlesAdmin,
  listGuidesAdmin,
  listToolsAdmin,
} from "@/services/content"
import type { ListResult, WorkflowItem } from "./types"

const QUEUE_STATUSES = ["DRAFT", "REVIEW", "SCHEDULED"] as const

export async function listWorkflowQueue(params: {
  query?: string
  status?: string
  kind?: WorkflowItem["kind"]
} = {}): Promise<ListResult<WorkflowItem>> {
  const q = params.query?.trim().toLowerCase()
  const statuses = params.status ? [params.status] : [...QUEUE_STATUSES]

  const [articles, guides, tools] = await Promise.all([
    params.kind && params.kind !== "article"
      ? Promise.resolve({ items: [] as Awaited<ReturnType<typeof listArticlesAdmin>>["items"] })
      : listArticlesAdmin({ pageSize: 100 }),
    params.kind && params.kind !== "guide"
      ? Promise.resolve({ items: [] as Awaited<ReturnType<typeof listGuidesAdmin>>["items"] })
      : listGuidesAdmin({ pageSize: 100 }),
    params.kind && params.kind !== "tool"
      ? Promise.resolve({ items: [] as Awaited<ReturnType<typeof listToolsAdmin>>["items"] })
      : listToolsAdmin({ pageSize: 100 }),
  ])

  const items: WorkflowItem[] = []

  for (const a of articles.items) {
    if (!statuses.includes(a.status as (typeof QUEUE_STATUSES)[number])) continue
    items.push({
      id: a.id,
      title: a.title,
      slug: a.slug,
      kind: "article",
      status: a.status,
      updatedAt: a.updatedAt,
      href: `/dashboard/articles/${a.id}`,
    })
  }
  for (const g of guides.items) {
    if (!statuses.includes(g.status as (typeof QUEUE_STATUSES)[number])) continue
    items.push({
      id: g.id,
      title: g.title,
      slug: g.slug,
      kind: "guide",
      status: g.status,
      updatedAt: g.updatedAt,
      href: `/dashboard/guides/${g.id}`,
    })
  }
  for (const t of tools.items) {
    if (!statuses.includes(t.status as (typeof QUEUE_STATUSES)[number])) continue
    items.push({
      id: t.id,
      title: t.name,
      slug: t.slug,
      kind: "tool",
      status: t.status,
      updatedAt: t.updatedAt,
      href: `/dashboard/ai-tools/${t.id}`,
    })
  }

  let filtered = items
  if (q) {
    filtered = items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) || i.slug.toLowerCase().includes(q)
    )
  }
  filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  return {
    items: filtered,
    total: filtered.length,
    page: 1,
    pageSize: filtered.length,
  }
}

export async function advanceWorkflowItem(
  kind: WorkflowItem["kind"],
  id: string,
  status: "REVIEW" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED" | "DRAFT"
): Promise<void> {
  if (kind === "article") {
    await bulkUpdateArticleStatus([id], status)
    return
  }
  if (kind === "guide") {
    await bulkUpdateGuideStatus([id], status)
    return
  }
  await bulkUpdateToolStatus([id], status)
}
