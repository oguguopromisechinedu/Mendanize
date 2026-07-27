import type { AdminRoleKey } from "@prisma/client"

import { staffRoleLabel } from "@/lib/admin/staff-roles"
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
      roleLabel: staffRoleLabel("SUPER_ADMINISTRATOR"),
      active: true,
      status: "ACTIVE",
      emailVerified: t,
      createdAt: t,
      updatedAt: t,
      lastLoginAt: null,
      permissions: ["users.manage", "dashboard.access"],
      plan: null,
    },
    {
      id: "adm_editor",
      name: "Content Editor",
      email: "editor@mendanize.local",
      role: "EDITOR",
      roleLabel: staffRoleLabel("EDITOR"),
      active: true,
      status: "ACTIVE",
      emailVerified: t,
      createdAt: t,
      updatedAt: t,
      lastLoginAt: null,
      permissions: ["dashboard.access", "content.manage"],
      plan: null,
    },
    {
      id: "adm_admin",
      name: "Administrator",
      email: "administrator@mendanize.local",
      role: "ADMINISTRATOR",
      roleLabel: staffRoleLabel("ADMINISTRATOR"),
      active: true,
      status: "ACTIVE",
      emailVerified: t,
      createdAt: t,
      updatedAt: t,
      lastLoginAt: null,
      permissions: ["users.manage", "dashboard.access"],
      plan: null,
    },
  ]
}

function mapRow(row: {
  id: string
  name: string | null
  email: string
  emailVerified: Date | null
  active: boolean
  lastLoginAt: Date | null
  createdAt: Date
  updatedAt: Date
  role: {
    key: AdminRoleKey
    permissions?: Array<{ permission: { key: string } }>
  }
}): UserAdminRecord {
  const permissions =
    row.role.permissions?.map((rp) => rp.permission.key) ?? []
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role.key,
    roleLabel: staffRoleLabel(row.role.key),
    active: row.active,
    status: row.active ? "ACTIVE" : "DEACTIVATED",
    emailVerified: row.emailVerified?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    lastLoginAt: row.lastLoginAt?.toISOString() ?? null,
    permissions,
    plan: null,
  }
}

function mapInvitation(row: {
  id: string
  email: string
  name: string | null
  createdAt: Date
  role: { key: AdminRoleKey; permissions?: Array<{ permission: { key: string } }> }
}): UserAdminRecord {
  const permissions =
    row.role.permissions?.map((rp) => rp.permission.key) ?? []
  const createdAt = row.createdAt.toISOString()
  return {
    id: `invite_${row.id}`,
    invitationId: row.id,
    name: row.name,
    email: row.email,
    role: row.role.key,
    roleLabel: staffRoleLabel(row.role.key),
    active: false,
    status: "INVITED",
    emailVerified: null,
    createdAt,
    updatedAt: createdAt,
    lastLoginAt: null,
    permissions,
    plan: null,
  }
}

function isAdminRoleKey(value: string): value is AdminRoleKey {
  return (ADMIN_ROLE_KEYS as string[]).includes(value)
}

export async function listUsersAdmin(
  params: {
    query?: string
    role?: string
    status?: "ACTIVE" | "INVITED" | "DEACTIVATED" | "ALL"
    staffOnly?: boolean
    page?: number
    pageSize?: number
  } = {},
): Promise<ListResult<UserAdminRecord>> {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 50))
  const q = params.query?.trim().toLowerCase()
  const statusFilter = params.status ?? "ALL"

  if (!isDatabaseConfigured()) {
    seed()
    let items = [...memory.users]
    if (params.role) items = items.filter((u) => u.role === params.role)
    if (statusFilter !== "ALL") {
      items = items.filter((u) => u.status === statusFilter)
    }
    if (q) {
      items = items.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          (u.name?.toLowerCase().includes(q) ?? false),
      )
    }
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const total = items.length
    const start = (page - 1) * pageSize
    return { items: items.slice(start, start + pageSize), total, page, pageSize }
  }

  const prisma = getPrisma()
  const roleInclude = {
    role: {
      include: {
        permissions: { include: { permission: true } },
      },
    },
  } as const

  const adminWhere: {
    role?: { key: AdminRoleKey }
    active?: boolean
    OR?: Array<{
      email?: { contains: string; mode: "insensitive" }
      name?: { contains: string; mode: "insensitive" }
    }>
  } = {}

  if (params.role && isAdminRoleKey(params.role)) {
    adminWhere.role = { key: params.role }
  }
  if (statusFilter === "ACTIVE") adminWhere.active = true
  if (statusFilter === "DEACTIVATED") adminWhere.active = false
  if (q) {
    adminWhere.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { name: { contains: q, mode: "insensitive" } },
    ]
  }

  const includeInvites = statusFilter === "ALL" || statusFilter === "INVITED"

  const [adminRows, inviteRows] = await Promise.all([
    statusFilter === "INVITED"
      ? Promise.resolve([])
      : prisma.admin.findMany({
          where: adminWhere,
          orderBy: { createdAt: "desc" },
          include: roleInclude,
        }),
    includeInvites
      ? prisma.adminInvitation.findMany({
          where: {
            acceptedAt: null,
            expiresAt: { gt: new Date() },
            ...(params.role && isAdminRoleKey(params.role)
              ? { role: { key: params.role } }
              : {}),
            ...(q
              ? {
                  OR: [
                    { email: { contains: q, mode: "insensitive" } },
                    { name: { contains: q, mode: "insensitive" } },
                  ],
                }
              : {}),
          },
          orderBy: { createdAt: "desc" },
          include: roleInclude,
        })
      : Promise.resolve([]),
  ])

  const merged = [
    ...adminRows.map(mapRow),
    ...inviteRows.map(mapInvitation),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const total = merged.length
  const start = (page - 1) * pageSize

  return {
    items: merged.slice(start, start + pageSize),
    total,
    page,
    pageSize,
  }
}

