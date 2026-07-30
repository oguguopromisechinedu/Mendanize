import "server-only"

import type {
  OrganizationMemberRole,
  OrganizationType,
  OrganizationVerificationStatus,
} from "@prisma/client"

import {
  assertDatabaseForProductionWrites,
  getPrisma,
  isDatabaseConfigured,
} from "@/lib/db/prisma"
import { safeDbQuery } from "@/lib/db/safe-query"
import { ensureClientFlag } from "@/services/marketplace"
import { notifyStaff } from "@/services/notification"

export type OrganizationRecord = {
  id: string
  name: string
  slug: string
  type: OrganizationType
  description: string | null
  logoUrl: string | null
  website: string | null
  industry: string | null
  size: string | null
  location: string | null
  verificationStatus: OrganizationVerificationStatus
  verificationNote: string | null
  ownerPublicUserId: string
  verifiedAt: string | null
  createdAt: string
  updatedAt: string
  memberCount?: number
}

export type OrganizationMemberRecord = {
  id: string
  organizationId: string
  publicUserId: string
  role: OrganizationMemberRole
  email?: string | null
  name?: string | null
  createdAt: string
}

function db() {
  return getPrisma()
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
}

async function uniqueOrgSlug(base: string): Promise<string> {
  let slug = slugify(base) || `org-${Date.now()}`
  let n = 0
  while (await db().organization.findUnique({ where: { slug } })) {
    n += 1
    slug = `${slugify(base)}-${n}`
  }
  return slug
}

function mapOrg(row: {
  id: string
  name: string
  slug: string
  type: OrganizationType
  description: string | null
  logoUrl: string | null
  website: string | null
  industry: string | null
  size: string | null
  location: string | null
  verificationStatus: OrganizationVerificationStatus
  verificationNote: string | null
  ownerPublicUserId: string
  verifiedAt: Date | null
  createdAt: Date
  updatedAt: Date
  _count?: { members: number }
}): OrganizationRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    type: row.type,
    description: row.description,
    logoUrl: row.logoUrl,
    website: row.website,
    industry: row.industry,
    size: row.size,
    location: row.location,
    verificationStatus: row.verificationStatus,
    verificationNote: row.verificationNote,
    ownerPublicUserId: row.ownerPublicUserId,
    verifiedAt: row.verifiedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    memberCount: row._count?.members,
  }
}

export async function createOrganization(input: {
  ownerPublicUserId: string
  name: string
  type?: OrganizationType
  description?: string | null
  website?: string | null
  industry?: string | null
  size?: string | null
  location?: string | null
}): Promise<OrganizationRecord> {
  assertDatabaseForProductionWrites("services/organization")
  const name = input.name.trim()
  if (!name) throw new Error("Company name is required.")

  const { isMissingSchemaError } = await import("@/lib/db/safe-query")
  try {
    await ensureClientFlag(input.ownerPublicUserId)
    const slug = await uniqueOrgSlug(name)

    const row = await db().organization.create({
      data: {
        name,
        slug,
        type: input.type ?? "COMPANY",
        description: input.description?.trim() || null,
        website: input.website?.trim() || null,
        industry: input.industry?.trim() || null,
        size: input.size?.trim() || null,
        location: input.location?.trim() || null,
        ownerPublicUserId: input.ownerPublicUserId,
        members: {
          create: {
            publicUserId: input.ownerPublicUserId,
            role: "OWNER",
          },
        },
      },
      include: { _count: { select: { members: true } } },
    })
    return mapOrg(row)
  } catch (error) {
    if (isMissingSchemaError(error)) {
      throw new Error(
        "Organization tables are not migrated yet. Run: npx prisma migrate deploy",
      )
    }
    throw error
  }
}

export async function updateOrganization(
  organizationId: string,
  actorId: string,
  input: {
    name?: string
    type?: OrganizationType
    description?: string | null
    website?: string | null
    industry?: string | null
    size?: string | null
    location?: string | null
    logoUrl?: string | null
  },
): Promise<OrganizationRecord> {
  assertDatabaseForProductionWrites("services/organization")
  await assertCanManageOrg(organizationId, actorId)

  const row = await db().organization.update({
    where: { id: organizationId },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.description !== undefined
        ? { description: input.description?.trim() || null }
        : {}),
      ...(input.website !== undefined
        ? { website: input.website?.trim() || null }
        : {}),
      ...(input.industry !== undefined
        ? { industry: input.industry?.trim() || null }
        : {}),
      ...(input.size !== undefined ? { size: input.size?.trim() || null } : {}),
      ...(input.location !== undefined
        ? { location: input.location?.trim() || null }
        : {}),
      ...(input.logoUrl !== undefined
        ? { logoUrl: input.logoUrl?.trim() || null }
        : {}),
    },
    include: { _count: { select: { members: true } } },
  })
  return mapOrg(row)
}

export async function getOrganizationForUser(
  publicUserId: string,
): Promise<OrganizationRecord | null> {
  if (!isDatabaseConfigured()) return null
  return safeDbQuery("organization.forUser", null, async () => {
    const membership = await db().organizationMember.findFirst({
      where: { publicUserId },
      orderBy: { createdAt: "asc" },
      include: {
        organization: { include: { _count: { select: { members: true } } } },
      },
    })
    return membership ? mapOrg(membership.organization) : null
  })
}

