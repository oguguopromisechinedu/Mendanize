import {
  assertDatabaseForProductionWrites,
  getPrisma,
  isDatabaseConfigured,
} from "@/lib/db/prisma"
import type { ListResult, SubscriberRecord } from "./types"

const nowIso = () => new Date().toISOString()

const memory = {
  items: [] as SubscriberRecord[],
  seeded: false,
}

function seed() {
  if (memory.seeded) return
  memory.seeded = true
  const t = nowIso()
  memory.items = [
    {
      id: "sub_1",
      email: "alex@example.com",
      name: "Alex Rivera",
      status: "active",
      categories: ["ai", "guides"],
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "sub_2",
      email: "sam@example.com",
      name: "Sam Chen",
      status: "active",
      categories: ["articles"],
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "sub_3",
      email: "unsub@example.com",
      name: null,
      status: "unsubscribed",
      categories: [],
      createdAt: t,
      updatedAt: t,
    },
  ]
}

function mapRow(row: {
  id: string
  email: string
  name: string | null
  status: string
  categories: string[]
  createdAt: Date
  updatedAt: Date
}): SubscriberRecord {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    status: row.status,
    categories: row.categories,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function listSubscribersAdmin(params: {
  query?: string
  status?: string
  page?: number
  pageSize?: number
} = {}): Promise<ListResult<SubscriberRecord>> {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 50))
  const q = params.query?.trim().toLowerCase()

  if (!isDatabaseConfigured()) {
    seed()
    let items = [...memory.items]
    if (params.status) items = items.filter((s) => s.status === params.status)
    if (q) {
      items = items.filter(
        (s) =>
          s.email.toLowerCase().includes(q) ||
          (s.name?.toLowerCase().includes(q) ?? false)
      )
    }
    const total = items.length
    const start = (page - 1) * pageSize
    return { items: items.slice(start, start + pageSize), total, page, pageSize }
  }

  const prisma = getPrisma()
  const where: {
    status?: string
    OR?: Array<{
      email?: { contains: string; mode: "insensitive" }
      name?: { contains: string; mode: "insensitive" }
    }>
  } = {}
  if (params.status) where.status = params.status
  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { name: { contains: q, mode: "insensitive" } },
    ]
  }

  const [total, rows] = await Promise.all([
    prisma.subscriber.count({ where }),
    prisma.subscriber.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  return { items: rows.map(mapRow), total, page, pageSize }
}

export async function createSubscriber(input: {
  email: string
  name?: string | null
  status?: string
  categories?: string[]
}): Promise<SubscriberRecord> {
  assertDatabaseForProductionWrites("services/admin/subscribers")
  const email = input.email.trim().toLowerCase()
  if (!email.includes("@")) throw new Error("Valid email is required")

  if (!isDatabaseConfigured()) {
    seed()
    if (memory.items.some((s) => s.email === email)) {
      throw new Error("Subscriber already exists")
    }
    const t = nowIso()
    const row: SubscriberRecord = {
      id: `sub_${Date.now()}`,
      email,
      name: input.name?.trim() || null,
      status: input.status ?? "active",
      categories: input.categories ?? [],
      createdAt: t,
      updatedAt: t,
    }
    memory.items.unshift(row)
    return row
  }

  const row = await getPrisma().subscriber.create({
    data: {
      email,
      name: input.name?.trim() || null,
      status: input.status ?? "active",
      categories: input.categories ?? [],
    },
  })
  return mapRow(row)
}

export async function updateSubscriber(
  id: string,
  input: {
    email?: string
    name?: string | null
    status?: string
    categories?: string[]
  }
): Promise<SubscriberRecord> {
  if (!isDatabaseConfigured()) {
    seed()
    const row = memory.items.find((s) => s.id === id)
    if (!row) throw new Error("Subscriber not found")
    if (input.email) row.email = input.email.trim().toLowerCase()
    if (input.name !== undefined) row.name = input.name?.trim() || null
    if (input.status) row.status = input.status
    if (input.categories) row.categories = input.categories
    row.updatedAt = nowIso()
    return row
  }

  const row = await getPrisma().subscriber.update({
    where: { id },
    data: {
      ...(input.email ? { email: input.email.trim().toLowerCase() } : {}),
      ...(input.name !== undefined ? { name: input.name?.trim() || null } : {}),
      ...(input.status ? { status: input.status } : {}),
      ...(input.categories ? { categories: input.categories } : {}),
    },
  })
  return mapRow(row)
}

export async function deleteSubscribers(ids: string[]): Promise<number> {
  if (!ids.length) return 0
  if (!isDatabaseConfigured()) {
    seed()
    const before = memory.items.length
    memory.items = memory.items.filter((s) => !ids.includes(s.id))
    return before - memory.items.length
  }
  const result = await getPrisma().subscriber.deleteMany({
    where: { id: { in: ids } },
  })
  return result.count
}

export async function countActiveSubscribers(): Promise<number> {
  if (!isDatabaseConfigured()) {
    seed()
    return memory.items.filter((s) => s.status === "active").length
  }
  return getPrisma().subscriber.count({ where: { status: "active" } })
}