export async function updateUserRole(
  id: string,
  role: AdminRoleKey,
  actorId?: string,
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
        (u) => u.role === "SUPER_ADMINISTRATOR",
      )
      if (supers.length <= 1) {
        throw new Error("Cannot demote the last SUPER_ADMINISTRATOR")
      }
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
    user.roleLabel = staffRoleLabel(role)
    user.updatedAt = nowIso()
    return user
  }

  const prisma = getPrisma()
  const existing = await prisma.admin.findUnique({
    where: { id },
    include: {
      role: {
        include: { permissions: { include: { permission: true } } },
      },
    },
  })
  if (!existing) throw new Error("User not found")

  if (
    existing.role.key === "SUPER_ADMINISTRATOR" &&
    role !== "SUPER_ADMINISTRATOR"
  ) {
    const count = await prisma.admin.count({
      where: { role: { key: "SUPER_ADMINISTRATOR" } },
    })
    if (count <= 1) {
      throw new Error("Cannot demote the last SUPER_ADMINISTRATOR")
    }
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
    include: {
      role: {
        include: { permissions: { include: { permission: true } } },
      },
    },
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

export async function setAdminPassword(
  id: string,
  password: string,
  actorId?: string,
): Promise<UserAdminRecord> {
  assertDatabaseForProductionWrites("services/admin/users")
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters")
  }
  if (!isDatabaseConfigured()) {
    throw new Error("Database is required to set admin passwords")
  }

  const { hashPassword } = await import("@/lib/auth/password")
  const prisma = getPrisma()
  const existing = await prisma.admin.findUnique({
    where: { id },
    include: {
      role: {
        include: { permissions: { include: { permission: true } } },
      },
    },
  })
  if (!existing) throw new Error("User not found")

  const passwordHash = await hashPassword(password)
  const row = await prisma.admin.update({
    where: { id },
    data: { passwordHash },
    include: {
      role: {
        include: { permissions: { include: { permission: true } } },
      },
    },
  })

  try {
    const { logAuthorization } = await import(
      "@/features/authentication/services/audit"
    )
    await logAuthorization({
      adminId: actorId,
      action: "admin.password_set",
      entityType: "Admin",
      entityId: id,
      summary: `Password set for ${existing.email}`,
    })
  } catch {
    /* audit must not block */
  }

  return mapRow(row)
}

