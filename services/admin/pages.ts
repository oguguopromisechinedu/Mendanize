import {
  assertDatabaseForProductionWrites,
  getPrisma,
  isDatabaseConfigured,
} from "@/lib/db/prisma"
import type { ListResult, StaticPageRecord } from "./types"

function slugify(input: string, fallback = "page"): string {
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
  items: [] as StaticPageRecord[],
  seeded: false,
}

function seed() {
  if (memory.seeded) return
  memory.seeded = true
  const t = nowIso()
  memory.items = [
    {
      id: "pg_about",
      title: "About",
      slug: "about",
      content: "<p>Mendanize helps teams learn AI with structured guides and tools.</p>",
      excerpt: "Who we are",
      status: "PUBLISHED",
      seoTitle: "About | Mendanize",
      seoDescription: "Learn about Mendanize",
      publishedAt: t,
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "pg_contact",
      title: "Contact",
      slug: "contact",
      content: "<p>Reach us at hello@mendanize.com</p>",
      excerpt: "Get in touch",
      status: "DRAFT",
      seoTitle: null,
      seoDescription: null,
      publishedAt: null,
      createdAt: t,
      updatedAt: t,
    },
  ]
}

function mapRow(row: {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  status: StaticPageRecord["status"]
  seoTitle: string | null
  seoDescription: string | null
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}): StaticPageRecord {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    excerpt: row.excerpt,
    status: row.status,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function listPagesAdmin(params: {
  query?: string
  status?: StaticPageRecord["status"]
  page?: number
  pageSize?: number
} = {}): Promise<ListResult<StaticPageRecord>> {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 50))
  const q = params.query?.trim().toLowerCase()

  if (!isDatabaseConfigured()) {
    seed()
    let items = [...memory.items]
    if (params.status) items = items.filter((p) => p.status === params.status)
    if (q) {
      items = items.filter(
        (p) => p.title.toLowerCase().includes(q) || p.slug.includes(q)
      )
    }
    const total = items.length
    const start = (page - 1) * pageSize
    return { items: items.slice(start, start + pageSize), total, page, pageSize }
  }

  const prisma = getPrisma()
  const where: {
    status?: StaticPageRecord["status"]
    OR?: Array<{
      title?: { contains: string; mode: "insensitive" }
      slug?: { contains: string; mode: "insensitive" }
    }>
  } = {}
  if (params.status) where.status = params.status
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ]
  }

  const [total, rows] = await Promise.all([
    prisma.staticPage.count({ where }),
    prisma.staticPage.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  return { items: rows.map(mapRow), total, page, pageSize }
}

export async function getPageById(id: string): Promise<StaticPageRecord | null> {
  if (!isDatabaseConfigured()) {
    seed()
    return memory.items.find((p) => p.id === id) ?? null
  }
  const row = await getPrisma().staticPage.findUnique({ where: { id } })
  return row ? mapRow(row) : null
}

export async function createPage(input: {
  title: string
  slug?: string
  content?: string
  excerpt?: string | null
  status?: StaticPageRecord["status"]
  seoTitle?: string | null
  seoDescription?: string | null
}): Promise<StaticPageRecord> {
  assertDatabaseForProductionWrites("services/admin/pages")
  const title = input.title.trim()
  if (!title) throw new Error("Title is required")
  const slug = slugify(input.slug?.trim() || title)
  const status = input.status ?? "DRAFT"
  const publishedAt = status === "PUBLISHED" ? new Date() : null

  if (!isDatabaseConfigured()) {
    seed()
    if (memory.items.some((p) => p.slug === slug)) throw new Error("Slug already exists")
    const t = nowIso()
    const row: StaticPageRecord = {
      id: `pg_${Date.now()}`,
      title,
      slug,
      content: input.content ?? "",
      excerpt: input.excerpt ?? null,
      status,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      publishedAt: publishedAt?.toISOString() ?? null,
      createdAt: t,
      updatedAt: t,
    }
    memory.items.unshift(row)
    return row
  }

  const row = await getPrisma().staticPage.create({
    data: {
      title,
      slug,
      content: input.content ?? "",
      excerpt: input.excerpt ?? null,
      status,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      publishedAt,
    },
  })
  return mapRow(row)
}

export async function updatePage(
  id: string,
  input: {
    title?: string
    slug?: string
    content?: string
    excerpt?: string | null
    status?: StaticPageRecord["status"]
    seoTitle?: string | null
    seoDescription?: string | null
  }
): Promise<StaticPageRecord> {
  if (!isDatabaseConfigured()) {
    seed()
    const row = memory.items.find((p) => p.id === id)
    if (!row) throw new Error("Page not found")
    if (input.title !== undefined) row.title = input.title.trim()
    if (input.slug !== undefined) row.slug = slugify(input.slug)
    if (input.content !== undefined) row.content = input.content
    if (input.excerpt !== undefined) row.excerpt = input.excerpt
    if (input.seoTitle !== undefined) row.seoTitle = input.seoTitle
    if (input.seoDescription !== undefined) row.seoDescription = input.seoDescription
    if (input.status !== undefined) {
      row.status = input.status
      if (input.status === "PUBLISHED" && !row.publishedAt) {
        row.publishedAt = nowIso()
      }
    }
    row.updatedAt = nowIso()
    return row
  }

  const existing = await getPrisma().staticPage.findUnique({ where: { id } })
  if (!existing) throw new Error("Page not found")

  const status = input.status ?? existing.status
  const publishedAt =
    status === "PUBLISHED" && !existing.publishedAt
      ? new Date()
      : existing.publishedAt

  const row = await getPrisma().staticPage.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.slug !== undefined ? { slug: slugify(input.slug) } : {}),
      ...(input.content !== undefined ? { content: input.content } : {}),
      ...(input.excerpt !== undefined ? { excerpt: input.excerpt } : {}),
      ...(input.seoTitle !== undefined ? { seoTitle: input.seoTitle } : {}),
      ...(input.seoDescription !== undefined
        ? { seoDescription: input.seoDescription }
        : {}),
      ...(input.status !== undefined ? { status, publishedAt } : {}),
    },
  })
  return mapRow(row)
}

export async function deletePages(ids: string[]): Promise<number> {
  if (!ids.length) return 0
  if (!isDatabaseConfigured()) {
    seed()
    const before = memory.items.length
    memory.items = memory.items.filter((p) => !ids.includes(p.id))
    return before - memory.items.length
  }
  const result = await getPrisma().staticPage.deleteMany({
    where: { id: { in: ids } },
  })
  return result.count
}
