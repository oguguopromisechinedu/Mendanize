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

function companyPage(
  id: string,
  slug: string,
  title: string,
  excerpt: string,
  hero: string,
  content: string,
  t: string
): StaticPageRecord {
  return {
    id,
    title,
    slug,
    content,
    excerpt,
    hero,
    featuredImageUrl: null,
    featuredImageAlt: null,
    status: "PUBLISHED",
    seoTitle: `${title} | Mendanize`,
    seoDescription: excerpt,
    publishedAt: t,
    createdAt: t,
    updatedAt: t,
  }
}

function seed() {
  if (memory.seeded) return
  memory.seeded = true
  const t = nowIso()
  memory.items = [
    companyPage(
      "pg_about",
      "about",
      "About Us",
      "Learn modern technology with clarity on Mendanize.",
      "Our mission",
      "<p>Mendanize is an AI-powered technology learning platform. We combine structured guides, curated AI tools, articles, and community so learners can build real skills—not just skim headlines.</p><p>We believe education should be practical, accessible, and connected to the tools people actually use.</p>",
      t
    ),
    companyPage(
      "pg_contact",
      "contact",
      "Contact",
      "Get in touch with the Mendanize team.",
      "We're here to help",
      "<p>Email us at <a href=\"mailto:hello@mendanize.com\">hello@mendanize.com</a> for partnership, press, or product questions.</p><p>For account and learning support, use the in-app help options after you sign in.</p>",
      t
    ),
    companyPage(
      "pg_faq",
      "faq",
      "FAQ",
      "Answers to common questions about Mendanize.",
      "Frequently asked questions",
      "<h2>Is Mendanize free?</h2><p>Core articles and many learning guides are free. Paid plans unlock advanced AI tools and workspace features.</p><h2>How do courses work?</h2><p>AI Courses are structured guides with modules, lessons, quizzes, and progress tracking.</p><h2>Can I cancel anytime?</h2><p>Yes. Manage billing from your account settings.</p>",
      t
    ),
    companyPage(
      "pg_pricing",
      "pricing",
      "Pricing",
      "Simple plans for learners and teams.",
      "Choose your plan",
      "<p>Start free with articles and learning guides. Upgrade when you need more AI generations, workspace capacity, or team seats.</p><p>Visit the interactive pricing catalog for current plan details and checkout.</p>",
      t
    ),
    companyPage(
      "pg_privacy",
      "privacy",
      "Privacy Policy",
      "How Mendanize collects, uses, and protects your data.",
      "Your privacy matters",
      "<p>We collect account details, learning progress, and usage analytics needed to operate the platform. We do not sell personal data.</p><p>You can manage cookie and marketing preferences from the site banner and account settings. Contact hello@mendanize.com for data requests.</p>",
      t
    ),
    companyPage(
      "pg_terms",
      "terms",
      "Terms of Service",
      "The rules for using Mendanize.",
      "Terms of Service",
      "<p>By using Mendanize you agree to use the platform lawfully, respect intellectual property, and not abuse AI or community features.</p><p>We may update these terms; continued use after changes constitutes acceptance.</p>",
      t
    ),
    companyPage(
      "pg_cookies",
      "cookies",
      "Cookies Policy",
      "How we use cookies and similar technologies.",
      "Cookies Policy",
      "<p>We use essential cookies for authentication and security, plus optional analytics cookies when you consent.</p><p>You can update preferences anytime via the cookie banner or account privacy settings.</p>",
      t
    ),
    companyPage(
      "pg_careers",
      "careers",
      "Careers",
      "Join the team building clearer technology learning.",
      "Build with us",
      "<p>We're looking for educators, engineers, and designers who care about practical AI education.</p><p>Send a short note and resume to <a href=\"mailto:careers@mendanize.com\">careers@mendanize.com</a>.</p>",
      t
    ),
    companyPage(
      "pg_partners",
      "partners",
      "Partners",
      "Collaborate with Mendanize on learning and tools.",
      "Partner with Mendanize",
      "<p>We partner with tool makers, educators, and organizations to bring high-quality AI learning to more people.</p><p>Reach out at <a href=\"mailto:partners@mendanize.com\">partners@mendanize.com</a>.</p>",
      t
    ),
  ]
}

