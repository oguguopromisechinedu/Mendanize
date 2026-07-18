import type { UserRole } from "@prisma/client"

import {
  assertDatabaseForProductionWrites,
  getPrisma,
  isDatabaseConfigured,
} from "@/lib/db/prisma"
import type { ListResult, UserAdminRecord } from "./types"

const nowIso = () => new Date().toISOString()

const STAFF: UserRole[] = ["EDITOR", "ADMIN", "SUPER_ADMIN"]

const memory = {
  users: [] as UserAdminRecord[],
  seeded: false,
}

function seed() {
  if (memory.seeded) return
  memory.seeded = true
  const t = nowIso()
  memory.users = [
    {
      id: "usr_admin",
      name: "Platform Admin",
      email: "admin@mendanize.local",
      role: "SUPER_ADMIN",
      emailVerified: t,
      createdAt: t,
      updatedAt: t,
      plan: "PRO",
    },
    {
      id: "usr_editor",
      name: "Content Editor",
      email: "editor@mendanize.local",
      role: "EDITOR",
      emailVerified: t,
      createdAt: t,
      updatedAt: t,
      plan: "FREE",
    },
    {
      id: "usr_learner",
      name: "Sample Learner",
      email: "learner@mendanize.local",
      role: "LEARNER",
      emailVerified: null,
      createdAt: t,
      updatedAt: t,
      plan: "FREE",
    },
  ]
}

function mapRow(row: {
  id: string
  name: string | null
  email: string
  role: UserRole
  emailVerified: Date | null
  createdAt: Date
  updatedAt: Date
  subscription?: { plan: string } | null
}): UserAdminRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    emailVerified: row.emailVerified?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    plan: row.subscription?.plan ?? null,
  }
}

export async function listUsersAdmin(params: {
  query?: string
  role?: string
  staffOnly?: boolean
  page?: number
  pageSize?: number
} = {}): Promise<ListResult<UserAdminRecord>> {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 50))
  const q = params.query?.trim().toLowerCase()

  if (!isDatabaseConfigured()) {
    seed()
    let items = [...memory.users]
    if (params.staffOnly) items = items.filter((u) => STAFF.includes(u.role as UserRole))
    if (params.role) items = items.filter((u) => u.role === params.role)
    if (q) {
      items = items.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          (u.name?.toLowerCase().includes(q) ?? false)
      )
    }
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const total = items.length
    const start = (page - 1) * pageSize
    return { items: items.slice(start, start + pageSize), total, page, pageSize }
  }

  const prisma = getPrisma()
  const where: {
    role?: UserRole | { in: UserRole[] }
    OR?: Array<{ email?: { contains: string; mode: "insensitive" }; name?: { contains: string; mode: "insensitive" } }>
  } = {}

  if (params.role) where.role = params.role as UserRole
  else if (params.staffOnly) where.role = { in: STAFF }
  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { name: { contains: q, mode: "insensitive" } },
    ]
  }

  const [total, rows] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { subscription: { select: { plan: true } } },
    }),
  ])

  return {
    items: rows.map(mapRow),
    total,
    page,
    pageSize,
  }
}

export async function updateUserRole(
  id: string,
  role: UserRole,
  actorId?: string
): Promise<UserAdminRecord> {
  assertDatabaseForProductionWrites("services/admin/users")
  if (!STAFF.includes(role) && role !== "LEARNER" && role !== "USER") {
    throw new Error("Invalid role")
  }

  if (!isDatabaseConfigured()) {
    seed()
    const user = memory.users.find((u) => u.id === id)
    if (!user) throw new Error("User not found")
    if (user.role === "SUPER_ADMIN" && role !== "SUPER_ADMIN") {
      const supers = memory.users.filter((u) => u.role === "SUPER_ADMIN")
      if (supers.length <= 1) throw new Error("Cannot demote the last SUPER_ADMIN")
    }
    if (actorId && actorId === id && role !== "SUPER_ADMIN" && user.role === "SUPER_ADMIN") {
      throw new Error("Cannot demote yourself from SUPER_ADMIN")
    }
    user.role = role
    user.updatedAt = nowIso()
    return user
  }

  const prisma = getPrisma()
  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) throw new Error("User not found")

  if (existing.role === "SUPER_ADMIN" && role !== "SUPER_ADMIN") {
    const count = await prisma.user.count({ where: { role: "SUPER_ADMIN" } })
    if (count <= 1) throw new Error("Cannot demote the last SUPER_ADMIN")
  }
  if (actorId && actorId === id && existing.role === "SUPER_ADMIN" && role !== "SUPER_ADMIN") {
    throw new Error("Cannot demote yourself from SUPER_ADMIN")
  }

  const row = await prisma.user.update({
    where: { id },
    data: { role },
    include: { subscription: { select: { plan: true } } },
  })
  return mapRow(row)
}
