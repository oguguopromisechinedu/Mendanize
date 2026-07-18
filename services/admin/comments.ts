import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma"
import type { CommentRecord, ListResult } from "./types"

const nowIso = () => new Date().toISOString()

const memory = {
  items: [] as CommentRecord[],
  seeded: false,
}

function seed() {
  if (memory.seeded) return
  memory.seeded = true
  const t = nowIso()
  memory.items = [
    {
      id: "cmt_1",
      entityType: "ARTICLE",
      entityId: "art_1",
      entityTitle: "Getting Started with LLMs",
      authorName: "Jordan Lee",
      authorEmail: "jordan@example.com",
      body: "Great overview — would love a follow-up on fine-tuning.",
      status: "PENDING",
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "cmt_2",
      entityType: "GUIDE",
      entityId: "gde_1",
      entityTitle: "Prompt Engineering Basics",
      authorName: "Casey",
      authorEmail: null,
      body: "Lesson 3 was especially clear. Thanks!",
      status: "APPROVED",
      createdAt: t,
      updatedAt: t,
    },
  ]
}

function mapRow(row: {
  id: string
  entityType: CommentRecord["entityType"]
  entityId: string
  entityTitle: string | null
  authorName: string
  authorEmail: string | null
  body: string
  status: CommentRecord["status"]
  createdAt: Date
  updatedAt: Date
}): CommentRecord {
  return {
    id: row.id,
    entityType: row.entityType,
    entityId: row.entityId,
    entityTitle: row.entityTitle,
    authorName: row.authorName,
    authorEmail: row.authorEmail,
    body: row.body,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function listCommentsAdmin(params: {
  query?: string
  status?: CommentRecord["status"]
  page?: number
  pageSize?: number
} = {}): Promise<ListResult<CommentRecord>> {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 50))
  const q = params.query?.trim().toLowerCase()

  if (!isDatabaseConfigured()) {
    seed()
    let items = [...memory.items]
    if (params.status) items = items.filter((c) => c.status === params.status)
    if (q) {
      items = items.filter(
        (c) =>
          c.body.toLowerCase().includes(q) ||
          c.authorName.toLowerCase().includes(q) ||
          (c.entityTitle?.toLowerCase().includes(q) ?? false)
      )
    }
    const total = items.length
    const start = (page - 1) * pageSize
    return { items: items.slice(start, start + pageSize), total, page, pageSize }
  }

  const prisma = getPrisma()
  const where: {
    status?: CommentRecord["status"]
    OR?: Array<{
      body?: { contains: string; mode: "insensitive" }
      authorName?: { contains: string; mode: "insensitive" }
      entityTitle?: { contains: string; mode: "insensitive" }
    }>
  } = {}
  if (params.status) where.status = params.status
  if (q) {
    where.OR = [
      { body: { contains: q, mode: "insensitive" } },
      { authorName: { contains: q, mode: "insensitive" } },
      { entityTitle: { contains: q, mode: "insensitive" } },
    ]
  }

  const [total, rows] = await Promise.all([
    prisma.comment.count({ where }),
    prisma.comment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  return { items: rows.map(mapRow), total, page, pageSize }
}

export async function bulkUpdateCommentStatus(
  ids: string[],
  status: CommentRecord["status"]
): Promise<number> {
  if (!ids.length) return 0
  if (!isDatabaseConfigured()) {
    seed()
    let n = 0
    for (const c of memory.items) {
      if (ids.includes(c.id)) {
        c.status = status
        c.updatedAt = nowIso()
        n++
      }
    }
    return n
  }
  const result = await getPrisma().comment.updateMany({
    where: { id: { in: ids } },
    data: { status },
  })
  return result.count
}

export async function deleteComments(ids: string[]): Promise<number> {
  if (!ids.length) return 0
  if (!isDatabaseConfigured()) {
    seed()
    const before = memory.items.length
    memory.items = memory.items.filter((c) => !ids.includes(c.id))
    return before - memory.items.length
  }
  const result = await getPrisma().comment.deleteMany({
    where: { id: { in: ids } },
  })
  return result.count
}
