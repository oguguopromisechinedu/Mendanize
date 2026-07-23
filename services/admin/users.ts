import type { AdminRoleKey } from "@prisma/client"

import {
  assertDatabaseForProductionWrites,
  getPrisma,
  isDatabaseConfigured,
} from "@/lib/db/prisma"
import type { ListResult, UserAdminRecord } from "./types"

const nowIso = () => new Date().toISOString()

const ADMIN_ROLE_KEYS: AdminRoleKey[] = [
  "SUPER_ADMINISTRATOR",
  "ADMINISTRATOR",
  "EDITOR",
  "CONTENT_MANAGER",
  "ANALYTICS_MANAGER",
  "SUPPORT_MANAGER",
]

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
      id: "adm_super",
      name: "Platform Admin",
      email: "admin@mendanize.local",
      role: "SUPER_ADMINISTRATOR",
      emailVerified: t,
      createdAt: t,
      updatedAt: t,
      plan: null,
    },
    {
      id: "adm_editor",
      name: "Content Editor",
      email: "editor@mendanize.local",
      role: "EDITOR",
      emailVerified: t,
      createdAt: t,
      updatedAt: t,
      plan: null,
    },
    {
      id: "adm_admin",
      name: "Administrator",
      email: "administrator@mendanize.local",
      role: "ADMINISTRATOR",
      emailVerified: t,
      createdAt: t,
      updatedAt: t,
      plan: null,
    },
  ]
}

function mapRow(row: {
  id: string
  name: string | null
  email: string
  emailVerified: Date | null
  createdAt: Date
  updatedAt: Date
  role: { key: AdminRoleKey }
}): UserAdminRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role.key,
    emailVerified: row.emailVerified?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    plan: null,
  }
}

function isAdminRoleKey(value: string): value is AdminRoleKey {
  return (ADMIN_ROLE_KEYS as string[]).includes(value)
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
    role?: { key: AdminRoleKey | { in: AdminRoleKey[] } }
    OR?: Array<{
      email?: { contains: string; mode: "insensitive" }
      name?: { contains: string; mode: "insensitive" }
    }>
  } = {}

  if (params.role && isAdminRoleKey(params.role)) {
    where.role = { key: params.role }
  } else if (params.staffOnly) {
    where.role = { key: { in: [...ADMIN_ROLE_KEYS] } }
  }
  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { name: { contains: q, mode: "insensitive" } },
    ]
  }

  const [total, rows] = await Promise.all([
    prisma.admin.count({ where }),
    prisma.admin.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { role: { select: { key: true } } },
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
  role: AdminRoleKey,
  actorId?: string
): Promise<UserAdminRecord> {
  assertDatabaseForProductionWrites("services/admin/users")
  if (!isAdminRoleKey(role)) {
    throw new Error("Invalid role")
  }

  if (!isDatabaseConfigured()) {
    seed()
    const user = memory.users.find((u) => u.id === id)
    if (!user) throw new Error("User not found")
    if (
      user.role === "SUPER_ADMINISTRATOR" &&
      role !== "SUPER_ADMINISTRATOR"
    ) {
      const supers = memory.users.filter(
        (u) => u.role === "SUPER_ADMINISTRATOR"
      )
      if (supers.length <= 1)
        throw new Error("Cannot demote the last SUPER_ADMINISTRATOR")
    }
    if (
      actorId &&
      actorId === id &&
      role !== "SUPER_ADMINISTRATOR" &&
      user.role === "SUPER_ADMINISTRATOR"
    ) {
      throw new Error("Cannot demote yourself from SUPER_ADMINISTRATOR")
    }
    user.role = role
    user.updatedAt = nowIso()
    return user
  }

  const prisma = getPrisma()
  const existing = await prisma.admin.findUnique({
    where: { id },
    include: { role: { select: { key: true } } },
  })
  if (!existing) throw new Error("User not found")

  if (
    existing.role.key === "SUPER_ADMINISTRATOR" &&
    role !== "SUPER_ADMINISTRATOR"
  ) {
    const count = await prisma.admin.count({
      where: { role: { key: "SUPER_ADMINISTRATOR" } },
    })
    if (count <= 1)
      throw new Error("Cannot demote the last SUPER_ADMINISTRATOR")
  }
  if (
    actorId &&
    actorId === id &&
    existing.role.key === "SUPER_ADMINISTRATOR" &&
    role !== "SUPER_ADMINISTRATOR"
  ) {
    throw new Error("Cannot demote yourself from SUPER_ADMINISTRATOR")
  }

  const nextRole = await prisma.adminRole.findUnique({ where: { key: role } })
  if (!nextRole) throw new Error(`Admin role ${role} is not seeded`)

  const row = await prisma.admin.update({
    where: { id },
    data: { roleId: nextRole.id },
    include: { role: { select: { key: true } } },
  })

  try {
    const { logAuthorization } = await import(
      "@/features/authentication/services/audit"
    )
    await logAuthorization({
      adminId: actorId,
      action: "admin.role_update",
      entityType: "Admin",
      entityId: id,
      summary: `Role changed to ${role}`,
    })
  } catch {
    /* audit must not block */
  }

  return mapRow(row)
}
