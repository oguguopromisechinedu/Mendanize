import {
  assertDatabaseForProductionWrites,
  getPrisma,
  isDatabaseConfigured,
} from "@/lib/db/prisma"
import { runBrokenLinkScan } from "./broken-links"
import type { AutomationJobRecord, ListResult } from "./types"

const nowIso = () => new Date().toISOString()

const DEFAULT_JOBS: Omit<
  AutomationJobRecord,
  "id" | "createdAt" | "updatedAt" | "lastRunAt" | "lastResult" | "status"
>[] = [
  {
    key: "broken_link_scan",
    name: "Broken link scan",
    description: "Scan published content for outbound links and flag likely failures.",
    enabled: true,
    schedule: "Daily",
  },
  {
    key: "sitemap_regen",
    name: "Sitemap regeneration",
    description: "Rebuild public sitemap entries from published content.",
    enabled: true,
    schedule: "Hourly",
  },
  {
    key: "analytics_rollup",
    name: "Analytics rollup",
    description: "Aggregate raw analytics events into daily summaries.",
    enabled: true,
    schedule: "Daily",
  },
]

const memory = {
  jobs: [] as AutomationJobRecord[],
  seeded: false,
}

function seed() {
  if (memory.seeded) return
  memory.seeded = true
  const t = nowIso()
  memory.jobs = DEFAULT_JOBS.map((j, i) => ({
    id: `job_${i + 1}`,
    ...j,
    status: "IDLE" as const,
    lastRunAt: null,
    lastResult: null,
    createdAt: t,
    updatedAt: t,
  }))
}

function mapRow(row: {
  id: string
  key: string
  name: string
  description: string | null
  enabled: boolean
  schedule: string | null
  status: AutomationJobRecord["status"]
  lastRunAt: Date | null
  lastResult: string | null
  createdAt: Date
  updatedAt: Date
}): AutomationJobRecord {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description,
    enabled: row.enabled,
    schedule: row.schedule,
    status: row.status,
    lastRunAt: row.lastRunAt?.toISOString() ?? null,
    lastResult: row.lastResult,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

async function ensureJobs() {
  if (!isDatabaseConfigured()) {
    seed()
    return
  }
  const prisma = getPrisma()
  for (const job of DEFAULT_JOBS) {
    await prisma.automationJob.upsert({
      where: { key: job.key },
      create: {
        key: job.key,
        name: job.name,
        description: job.description,
        enabled: job.enabled,
        schedule: job.schedule,
      },
      update: {
        name: job.name,
        description: job.description,
        schedule: job.schedule,
      },
    })
  }
}

export async function listAutomationJobs(): Promise<ListResult<AutomationJobRecord>> {
  await ensureJobs()

  if (!isDatabaseConfigured()) {
    seed()
    return {
      items: [...memory.jobs],
      total: memory.jobs.length,
      page: 1,
      pageSize: memory.jobs.length,
    }
  }

  const rows = await getPrisma().automationJob.findMany({
    orderBy: { name: "asc" },
  })
  return {
    items: rows.map(mapRow),
    total: rows.length,
    page: 1,
    pageSize: rows.length,
  }
}

export async function setAutomationJobEnabled(
  key: string,
  enabled: boolean
): Promise<AutomationJobRecord> {
  await ensureJobs()

  if (!isDatabaseConfigured()) {
    seed()
    const job = memory.jobs.find((j) => j.key === key)
    if (!job) throw new Error("Job not found")
    job.enabled = enabled
    job.status = enabled ? "IDLE" : "DISABLED"
    job.updatedAt = nowIso()
    return job
  }

  const row = await getPrisma().automationJob.update({
    where: { key },
    data: {
      enabled,
      status: enabled ? "IDLE" : "DISABLED",
    },
  })
  return mapRow(row)
}

export async function runAutomationJob(key: string): Promise<AutomationJobRecord> {
  assertDatabaseForProductionWrites("services/admin/automation")
  await ensureJobs()

  let message = "Completed"
  try {
    if (key === "broken_link_scan") {
      const result = await runBrokenLinkScan()
      message = `Checked ${result.checked} link(s); ${result.broken} broken, ${result.recovered} recovered`
    } else if (key === "sitemap_regen") {
      const { regenerateSitemap } = await import("@/services/seo")
      const result = await regenerateSitemap()
      message = `Sitemap regenerated: ${result.urlCount} URLs across ${result.includedTypes} type(s)`
    } else if (key === "analytics_rollup") {
      const { rollupAnalyticsFromEvents } = await import("@/services/analytics")
      const result = await rollupAnalyticsFromEvents()
      message = `Rolled up ${result.events} events (${result.pageViews} page views, ${result.searches} searches)`
    } else {
      message = "Unknown job executed as no-op"
    }
  } catch (error) {
    message = error instanceof Error ? error.message : "Job failed"
    if (!isDatabaseConfigured()) {
      seed()
      const job = memory.jobs.find((j) => j.key === key)
      if (!job) throw new Error("Job not found")
      job.status = "FAILED"
      job.lastRunAt = nowIso()
      job.lastResult = message
      job.updatedAt = nowIso()
      return job
    }
    const row = await getPrisma().automationJob.update({
      where: { key },
      data: {
        status: "FAILED",
        lastRunAt: new Date(),
        lastResult: message,
      },
    })
    await getPrisma().automationRun.create({
      data: { jobKey: key, status: "FAILED", message, finishedAt: new Date() },
    })
    return mapRow(row)
  }

  if (!isDatabaseConfigured()) {
    seed()
    const job = memory.jobs.find((j) => j.key === key)
    if (!job) throw new Error("Job not found")
    job.status = "IDLE"
    job.lastRunAt = nowIso()
    job.lastResult = message
    job.updatedAt = nowIso()
    return job
  }

  const prisma = getPrisma()
  await prisma.automationRun.create({
    data: { jobKey: key, status: "SUCCESS", message, finishedAt: new Date() },
  })
  const row = await prisma.automationJob.update({
    where: { key },
    data: {
      status: "IDLE",
      lastRunAt: new Date(),
      lastResult: message,
    },
  })
  return mapRow(row)
}
