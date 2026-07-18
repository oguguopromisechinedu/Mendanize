import {
  assertDatabaseForProductionWrites,
  getPrisma,
  isDatabaseConfigured,
} from "@/lib/db/prisma"
import type { ListResult, TagAdminRecord } from "./types"

function slugify(input: string, fallback = "tag"): string {
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
  tags: [] as TagAdminRecord[],
  seeded: false,
}

function seed() {
  if (memory.seeded) return
  memory.seeded = true
  const t = nowIso()
  memory.tags = [
    {
      id: "tag_ai",
      name: "AI",
      slug: "ai",
      articleCount: 3,
      toolCount: 2,
      postCount: 0,
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "tag_llm",
      name: "LLM",
      slug: "llm",
      articleCount: 2,
      toolCount: 1,
      postCount: 0,
      createdAt: t,
      updatedAt: t,
    },
  ]
}

export async function listTagsAdminDetailed(params: {
  query?: string
  page?: number
  pageSize?: number
} = {}): Promise<ListResult<TagAdminRecord>> {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 50))
  const q = params.query?.trim().toLowerCase()

  if (!isDatabaseConfigured()) {
    seed()
    let items = [...memory.tags]
    if (q) {
      items = items.filter(
        (t) => t.name.toLowerCase().includes(q) || t.slug.includes(q)
      )
    }
    items.sort((a, b) => a.name.localeCompare(b.name))
    const total = items.length
    const start = (page - 1) * pageSize
    return { items: items.slice(start, start + pageSize), total, page, pageSize }
  }

  const prisma = getPrisma()
  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { slug: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {}

  const [total, rows] = await Promise.all([
    prisma.tag.count({ where }),
    prisma.tag.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: {
          select: { articleTags: true, toolTags: true, postTags: true },
        },
      },
    }),
  ])

  return {
    items: rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      articleCount: r._count.articleTags,
      toolCount: r._count.toolTags,
      postCount: r._count.postTags,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })),
    total,
    page,
    pageSize,
  }
}

export async function createTag(input: {
  name: string
  slug?: string
}): Promise<TagAdminRecord> {
  assertDatabaseForProductionWrites("services/admin/tags")
  const name = input.name.trim()
  if (!name) throw new Error("Tag name is required")
  const slug = slugify(input.slug?.trim() || name)

  if (!isDatabaseConfigured()) {
    seed()
    if (memory.tags.some((t) => t.slug === slug || t.name.toLowerCase() === name.toLowerCase())) {
      throw new Error("Tag already exists")
    }
    const t = nowIso()
    const row: TagAdminRecord = {
      id: `tag_${Date.now()}`,
      name,
      slug,
      articleCount: 0,
      toolCount: 0,
      postCount: 0,
      createdAt: t,
      updatedAt: t,
    }
    memory.tags.push(row)
    return row
  }

  const prisma = getPrisma()
  const row = await prisma.tag.create({
    data: { name, slug },
    include: {
      _count: { select: { articleTags: true, toolTags: true, postTags: true } },
    },
  })
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    articleCount: row._count.articleTags,
    toolCount: row._count.toolTags,
    postCount: row._count.postTags,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function updateTag(
  id: string,
  input: { name: string; slug?: string }
): Promise<TagAdminRecord> {
  const name = input.name.trim()
  if (!name) throw new Error("Tag name is required")
  const slug = slugify(input.slug?.trim() || name)

  if (!isDatabaseConfigured()) {
    seed()
    const idx = memory.tags.findIndex((t) => t.id === id)
    if (idx < 0) throw new Error("Tag not found")
    memory.tags[idx] = {
      ...memory.tags[idx],
      name,
      slug,
      updatedAt: nowIso(),
    }
    return memory.tags[idx]
  }

  const prisma = getPrisma()
  const row = await prisma.tag.update({
    where: { id },
    data: { name, slug },
    include: {
      _count: { select: { articleTags: true, toolTags: true, postTags: true } },
    },
  })
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    articleCount: row._count.articleTags,
    toolCount: row._count.toolTags,
    postCount: row._count.postTags,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function deleteTags(ids: string[]): Promise<number> {
  if (!ids.length) return 0
  if (!isDatabaseConfigured()) {
    seed()
    const before = memory.tags.length
    memory.tags = memory.tags.filter((t) => !ids.includes(t.id))
    return before - memory.tags.length
  }
  const result = await getPrisma().tag.deleteMany({ where: { id: { in: ids } } })
  return result.count
}

export async function mergeTags(
  sourceId: string,
  targetId: string
): Promise<TagAdminRecord> {
  if (sourceId === targetId) throw new Error("Cannot merge a tag into itself")

  if (!isDatabaseConfigured()) {
    seed()
    const source = memory.tags.find((t) => t.id === sourceId)
    const target = memory.tags.find((t) => t.id === targetId)
    if (!source || !target) throw new Error("Tag not found")
    target.articleCount += source.articleCount
    target.toolCount += source.toolCount
    target.postCount += source.postCount
    target.updatedAt = nowIso()
    memory.tags = memory.tags.filter((t) => t.id !== sourceId)
    return target
  }

  const prisma = getPrisma()
  await prisma.$transaction(async (tx) => {
    const articleLinks = await tx.articleTag.findMany({ where: { tagId: sourceId } })
    for (const link of articleLinks) {
      await tx.articleTag.upsert({
        where: {
          articleId_tagId: { articleId: link.articleId, tagId: targetId },
        },
        create: { articleId: link.articleId, tagId: targetId },
        update: {},
      })
    }
    const toolLinks = await tx.toolTag.findMany({ where: { tagId: sourceId } })
    for (const link of toolLinks) {
      await tx.toolTag.upsert({
        where: { toolId_tagId: { toolId: link.toolId, tagId: targetId } },
        create: { toolId: link.toolId, tagId: targetId },
        update: {},
      })
    }
    const postLinks = await tx.postTag.findMany({ where: { tagId: sourceId } })
    for (const link of postLinks) {
      await tx.postTag.upsert({
        where: { postId_tagId: { postId: link.postId, tagId: targetId } },
        create: { postId: link.postId, tagId: targetId },
        update: {},
      })
    }
    await tx.tag.delete({ where: { id: sourceId } })
  })

  const list = await listTagsAdminDetailed({ pageSize: 100 })
  const target = list.items.find((t) => t.id === targetId)
  if (!target) throw new Error("Target tag not found after merge")
  return target
}
