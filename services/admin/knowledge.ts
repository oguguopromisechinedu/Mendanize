import {
  assertDatabaseForProductionWrites,
  getPrisma,
  isDatabaseConfigured,
} from "@/lib/db/prisma"
import type { KnowledgeArticleRecord, ListResult } from "./types"

function slugify(input: string, fallback = "kb"): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 120) || fallback
  )
}

const nowIso = () => new Date().toISOString()

const memory = {
  items: [] as KnowledgeArticleRecord[],
  seeded: false,
}

function seed() {
  if (memory.seeded) return
  memory.seeded = true
  const t = nowIso()
  memory.items = [
    {
      id: "kb_1",
      title: "Publishing checklist",
      slug: "publishing-checklist",
      category: "editorial",
      body: "1. Proofread\n2. Add SEO fields\n3. Preview on mobile\n4. Schedule or publish",
      published: true,
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "kb_2",
      title: "Role permissions overview",
      slug: "role-permissions",
      category: "ops",
      body: "LEARNER: public learning\nEDITOR: content CMS\nADMIN: settings + users\nSUPER_ADMIN: full control",
      published: true,
      createdAt: t,
      updatedAt: t,
    },
  ]
}

function mapRow(row: {
  id: string
  title: string
  slug: string
  category: string
  body: string
  published: boolean
  createdAt: Date
  updatedAt: Date
}): KnowledgeArticleRecord {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    body: row.body,
    published: row.published,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function listKnowledgeArticles(params: {
  query?: string
  category?: string
  page?: number
  pageSize?: number
} = {}): Promise<ListResult<KnowledgeArticleRecord>> {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 50))
  const q = params.query?.trim().toLowerCase()

  if (!isDatabaseConfigured()) {
    seed()
    let items = [...memory.items]
    if (params.category) items = items.filter((i) => i.category === params.category)
    if (q) {
      items = items.filter(
        (i) => i.title.toLowerCase().includes(q) || i.body.toLowerCase().includes(q)
      )
    }
    const total = items.length
    const start = (page - 1) * pageSize
    return { items: items.slice(start, start + pageSize), total, page, pageSize }
  }

  const prisma = getPrisma()
  const where: {
    category?: string
    OR?: Array<{
      title?: { contains: string; mode: "insensitive" }
      body?: { contains: string; mode: "insensitive" }
    }>
  } = {}
  if (params.category) where.category = params.category
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { body: { contains: q, mode: "insensitive" } },
    ]
  }

  const [total, rows] = await Promise.all([
    prisma.knowledgeArticle.count({ where }),
    prisma.knowledgeArticle.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])
  return { items: rows.map(mapRow), total, page, pageSize }
}

export async function createKnowledgeArticle(input: {
  title: string
  slug?: string
  category?: string
  body?: string
  published?: boolean
}): Promise<KnowledgeArticleRecord> {
  assertDatabaseForProductionWrites("services/admin/knowledge")
  const title = input.title.trim()
  if (!title) throw new Error("Title is required")
  const slug = slugify(input.slug?.trim() || title)

  if (!isDatabaseConfigured()) {
    seed()
    if (memory.items.some((i) => i.slug === slug)) throw new Error("Slug exists")
    const t = nowIso()
    const row: KnowledgeArticleRecord = {
      id: `kb_${Date.now()}`,
      title,
      slug,
      category: input.category?.trim() || "general",
      body: input.body ?? "",
      published: input.published ?? true,
      createdAt: t,
      updatedAt: t,
    }
    memory.items.unshift(row)
    return row
  }

  const row = await getPrisma().knowledgeArticle.create({
    data: {
      title,
      slug,
      category: input.category?.trim() || "general",
      body: input.body ?? "",
      published: input.published ?? true,
    },
  })
  return mapRow(row)
}

export async function updateKnowledgeArticle(
  id: string,
  input: {
    title?: string
    slug?: string
    category?: string
    body?: string
    published?: boolean
  }
): Promise<KnowledgeArticleRecord> {
  if (!isDatabaseConfigured()) {
    seed()
    const row = memory.items.find((i) => i.id === id)
    if (!row) throw new Error("Article not found")
    if (input.title !== undefined) row.title = input.title.trim()
    if (input.slug !== undefined) row.slug = slugify(input.slug)
    if (input.category !== undefined) row.category = input.category.trim()
    if (input.body !== undefined) row.body = input.body
    if (input.published !== undefined) row.published = input.published
    row.updatedAt = nowIso()
    return row
  }

  const row = await getPrisma().knowledgeArticle.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.slug !== undefined ? { slug: slugify(input.slug) } : {}),
      ...(input.category !== undefined ? { category: input.category.trim() } : {}),
      ...(input.body !== undefined ? { body: input.body } : {}),
      ...(input.published !== undefined ? { published: input.published } : {}),
    },
  })
  return mapRow(row)
}

export async function deleteKnowledgeArticles(ids: string[]): Promise<number> {
  if (!ids.length) return 0
  if (!isDatabaseConfigured()) {
    seed()
    const before = memory.items.length
    memory.items = memory.items.filter((i) => !ids.includes(i.id))
    return before - memory.items.length
  }
  const result = await getPrisma().knowledgeArticle.deleteMany({
    where: { id: { in: ids } },
  })
  return result.count
}