export async function createAdminUser(input: {
  email: string
  name?: string | null
  password: string
  role: AdminRoleKey
  actorId?: string
}): Promise<UserAdminRecord> {
  assertDatabaseForProductionWrites("services/admin/users")
  if (!isAdminRoleKey(input.role)) {
    throw new Error("Invalid role")
  }
  if (input.password.length < 8) {
    throw new Error("Password must be at least 8 characters")
  }

  const email = input.email.trim().toLowerCase()
  if (!email) throw new Error("Email is required")

  if (!isDatabaseConfigured()) {
    seed()
    if (memory.users.some((u) => u.email.toLowerCase() === email)) {
      throw new Error("An admin with this email already exists")
    }
    const t = nowIso()
    const user: UserAdminRecord = {
      id: `adm_${memory.users.length + 1}`,
      name: input.name?.trim() || null,
      email,
      role: input.role,
      roleLabel: staffRoleLabel(input.role),
      active: true,
      status: "ACTIVE",
      emailVerified: t,
      createdAt: t,
      updatedAt: t,
      lastLoginAt: null,
      permissions: [],
      plan: null,
    }
    memory.users.unshift(user)
    return user
  }

  const prisma = getPrisma()
  const existing = await prisma.admin.findUnique({ where: { email } })
  if (existing) {
    throw new Error("An admin with this email already exists")
  }

  const roleRow = await prisma.adminRole.findUnique({
    where: { key: input.role },
  })
  if (!roleRow) throw new Error(`Admin role ${input.role} is not seeded`)

  const { hashPassword } = await import("@/lib/auth/password")
  const passwordHash = await hashPassword(input.password)

  const row = await prisma.admin.create({
    data: {
      email,
      name: input.name?.trim() || null,
      roleId: roleRow.id,
      active: true,
      emailVerified: new Date(),
      passwordHash,
    },
    include: {
      role: {
        include: { permissions: { include: { permission: true } } },
      },
    },
  })

  try {
    const { logAuthorization } = await import(
      "@/features/authentication/services/audit"
    )
    await logAuthorization({
      adminId: input.actorId,
      action: "admin.create",
      entityType: "Admin",
      entityId: row.id,
      summary: `Created admin ${email} (${input.role})`,
    })
  } catch {
    /* audit must not block */
  }

  return mapRow(row)
}

export async function setAdminActive(
  id: string,
  active: boolean,
  actorId?: string,
): Promise<UserAdminRecord> {
  assertDatabaseForProductionWrites("services/admin/users")
  if (!isDatabaseConfigured()) {
    throw new Error("Database is required")
  }

  const prisma = getPrisma()
  const existing = await prisma.admin.findUnique({
    where: { id },
    include: {
      role: {
        include: { permissions: { include: { permission: true } } },
      },
    },
  })
  if (!existing) throw new Error("User not found")

  if (
    !active &&
    existing.role.key === "SUPER_ADMINISTRATOR"
  ) {
    const count = await prisma.admin.count({
      where: { role: { key: "SUPER_ADMINISTRATOR" }, active: true },
    })
    if (count <= 1) {
      throw new Error("Cannot deactivate the last active Super Administrator")
    }
  }
  if (!active && actorId === id) {
    throw new Error("You cannot deactivate your own account")
  }

  const row = await prisma.admin.update({
    where: { id },
    data: { active },
    include: {
      role: {
        include: { permissions: { include: { permission: true } } },
      },
    },
  })

  if (!active) {
    await prisma.adminSession.deleteMany({ where: { adminId: id } })
  }

  try {
    const { logAuthorization } = await import(
      "@/features/authentication/services/audit"
    )
    await logAuthorization({
      adminId: actorId,
      action: active ? "admin.activate" : "admin.deactivate",
      entityType: "Admin",
      entityId: id,
      summary: `${active ? "Activated" : "Deactivated"} ${existing.email}`,
    })
  } catch {
    /* audit must not block */
  }

  return mapRow(row)
}

export async function removeAdminUser(id: string, actorId?: string): Promise<void> {
  assertDatabaseForProductionWrites("services/admin/users")
  if (!isDatabaseConfigured()) {
    throw new Error("Database is required")
  }

  const prisma = getPrisma()
  const existing = await prisma.admin.findUnique({
    where: { id },
    include: { role: { select: { key: true } } },
  })
  if (!existing) throw new Error("User not found")

  if (existing.role.key === "SUPER_ADMINISTRATOR") {
    const count = await prisma.admin.count({
      where: { role: { key: "SUPER_ADMINISTRATOR" } },
    })
    if (count <= 1) {
      throw new Error("Cannot remove the last Super Administrator")
    }
  }
  if (actorId === id) {
    throw new Error("You cannot remove your own account")
  }

  try {
    await prisma.adminSession.deleteMany({ where: { adminId: id } })
    await prisma.admin.delete({ where: { id } })
  } catch {
    throw new Error(
      "Cannot remove this staff member because they own platform content. Deactivate the account instead.",
    )
  }

  try {
    const { logAuthorization } = await import(
      "@/features/authentication/services/audit"
    )
    await logAuthorization({
      adminId: actorId,
      action: "admin.remove",
      entityType: "Admin",
      entityId: id,
      summary: `Removed staff ${existing.email}`,
    })
  } catch {
    /* audit must not block */
  }
}
