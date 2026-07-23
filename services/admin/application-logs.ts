/**
 * MES-032 — application log persistence + listing.
 */
import "server-only"

import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma"

export async function persistApplicationLog(input: {
  level: string
  message: string
  module?: string
  requestId?: string
  stack?: string
  context?: Record<string, unknown>
}) {
  if (!isDatabaseConfigured()) return
  try {
    await getPrisma().applicationLog.create({
      data: {
        level: input.level,
        message: input.message.slice(0, 2000),
        module: input.module ?? null,
        requestId: input.requestId ?? null,
        stack: input.stack?.slice(0, 8000) ?? null,
        contextJson: input.context
          ? JSON.stringify(input.context).slice(0, 8000)
          : null,
      },
    })
  } catch {
    /* never throw from logging */
  }
}

export async function listApplicationLogs(limit = 100) {
  if (!isDatabaseConfigured()) return []
  return getPrisma().applicationLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

/** Retention: app logs 30d, audit logs 1y (MES-032). */
export async function pruneLogsPerRetention() {
  if (!isDatabaseConfigured()) return { app: 0, audit: 0 }
  const prisma = getPrisma()
  const appCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const auditCutoff = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
  const [app, audit] = await Promise.all([
    prisma.applicationLog.deleteMany({ where: { createdAt: { lt: appCutoff } } }),
    prisma.auditLog.deleteMany({ where: { createdAt: { lt: auditCutoff } } }),
  ])
  return { app: app.count, audit: audit.count }
}
