import {
  assertDatabaseForProductionWrites,
  getPrisma,
  isDatabaseConfigured,
} from "@/lib/db/prisma"
import type { AuditLogRecord, ListResult } from "./types"

const nowIso = () => new Date().toISOString()

const memory = {
  items: [] as AuditLogRecord[],
  seeded: false,
}

function seed() {
  if (memory.seeded) return
  memory.seeded = true
  const t = nowIso()
  memory.items = [
    {
      id: "aud_1",
      actorId: "usr_admin",
      actorEmail: "admin@mendanize.local",
      action: "publish",
      entityType: "article",
      entityId: "art_1",
      summary: "Published article “Getting Started with LLMs”",
      metadataJson: null,
      createdAt: t,
    },
    {
      id: "aud_2",
      actorId: "usr_editor",
      actorEmail: "editor@mendanize.local",
      action: "update_role",
      entityType: "user",
      entityId: "usr_learner",
      summary: "Changed role LEARNER → EDITOR",
      metadataJson: null,
      createdAt: t,
    },
  ]
}

export async function recordAudit(input: {
  actorId?: string | null
  actorEmail?: string | null
  action: string
  entityType: string
  entityId?: string | null
  summary: string
  metadata?: unknown
}): Promise<AuditLogRecord> {
  assertDatabaseForProductionWrites("services/admin/audit")
  const metadataJson =
    input.metadata === undefined ? null : JSON.stringify(input.metadata)

  if (!isDatabaseConfigured()) {
    seed()
    const row: AuditLogRecord = {
      id: `aud_${Date.now()}`,
      actorId: input.actorId ?? null,
      actorEmail: input.actorEmail ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      summary: input.summary,
      metadataJson,
      createdAt: nowIso(),
    }
    memory.items.unshift(row)
    return row
  }

  const row = await getPrisma().auditLog.create({
    data: {
      actorId: input.actorId ?? null,
      actorEmail: input.actorEmail ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      summary: input.summary,
      metadataJson,
    },
  })
  return {
    id: row.id,
    actorId: row.actorId,
    actorEmail: row.actorEmail,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    summary: row.summary,
    metadataJson: row.metadataJson,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function listAuditLogsAdmin(params: {
  query?: string
  entityType?: string
  page?: number
  pageSize?: number
} = {}): Promise<ListResult<AuditLogRecord>> {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 50))
  const q = params.query?.trim().toLowerCase()

  if (!isDatabaseConfigured()) {
    seed()
    let items = [...memory.items]
    if (params.entityType) {
      items = items.filter((i) => i.entityType === params.entityType)
    }
    if (q) {
      items = items.filter(
        (i) =>
          i.summary.toLowerCase().includes(q) ||
          (i.actorEmail?.toLowerCase().includes(q) ?? false) ||
          i.action.toLowerCase().includes(q)
      )
    }
    const total = items.length
    const start = (page - 1) * pageSize
    return { items: items.slice(start, start + pageSize), total, page, pageSize }
  }

  const prisma = getPrisma()
  const where: {
    entityType?: string
    OR?: Array<{
      summary?: { contains: string; mode: "insensitive" }
      actorEmail?: { contains: string; mode: "insensitive" }
      action?: { contains: string; mode: "insensitive" }
    }>
  } = {}
  if (params.entityType) where.entityType = params.entityType
  if (q) {
    where.OR = [
      { summary: { contains: q, mode: "insensitive" } },
      { actorEmail: { contains: q, mode: "insensitive" } },
      { action: { contains: q, mode: "insensitive" } },
    ]
  }

  const [total, rows] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  return {
    items: rows.map((row) => ({
      id: row.id,
      actorId: row.actorId,
      actorEmail: row.actorEmail,
      action: row.action,
      entityType: row.entityType,
      entityId: row.entityId,
      summary: row.summary,
      metadataJson: row.metadataJson,
      createdAt: row.createdAt.toISOString(),
    })),
    total,
    page,
    pageSize,
  }
}
