import "server-only"

import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma"
import {
  listArticlesAdmin,
  listGuidesAdmin,
  listToolsAdmin,
} from "@/services/content"
import { upsertRedirect } from "@/services/seo"
import { listPagesAdmin } from "./pages"
import type { BrokenLinkRecord, ListResult } from "./types"

const nowIso = () => new Date().toISOString()

const MAX_URLS_PER_SCAN = 80
const CHECK_CONCURRENCY = 5
const CHECK_TIMEOUT_MS = 8_000
const USER_AGENT = "MendanizeLinkChecker/1.0 (+https://mendanize.com)"

const memory = {
  items: [] as BrokenLinkRecord[],
  seeded: false,
}

export type BrokenLinkScanResult = {
  checked: number
  broken: number
  recovered: number
  skipped: number
}

function seed() {
  if (memory.seeded) return
  memory.seeded = true
  memory.items = []
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

function normalizeExtractedUrl(raw: string): string | null {
  let url = raw.trim()
  url = url.replace(/&amp;/gi, "&")
  url = url.replace(/[.,;:!?)\]}>]+$/g, "")
  if (!/^https?:\/\//i.test(url)) return null
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null
    return parsed.toString()
  } catch {
    return null
  }
}

function extractUrls(text: string | null | undefined): string[] {
  if (!text) return []
  const hrefRe = /https?:\/\/[^\s"'<>)\\]]+/gi
  const found: string[] = []
  for (const match of text.match(hrefRe) ?? []) {
    const normalized = normalizeExtractedUrl(match)
    if (normalized) found.push(normalized)
  }
  return found
}

function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "")
  if (
    host === "localhost" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    return true
  }

  // IPv4 literal
  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (ipv4) {
    const parts = ipv4.slice(1).map(Number)
    const [a, b] = parts
    if (a === 10) return true
    if (a === 127) return true
    if (a === 0) return true
    if (a === 169 && b === 254) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    if (a === 100 && b >= 64 && b <= 127) return true // CGNAT
  }

  // Crude IPv6 private/link-local
  if (host.includes(":")) {
    if (
      host.startsWith("fc") ||
      host.startsWith("fd") ||
      host.startsWith("fe80") ||
      host === "::" ||
      host === "::1"
    ) {
      return true
    }
  }

  return false
}

type CheckResult = {
  statusCode: number | null
  broken: boolean
  notes: string
  skipped?: boolean
}

async function checkHttpUrl(url: string): Promise<CheckResult> {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return { statusCode: null, broken: true, notes: "Invalid URL" }
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      statusCode: null,
      broken: true,
      notes: "Only http(s) URLs are checked",
      skipped: true,
    }
  }

  if (isBlockedHost(parsed.hostname)) {
    return {
      statusCode: null,
      broken: false,
      notes: "Skipped private/local host (SSRF protection)",
      skipped: true,
    }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS)

  const request = async (method: "HEAD" | "GET") =>
    fetch(url, {
      method,
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "*/*",
      },
    })

  try {
    let res = await request("HEAD")
    // Some hosts reject HEAD — fall back to GET.
    if (res.status === 405 || res.status === 501 || res.status === 403) {
      res = await request("GET")
    }

    const statusCode = res.status
    // 2xx/3xx count as reachable. 401/403 often mean the resource exists behind auth.
    if (statusCode >= 200 && statusCode < 400) {
      return { statusCode, broken: false, notes: `Reachable (HTTP ${statusCode})` }
    }
    if (statusCode === 401 || statusCode === 403) {
      return {
        statusCode,
        broken: false,
        notes: `Protected but reachable (HTTP ${statusCode})`,
      }
    }
    return {
      statusCode,
      broken: true,
      notes: `Broken (HTTP ${statusCode})`,
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.name === "AbortError"
          ? `Timed out after ${CHECK_TIMEOUT_MS / 1000}s`
          : error.message
        : "Request failed"
    return { statusCode: null, broken: true, notes: message }
  } finally {
    clearTimeout(timer)
  }
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0
  async function worker() {
    while (next < items.length) {
      const index = next++
      results[index] = await fn(items[index]!)
    }
  }
  const workers = Array.from(
    { length: Math.min(concurrency, Math.max(1, items.length)) },
    () => worker()
  )
  await Promise.all(workers)
  return results
}

async function collectLinkCandidates(): Promise<
  Array<{ url: string; foundOnPath: string }>