export async function listOrganizationsForUser(
  publicUserId: string,
): Promise<OrganizationRecord[]> {
  if (!isDatabaseConfigured()) return []
  return safeDbQuery("organization.listForUser", [], async () => {
    const rows = await db().organizationMember.findMany({
      where: { publicUserId },
      include: {
        organization: { include: { _count: { select: { members: true } } } },
      },
      orderBy: { createdAt: "asc" },
    })
    return rows.map((r) => mapOrg(r.organization))
  })
}

export async function listOrganizationMembers(
  organizationId: string,
): Promise<OrganizationMemberRecord[]> {
  if (!isDatabaseConfigured()) return []
  return safeDbQuery("organization.members", [], async () => {
    const rows = await db().organizationMember.findMany({
      where: { organizationId },
      include: { publicUser: { select: { email: true, name: true } } },
      orderBy: { createdAt: "asc" },
    })
    return rows.map((r) => ({
      id: r.id,
      organizationId: r.organizationId,
      publicUserId: r.publicUserId,
      role: r.role,
      email: r.publicUser.email,
      name: r.publicUser.name,
      createdAt: r.createdAt.toISOString(),
    }))
  })
}

export async function addOrganizationMember(input: {
  organizationId: string
  actorId: string
  email: string
  role?: OrganizationMemberRole
}): Promise<OrganizationMemberRecord> {
  assertDatabaseForProductionWrites("services/organization")
  await assertCanManageOrg(input.organizationId, input.actorId)

  const { assertSeatAvailable } = await import(
    "@/services/organization-licensing"
  )
  await assertSeatAvailable(input.organizationId)

  const email = input.email.trim().toLowerCase()
  const user = await db().publicUser.findUnique({ where: { email } })
  if (!user) throw new Error("No learner account found for that email.")

  const existing = await db().organizationMember.findUnique({
    where: {
      organizationId_publicUserId: {
        organizationId: input.organizationId,
        publicUserId: user.id,
      },
    },
  })
  if (existing) {
    const role = input.role === "OWNER" ? "ADMIN" : (input.role ?? "MEMBER")
    const row = await db().organizationMember.update({
      where: { id: existing.id },
      data: { role },
      include: { publicUser: { select: { email: true, name: true } } },
    })
    return {
      id: row.id,
      organizationId: row.organizationId,
      publicUserId: row.publicUserId,
      role: row.role,
      email: row.publicUser.email,
      name: row.publicUser.name,
      createdAt: row.createdAt.toISOString(),
    }
  }

  const role = input.role === "OWNER" ? "ADMIN" : (input.role ?? "MEMBER")
  const row = await db().organizationMember.create({
    data: {
      organizationId: input.organizationId,
      publicUserId: user.id,
      role,
    },
    include: { publicUser: { select: { email: true, name: true } } },
  })

  return {
    id: row.id,
    organizationId: row.organizationId,
    publicUserId: row.publicUserId,
    role: row.role,
    email: row.publicUser.email,
    name: row.publicUser.name,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function submitOrganizationForVerification(
  organizationId: string,
  actorId: string,
): Promise<OrganizationRecord> {
  assertDatabaseForProductionWrites("services/organization")
  await assertCanManageOrg(organizationId, actorId)

  const row = await db().organization.update({
    where: { id: organizationId },
    data: {
      verificationStatus: "PENDING",
      verificationNote: null,
    },
    include: { _count: { select: { members: true } } },
  })
  await notifyStaff({
    template: "system.info",
    type: "SYSTEM",
    title: "Company verification requested",
    body: `“${row.name}” submitted a company verification request.`,
    link: "/dashboard/marketplace",
    payload: { organizationId: row.id },
  }).catch(() => 0)
  return mapOrg(row)
}

export async function listPendingOrganizationReviews(): Promise<
  OrganizationRecord[]
> {
  if (!isDatabaseConfigured()) return []
  return safeDbQuery("organization.pendingReviews", [], async () => {
    const rows = await db().organization.findMany({
      where: { verificationStatus: "PENDING" },
      orderBy: { updatedAt: "asc" },
      include: { _count: { select: { members: true } } },
    })
    return rows.map(mapOrg)
  })
}

export async function reviewOrganization(input: {
  organizationId: string
  adminId: string
  approve: boolean
  note?: string
}): Promise<OrganizationRecord> {
  assertDatabaseForProductionWrites("services/organization")
  const row = await db().organization.update({
    where: { id: input.organizationId },
    data: {
      verificationStatus: input.approve ? "VERIFIED" : "REJECTED",
      verificationNote: input.note?.trim() || null,
      reviewedByAdminId: input.adminId,
      verifiedAt: input.approve ? new Date() : null,
    },
    include: { _count: { select: { members: true } } },
  })
  return mapOrg(row)
}

export async function userCanPostForOrganization(
  organizationId: string,
  publicUserId: string,
): Promise<boolean> {
  if (!isDatabaseConfigured()) return false
  const member = await db().organizationMember.findUnique({
    where: {
      organizationId_publicUserId: { organizationId, publicUserId },
    },
  })
  return Boolean(member && (member.role === "OWNER" || member.role === "ADMIN"))
}

async function assertCanManageOrg(organizationId: string, actorId: string) {
  const member = await db().organizationMember.findUnique({
    where: {
      organizationId_publicUserId: {
        organizationId,
        publicUserId: actorId,
      },
    },
  })
  if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
    throw new Error("You do not have permission to manage this company.")
  }
}
