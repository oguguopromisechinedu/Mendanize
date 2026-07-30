/**
 * Public platform services — free resources, glossary, newsletter helpers.
 */

import { randomBytes } from "crypto"

import {
  assertDatabaseForProductionWrites,
  getPrisma,
  isDatabaseConfigured,
} from "@/lib/db/prisma"
import type {
  FreeResourceStatus,
  FreeResourceType,
  GlossaryTermStatus,
} from "@prisma/client"

function slugify(input: string, fallback = "item"): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 120) || fallback
  )
}

function token() {
  return randomBytes(24).toString("hex")
}

// ── Free resources ────────────────────────────────────────────────────────────

export type FreeResourceRecord = {
  id: string
  title: string
  slug: string
  type: FreeResourceType
  description: string | null
  fileUrl: string
  category: string | null
  tags: string[]
  status: FreeResourceStatus
  featuredImageUrl: string | null
  seoTitle: string | null
  seoDescription: string | null
  downloadCount: number
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

function mapResource(row: {
  id: string
  title: string
  slug: string
  type: FreeResourceType
  description: string | null
  fileUrl: string
  category: string | null
  tags: string[]
  status: FreeResourceStatus
  featuredImageUrl: string | null
  seoTitle: string | null
  seoDescription: string | null
  downloadCount: number
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}): FreeResourceRecord {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    type: row.type,
    description: row.description,
    fileUrl: row.fileUrl,
    category: row.category,
    tags: row.tags,
    status: row.status,
    featuredImageUrl: row.featuredImageUrl,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    downloadCount: row.downloadCount,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

const resourceMemory: FreeResourceRecord[] = [
  {
    id: "fr_seed_1",
    title: "Prompt Engineering Cheat Sheet",
    slug: "prompt-engineering-cheat-sheet",
    type: "CHEATSHEET",
    description: "A one-page reference for clearer prompts.",
    fileUrl: "/resources/prompt-engineering-cheat-sheet.pdf",
    category: "Prompting",
    tags: ["prompts", "beginner"],
    status: "PUBLISHED",
    featuredImageUrl: null,
    seoTitle: "Prompt Engineering Cheat Sheet",
    seoDescription: "Download a free prompting cheat sheet from Mendanize.",
    downloadCount: 0,
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export async function listPublishedFreeResources(params: {
  query?: string
  category?: string
  type?: FreeResourceType
} = {}): Promise<FreeResourceRecord[]> {
  const q = params.query?.trim().toLowerCase()
  if (!isDatabaseConfigured()) {
    return resourceMemory.filter((r) => {
      if (r.status !== "PUBLISHED") return false
      if (params.category && r.category !== params.category) return false
      if (params.type && r.type !== params.type) return false
      if (
        q &&
        !r.title.toLowerCase().includes(q) &&
        !(r.description?.toLowerCase().includes(q) ?? false)
      ) {
        return false
      }
      return true
    })
  }
  const prisma = getPrisma()
  const rows = await prisma.freeResource.findMany({
    where: {
      status: "PUBLISHED",
      ...(params.category ? { category: params.category } : {}),
      ...(params.type ? { type: params.type } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ publishedAt: "desc" }, { title: "asc" }],
  })
  return rows.map(mapResource)
}

export async function getPublishedFreeResourceBySlug(
  slug: string
): Promise<FreeResourceRecord | null> {
  if (!isDatabaseConfigured()) {
    return (
      resourceMemory.find((r) => r.slug === slug && r.status === "PUBLISHED") ??
      null
    )
  }
  const row = await getPrisma().freeResource.findFirst({
    where: { slug, status: "PUBLISHED" },
  })
  return row ? mapResource(row) : null
}

export async function recordFreeResourceDownload(input: {
  resourceId: string
  publicUserId?: string | null
}): Promise<void> {
  if (!isDatabaseConfigured()) {
    const row = resourceMemory.find((r) => r.id === input.resourceId)
    if (row) row.downloadCount += 1
    return
  }
  const prisma = getPrisma()
  await prisma.$transaction([
    prisma.freeResourceDownload.create({
      data: {
        resourceId: input.resourceId,
        publicUserId: input.publicUserId ?? null,
      },
    }),
    prisma.freeResource.update({
      where: { id: input.resourceId },
      data: { downloadCount: { increment: 1 } },
    }),
  ])
}

export async function listFreeResourcesAdmin(): Promise<FreeResourceRecord[]> {
  if (!isDatabaseConfigured()) return [...resourceMemory]
  const rows = await getPrisma().freeResource.findMany({
    orderBy: { updatedAt: "desc" },
  })
  return rows.map(mapResource)
}

export async function upsertFreeResource(input: {
  id?: string
  title: string
  slug?: string
  type: FreeResourceType
  description?: string | null
  fileUrl: string
  category?: string | null
  tags?: string[]
  status?: FreeResourceStatus
  featuredImageUrl?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
}): Promise<FreeResourceRecord> {
  assertDatabaseForProductionWrites("services/platform/free-resources")
  const slug = slugify(input.slug || input.title, "resource")
  const status = input.status ?? "DRAFT"
  if (!isDatabaseConfigured()) {
    const t = new Date().toISOString()
    const row: FreeResourceRecord = {
      id: input.id ?? `fr_${Date.now()}`,
      title: input.title,
      slug,
      type: input.type,
      description: input.description ?? null,
      fileUrl: input.fileUrl,
      category: input.category ?? null,
      tags: input.tags ?? [],
      status,
      featuredImageUrl: input.featuredImageUrl ?? null,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      downloadCount: 0,
      publishedAt: status === "PUBLISHED" ? t : null,
      createdAt: t,
      updatedAt: t,
    }
    const idx = resourceMemory.findIndex((r) => r.id === row.id)
    if (idx >= 0) resourceMemory[idx] = row
    else resourceMemory.unshift(row)
    return row
  }
  const prisma = getPrisma()
  const data = {
    title: input.title,
    slug,
    type: input.type,
    description: input.description ?? null,
    fileUrl: input.fileUrl,
    category: input.category ?? null,
    tags: input.tags ?? [],
    status,
    featuredImageUrl: input.featuredImageUrl ?? null,
    seoTitle: input.seoTitle ?? null,
    seoDescription: input.seoDescription ?? null,
    publishedAt: status === "PUBLISHED" ? new Date() : null,
  }
  const row = input.id
    ? await prisma.freeResource.update({ where: { id: input.id }, data })
    : await prisma.freeResource.create({ data })
  return mapResource(row)
}

// ── Glossary ──────────────────────────────────────────────────────────────────

export type GlossaryTermRecord = {
  id: string
  term: string
  slug: string
  definition: string
  category: string | null
  relatedTermIds: string[]
  status: GlossaryTermStatus
  seoTitle: string | null
  seoDescription: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

function mapTerm(row: {
  id: string
  term: string
  slug: string
  definition: string
  category: string | null
  relatedTermIds: string[]
  status: GlossaryTermStatus
  seoTitle: string | null
  seoDescription: string | null
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}): GlossaryTermRecord {
  return {
    id: row.id,
    term: row.term,
    slug: row.slug,
    definition: row.definition,
    category: row.category,
    relatedTermIds: row.relatedTermIds,
    status: row.status,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

const glossaryMemory: GlossaryTermRecord[] = [
  {
    id: "gl_seed_1",
    term: "Large Language Model",
    slug: "large-language-model",
    definition:
      "A neural network trained on large text corpora to predict and generate language.",
    category: "Foundations",
    relatedTermIds: [],
    status: "PUBLISHED",
    seoTitle: "Large Language Model (LLM)",
    seoDescription: "What is a large language model?",
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "gl_seed_2",
    term: "Prompt Engineering",
    slug: "prompt-engineering",
    definition:
      "The practice of designing inputs that steer AI models toward useful outputs.",
    category: "Prompting",
    relatedTermIds: [],
    status: "PUBLISHED",
    seoTitle: "Prompt Engineering",
    seoDescription: "Definition of prompt engineering.",
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "gl_seed_3",
    term: "Retrieval-Augmented Generation",
    slug: "retrieval-augmented-generation",
    definition:
      "A pattern that retrieves external documents and feeds them to a model as context before generation.",
    category: "Architecture",
    relatedTermIds: [],
    status: "PUBLISHED",
    seoTitle: "RAG",
    seoDescription: "What is retrieval-augmented generation?",
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export async function listPublishedGlossaryTerms(params: {
  query?: string
  category?: string
  letter?: string
} = {}): Promise<GlossaryTermRecord[]> {
  const q = params.query?.trim().toLowerCase()
  const letter = params.letter?.trim().toUpperCase()
  if (!isDatabaseConfigured()) {
    return glossaryMemory
      .filter((t) => t.status === "PUBLISHED")
      .filter((t) => !params.category || t.category === params.category)
      .filter((t) => !letter || t.term.toUpperCase().startsWith(letter))
      .filter(
        (t) =>
          !q ||
          t.term.toLowerCase().includes(q) ||
          t.definition.toLowerCase().includes(q)
      )
      .sort((a, b) => a.term.localeCompare(b.term))
  }
  const rows = await getPrisma().glossaryTerm.findMany({
    where: {
      status: "PUBLISHED",
      ...(params.category ? { category: params.category } : {}),
      ...(letter ? { term: { startsWith: letter, mode: "insensitive" } } : {}),
      ...(q
        ? {
            OR: [
              { term: { contains: q, mode: "insensitive" } },
              { definition: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { term: "asc" },
  })
  return rows.map(mapTerm)
}

export async function getPublishedGlossaryTermBySlug(
  slug: string
): Promise<GlossaryTermRecord | null> {
  if (!isDatabaseConfigured()) {
    return (
      glossaryMemory.find((t) => t.slug === slug && t.status === "PUBLISHED") ??
      null
    )
  }
  const row = await getPrisma().glossaryTerm.findFirst({
    where: { slug, status: "PUBLISHED" },
  })
  return row ? mapTerm(row) : null
}

export async function listGlossaryTermsAdmin(): Promise<GlossaryTermRecord[]> {
  if (!isDatabaseConfigured()) return [...glossaryMemory]
  const rows = await getPrisma().glossaryTerm.findMany({
    orderBy: { term: "asc" },
  })
  return rows.map(mapTerm)
}

export async function upsertGlossaryTerm(input: {
  id?: string
  term: string
  slug?: string
  definition: string
  category?: string | null
  relatedTermIds?: string[]
  status?: GlossaryTermStatus
  seoTitle?: string | null
  seoDescription?: string | null
}): Promise<GlossaryTermRecord> {
  assertDatabaseForProductionWrites("services/platform/glossary")
  const slug = slugify(input.slug || input.term, "term")
  const status = input.status ?? "DRAFT"
  if (!isDatabaseConfigured()) {
    const t = new Date().toISOString()
    const row: GlossaryTermRecord = {
      id: input.id ?? `gl_${Date.now()}`,
      term: input.term,
      slug,
      definition: input.definition,
      category: input.category ?? null,
      relatedTermIds: input.relatedTermIds ?? [],
      status,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      publishedAt: status === "PUBLISHED" ? t : null,
      createdAt: t,
      updatedAt: t,
    }
    const idx = glossaryMemory.findIndex((r) => r.id === row.id)
    if (idx >= 0) glossaryMemory[idx] = row
    else glossaryMemory.unshift(row)
    return row
  }
  const prisma = getPrisma()
  const data = {
    term: input.term,
    slug,
    definition: input.definition,
    category: input.category ?? null,
    relatedTermIds: input.relatedTermIds ?? [],
    status,
    seoTitle: input.seoTitle ?? null,
    seoDescription: input.seoDescription ?? null,
    publishedAt: status === "PUBLISHED" ? new Date() : null,
  }
  const row = input.id
    ? await prisma.glossaryTerm.update({ where: { id: input.id }, data })
    : await prisma.glossaryTerm.create({ data })
  return mapTerm(row)
}

// ── Newsletter public ─────────────────────────────────────────────────────────

export type NewsletterArchiveItem = {
  id: string
  subject: string
  previewText: string | null
  sentAt: string | null
}

export async function listNewsletterArchive(): Promise<NewsletterArchiveItem[]> {
  if (!isDatabaseConfigured()) return []
  const rows = await getPrisma().newsletterCampaign.findMany({
    where: { status: "SENT" },
    orderBy: { sentAt: "desc" },
    take: 50,
    select: {
      id: true,
      subject: true,
      previewText: true,
      sentAt: true,
    },
  })
  return rows.map((r) => ({
    id: r.id,
    subject: r.subject,
    previewText: r.previewText,
    sentAt: r.sentAt?.toISOString() ?? null,
  }))
}

export async function getNewsletterArchiveItem(
  id: string
): Promise<(NewsletterArchiveItem & { bodyHtml: string }) | null> {
  if (!isDatabaseConfigured()) return null
  const row = await getPrisma().newsletterCampaign.findFirst({
    where: { id, status: "SENT" },
  })
  if (!row) return null
  return {
    id: row.id,
    subject: row.subject,
    previewText: row.previewText,
    sentAt: row.sentAt?.toISOString() ?? null,
    bodyHtml: row.bodyHtml,
  }
}

export async function subscribeNewsletter(input: {
  email: string
  preferences?: string[]
}): Promise<{ subscribed: true; verifyToken: string }> {
  assertDatabaseForProductionWrites("services/platform/newsletter")
  const email = input.email.trim().toLowerCase()
  const verifyToken = token()
  const unsubscribeToken = token()
  const preferences = input.preferences ?? []

  if (!isDatabaseConfigured()) {
    return { subscribed: true, verifyToken }
  }

  const prisma = getPrisma()
  const existing = await prisma.subscriber.findUnique({ where: { email } })
  if (existing) {
    await prisma.subscriber.update({
      where: { id: existing.id },
      data: {
        status: existing.status === "unsubscribed" ? "pending" : existing.status,
        preferences: preferences.length ? preferences : existing.preferences,
        categories: preferences.length ? preferences : existing.categories,
        verifyToken: existing.verifiedAt ? existing.verifyToken : verifyToken,
        unsubscribeToken: existing.unsubscribeToken ?? unsubscribeToken,
      },
    })
    return {
      subscribed: true,
      verifyToken: existing.verifyToken ?? verifyToken,
    }
  }

  await prisma.subscriber.create({
    data: {
      email,
      status: "pending",
      preferences,
      categories: preferences,
      verifyToken,
      unsubscribeToken,
    },
  })
  return { subscribed: true, verifyToken }
}

export async function verifyNewsletterSubscription(
  verifyToken: string
): Promise<boolean> {
  if (!isDatabaseConfigured()) return true
  const row = await getPrisma().subscriber.findFirst({
    where: { verifyToken },
  })
  if (!row) return false
  await getPrisma().subscriber.update({
    where: { id: row.id },
    data: {
      status: "active",
      verifiedAt: new Date(),
      verifyToken: null,
    },
  })
  return true
}

export async function unsubscribeNewsletter(
  unsubscribeToken: string
): Promise<boolean> {
  if (!isDatabaseConfigured()) return true
  const row = await getPrisma().subscriber.findFirst({
    where: { unsubscribeToken },
  })
  if (!row) return false
  await getPrisma().subscriber.update({
    where: { id: row.id },
    data: { status: "unsubscribed" },
  })
  return true
}

export async function updateNewsletterPreferences(input: {
  unsubscribeToken: string
  preferences: string[]
}): Promise<boolean> {
  if (!isDatabaseConfigured()) return true
  const row = await getPrisma().subscriber.findFirst({
    where: { unsubscribeToken: input.unsubscribeToken },
  })
  if (!row) return false
  await getPrisma().subscriber.update({
    where: { id: row.id },
    data: {
      preferences: input.preferences,
      categories: input.preferences,
    },
  })
  return true
}
