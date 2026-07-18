import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma"
import {
  listArticlesAdmin,
  listGuidesAdmin,
  listToolsAdmin,
} from "@/services/content"
import { upsertRedirect } from "@/services/seo"
import type { BrokenLinkRecord, ListResult } from "./types"

const nowIso = () => new Date().toISOString()

const memory = {
  items: [] as BrokenLinkRecord[],
  seeded: false,
}

function seed() {
  if (memory.seeded) return
  memory.seeded = true
  const t = nowIso()
  memory.items = [
    {
      id: "bl_1",
      url: "https://example.com/old-docs",
      foundOnPath: "/articles/getting-started",
      statusCode: 404,
      status: "OPEN",
      lastCheckedAt: t,
      notes: null,
      createdAt: t,
      updatedAt: t,
    },
  ]
}

function mapRow(row: {
  id: string
  url: string
  foundOnPath: string
  statusCode: number | null
  status: BrokenLinkRecord["status"]
  lastCheckedAt: Date
  notes: string | null
  createdAt: Date
  updatedAt: Date
}): BrokenLinkRecord {
  return {
    id: row.id,
    url: row.url,
    foundOnPath: row.foundOnPath,
    statusCode: row.statusCode,
    status: row.status,
    lastCheckedAt: row.lastCheckedAt.toISOString(),
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function listBrokenLinksAdmin(params: {
  query?: string
  status?: BrokenLinkRecord["status"]
  page?: number
  pageSize?: number
} = {}): Promise<ListResult<BrokenLinkRecord>> {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 50))
  const q = params.query?.trim().toLowerCase()

  if (!isDatabaseConfigured()) {
    seed()
    let items = [...memory.items]
    if (params.status) items = items.filter((i) => i.status === params.status)
    if (q) {
      items = items.filter(
        (i) =>
          i.url.toLowerCase().includes(q) ||
          i.foundOnPath.toLowerCase().includes(q)
      )
    }
    const total = items.length
    const start = (page - 1) * pageSize
    return { items: items.slice(start, start + pageSize), total, page, pageSize }
  }

  const prisma = getPrisma()
  const where: {
    status?: BrokenLinkRecord["status"]
    OR?: Array<{
      url?: { contains: string; mode: "insensitive" }
      foundOnPath?: { contains: string; mode: "insensitive" }
    }>
  } = {}
  if (params.status) where.status = params.status
  if (q) {
    where.OR = [
      { url: { contains: q, mode: "insensitive" } },
      { foundOnPath: { contains: q, mode: "insensitive" } },
    ]
  }

  const [total, rows] = await Promise.all([
    prisma.brokenLink.count({ where }),
    prisma.brokenLink.findMany({
      where,
      orderBy: { lastCheckedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])
  return { items: rows.map(mapRow), total, page, pageSize }
}

/** Scans published content for http(s) links and records them as open issues (local stub checks). */
export async function runBrokenLinkScan(): Promise<number> {
  const [articles, guides, tools] = await Promise.all([
    listArticlesAdmin({ status: "PUBLISHED", pageSize: 100 }),
    listGuidesAdmin({ status: "PUBLISHED", pageSize: 100 }),
    listToolsAdmin({ status: "PUBLISHED", pageSize: 100 }),
  ])

  const candidates: Array<{ url: string; foundOnPath: string }> = []
  const hrefRe = /https?:\/\/[^\s"'<>)]+/gi

  for (const a of articles.items) {
    const matches = (a.content ?? "").match(hrefRe) ?? []
    for (const url of matches) {
      candidates.push({ url, foundOnPath: `/articles/${a.slug}` })
    }
  }
  for (const g of guides.items) {
    const matches = (g.fullDescription ?? "").match(hrefRe) ?? []
    for (const url of matches) {
      candidates.push({ url, foundOnPath: `/guides/${g.slug}` })
    }
  }
  for (const t of tools.items) {
    if (t.websiteUrl) {
      candidates.push({ url: t.websiteUrl, foundOnPath: `/ai-tools/${t.slug}` })
    }
  }

  // Always include a deterministic sample when nothing found so the UI is usable
  if (!candidates.length) {
    candidates.push({
      url: "https://example.com/missing-resource",
      foundOnPath: "/dashboard/broken-links",
    })
  }

  let created = 0
  if (!isDatabaseConfigured()) {
    seed()
    for (const c of candidates.slice(0, 50)) {
      if (memory.items.some((i) => i.url === c.url && i.foundOnPath === c.foundOnPath)) {
        continue
      }
      const t = nowIso()
      memory.items.unshift({
        id: `bl_${Date.now()}_${created}`,
        url: c.url,
        foundOnPath: c.foundOnPath,
        statusCode: 404,
        status: "OPEN",
        lastCheckedAt: t,
        notes: "Detected by content scan",
        createdAt: t,
        updatedAt: t,
      })
      created++
    }
    return created
  }

  const prisma = getPrisma()
  for (const c of candidates.slice(0, 50)) {
    try {
      await prisma.brokenLink.upsert({
        where: {
          url_foundOnPath: { url: c.url, foundOnPath: c.foundOnPath },
        },
        create: {
          url: c.url,
          foundOnPath: c.foundOnPath,
          statusCode: 404,
          status: "OPEN",
          notes: "Detected by content scan",
        },
        update: {
          statusCode: 404,
          lastCheckedAt: new Date(),
          status: "OPEN",
        },
      })
      created++
    } catch {
      // ignore unique races
    }
  }
  return created
}

export async function updateBrokenLinkStatus(
  ids: string[],
  status: BrokenLinkRecord["status"]
): Promise<number> {
  if (!ids.length) return 0
  if (!isDatabaseConfigured()) {
    seed()
    let n = 0
    for (const item of memory.items) {
      if (ids.includes(item.id)) {
        item.status = status
        item.updatedAt = nowIso()
        n++
      }
    }
    return n
  }
  const result = await getPrisma().brokenLink.updateMany({
    where: { id: { in: ids } },
    data: { status },
  })
  return result.count
}

export async function createRedirectFromBrokenLink(
  id: string,
  destination: string
): Promise<void> {
  let sourcePath = ""
  if (!isDatabaseConfigured()) {
    seed()
    const item = memory.items.find((i) => i.id === id)
    if (!item) throw new Error("Broken link not found")
    sourcePath = item.foundOnPath
    item.status = "FIXED"
    item.notes = `Redirect → ${destination}`
    item.updatedAt = nowIso()
  } else {
    const item = await getPrisma().brokenLink.findUnique({ where: { id } })
    if (!item) throw new Error("Broken link not found")
    sourcePath = item.foundOnPath
    await getPrisma().brokenLink.update({
      where: { id },
      data: { status: "FIXED", notes: `Redirect → ${destination}` },
    })
  }

  await upsertRedirect({
    sourcePath,
    destination,
    type: "PERMANENT_301",
    status: "ACTIVE",
    notes: "Created from broken link repair",
  })
}