> {
  const [articles, guides, tools, pages] = await Promise.all([
    listArticlesAdmin({ status: "PUBLISHED", pageSize: 100 }),
    listGuidesAdmin({ status: "PUBLISHED", pageSize: 100 }),
    listToolsAdmin({ status: "PUBLISHED", pageSize: 100 }),
    listPagesAdmin({ status: "PUBLISHED", pageSize: 100 }),
  ])

  const candidates: Array<{ url: string; foundOnPath: string }> = []

  for (const a of articles.items) {
    const path = `/articles/${a.slug}`
    for (const url of extractUrls(a.content)) {
      candidates.push({ url, foundOnPath: path })
    }
    for (const url of extractUrls(a.excerpt ?? null)) {
      candidates.push({ url, foundOnPath: path })
    }
  }

  for (const g of guides.items) {
    const path = `/guides/${g.slug}`
    for (const url of extractUrls(g.fullDescription)) {
      candidates.push({ url, foundOnPath: path })
    }
    for (const section of g.sections ?? []) {
      for (const lesson of section.lessons ?? []) {
        const lessonPath = `${path}/${lesson.slug}`
        for (const url of [
          ...extractUrls(lesson.content),
          ...extractUrls(lesson.videoUrl),
          ...extractUrls(lesson.resourceUrl),
        ]) {
          candidates.push({ url, foundOnPath: lessonPath })
        }
      }
    }
  }

  for (const t of tools.items) {
    const path = `/ai-tools/${t.slug}`
    if (t.websiteUrl) {
      const normalized = normalizeExtractedUrl(t.websiteUrl)
      if (normalized) candidates.push({ url: normalized, foundOnPath: path })
    }
    for (const url of extractUrls(t.fullDescription ?? null)) {
      candidates.push({ url, foundOnPath: path })
    }
  }

  for (const p of pages.items) {
    const path = `/${p.slug}`
    for (const url of extractUrls(p.content)) {
      candidates.push({ url, foundOnPath: path })
    }
  }

  // Prefer first occurrence path per URL for reporting, keep unique pairs.
  const seen = new Set<string>()
  const unique: Array<{ url: string; foundOnPath: string }> = []
  for (const c of candidates) {
    const key = `${c.url}::${c.foundOnPath}`
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(c)
  }
  return unique
}

async function upsertBrokenLink(input: {
  url: string
  foundOnPath: string
  statusCode: number | null
  status: BrokenLinkRecord["status"]
  notes: string
}): Promise<"created" | "updated"> {
  const t = nowIso()
  if (!isDatabaseConfigured()) {
    seed()
    const existing = memory.items.find(
      (i) => i.url === input.url && i.foundOnPath === input.foundOnPath
    )
    if (existing) {
      existing.statusCode = input.statusCode
      existing.status = input.status
      existing.notes = input.notes
      existing.lastCheckedAt = t
      existing.updatedAt = t
      return "updated"
    }
    memory.items.unshift({
      id: `bl_${Date.now()}_${memory.items.length}`,
      url: input.url,
      foundOnPath: input.foundOnPath,
      statusCode: input.statusCode,
      status: input.status,
      lastCheckedAt: t,
      notes: input.notes,
      createdAt: t,
      updatedAt: t,
    })
    return "created"
  }

  const prisma = getPrisma()
  const existing = await prisma.brokenLink.findUnique({
    where: {
      url_foundOnPath: { url: input.url, foundOnPath: input.foundOnPath },
    },
  })
  await prisma.brokenLink.upsert({
    where: {
      url_foundOnPath: { url: input.url, foundOnPath: input.foundOnPath },
    },
    create: {
      url: input.url,
      foundOnPath: input.foundOnPath,
      statusCode: input.statusCode,
      status: input.status,
      notes: input.notes,
      lastCheckedAt: new Date(),
    },
    update: {
      statusCode: input.statusCode,
      status: input.status,
      notes: input.notes,
      lastCheckedAt: new Date(),
    },
  })
  return existing ? "updated" : "created"
}

/**
 * Scans published content for outbound http(s) links and HTTP-verifies them.
 * Only unreachable/broken URLs stay OPEN. Previously OPEN links that recover
 * are marked FIXED.
 */
export async function runBrokenLinkScan(): Promise<BrokenLinkScanResult> {
  const candidates = await collectLinkCandidates()
  const limited = candidates.slice(0, MAX_URLS_PER_SCAN)

  if (!limited.length) {
    return { checked: 0, broken: 0, recovered: 0, skipped: 0 }
  }

  const checks = await mapPool(limited, CHECK_CONCURRENCY, async (candidate) => {
    const result = await checkHttpUrl(candidate.url)
    return { candidate, result }
  })

  let broken = 0
  let recovered = 0
  let skipped = 0

  for (const { candidate, result } of checks) {
    if (result.skipped) {
      skipped++
      continue
    }

    if (result.broken) {
      await upsertBrokenLink({
        url: candidate.url,
        foundOnPath: candidate.foundOnPath,
        statusCode: result.statusCode,
        status: "OPEN",
        notes: result.notes,
      })
      broken++
      continue
    }

    // Healthy URL — recover any prior OPEN row; otherwise don't invent rows.
    if (!isDatabaseConfigured()) {
      seed()
      const existing = memory.items.find(
        (i) =>
          i.url === candidate.url &&
          i.foundOnPath === candidate.foundOnPath &&
          i.status === "OPEN"
      )
      if (existing) {
        existing.status = "FIXED"
        existing.statusCode = result.statusCode
        existing.notes = `Recovered on rescan — ${result.notes}`
        existing.lastCheckedAt = nowIso()
        existing.updatedAt = nowIso()
        recovered++
      }
      continue
    }

    const existing = await getPrisma().brokenLink.findUnique({
      where: {
        url_foundOnPath: {
          url: candidate.url,
          foundOnPath: candidate.foundOnPath,
        },
      },
    })
    if (existing && existing.status === "OPEN") {
      await getPrisma().brokenLink.update({
        where: { id: existing.id },
        data: {
          status: "FIXED",
          statusCode: result.statusCode,
          notes: `Recovered on rescan — ${result.notes}`,
          lastCheckedAt: new Date(),
        },
      })
      recovered++
    }
  }

  return {
    checked: limited.length,
    broken,
    recovered,
    skipped,
  }
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