/** Ensure required company CMS pages exist in the database (idempotent upsert by slug). */
export async function ensureCompanyPagesSeeded(): Promise<void> {
  if (!isDatabaseConfigured()) {
    seed()
    return
  }
  seed()
  const prisma = getPrisma()
  for (const page of memory.items) {
    await prisma.staticPage.upsert({
      where: { slug: page.slug },
      create: {
        title: page.title,
        slug: page.slug,
        content: page.content,
        excerpt: page.excerpt,
        hero: page.hero,
        featuredImageUrl: page.featuredImageUrl,
        featuredImageAlt: page.featuredImageAlt,
        status: page.status,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        publishedAt: page.publishedAt ? new Date(page.publishedAt) : new Date(),
      },
      update: {},
    })
  }
}

function mapRow(row: {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  hero: string | null
  featuredImageUrl: string | null
  featuredImageAlt: string | null
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
    hero: row.hero,
    featuredImageUrl: row.featuredImageUrl,
    featuredImageAlt: row.featuredImageAlt,
    status: row.status,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export type PageWriteInput = {
  title?: string
  slug?: string
  content?: string
  excerpt?: string | null
  hero?: string | null
  featuredImageUrl?: string | null
  featuredImageAlt?: string | null
  status?: StaticPageRecord["status"]
  seoTitle?: string | null
  seoDescription?: string | null
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

/** Published page by public URL slug — returns null when missing or unpublished. */
export async function getPublishedPageBySlug(
  slug: string
): Promise<StaticPageRecord | null> {
  const normalized = slug.trim().toLowerCase()
  if (!normalized) return null

  if (!isDatabaseConfigured()) {
    seed()
    return (
      memory.items.find(
        (p) => p.slug === normalized && p.status === "PUBLISHED"
      ) ?? null
    )
  }

  const prisma = getPrisma()
  let row = await prisma.staticPage.findFirst({
    where: { slug: normalized, status: "PUBLISHED" },
  })
  if (!row) {
    await ensureCompanyPagesSeeded().catch(() => undefined)
    row = await prisma.staticPage.findFirst({
      where: { slug: normalized, status: "PUBLISHED" },
    })
  }
  return row ? mapRow(row) : null
}

export async function createPage(input: {
  title: string
  slug?: string
  content?: string
  excerpt?: string | null
  hero?: string | null
  featuredImageUrl?: string | null
  featuredImageAlt?: string | null
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
      hero: input.hero ?? null,
      featuredImageUrl: input.featuredImageUrl ?? null,
      featuredImageAlt: input.featuredImageAlt ?? null,
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
      hero: input.hero ?? null,
      featuredImageUrl: input.featuredImageUrl ?? null,
      featuredImageAlt: input.featuredImageAlt ?? null,
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
  input: PageWriteInput
): Promise<StaticPageRecord> {
  if (!isDatabaseConfigured()) {
    seed()
    const row = memory.items.find((p) => p.id === id)
    if (!row) throw new Error("Page not found")
    if (input.title !== undefined) row.title = input.title.trim()
    if (input.slug !== undefined) row.slug = slugify(input.slug)
    if (input.content !== undefined) row.content = input.content
    if (input.excerpt !== undefined) row.excerpt = input.excerpt
    if (input.hero !== undefined) row.hero = input.hero
    if (input.featuredImageUrl !== undefined) {
      row.featuredImageUrl = input.featuredImageUrl
    }
    if (input.featuredImageAlt !== undefined) {
      row.featuredImageAlt = input.featuredImageAlt
    }
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
      ...(input.hero !== undefined ? { hero: input.hero } : {}),
      ...(input.featuredImageUrl !== undefined
        ? { featuredImageUrl: input.featuredImageUrl }
        : {}),
      ...(input.featuredImageAlt !== undefined
        ? { featuredImageAlt: input.featuredImageAlt }
        : {}),
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
