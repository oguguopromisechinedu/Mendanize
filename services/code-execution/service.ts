/**
 * MES-044 Coding Workspace Execution — service layer.
 */
import "server-only"

import {
  assertDatabaseForProductionWrites,
  getPrisma,
  isDatabaseConfigured,
} from "@/lib/db/prisma"
import { recordAudit } from "@/services/admin/audit"
import { getSubscriptionForUser } from "@/services/billing/service"
import { runJavascriptInSandbox } from "./sandbox"

const KEY = "main"
const DEFAULT_MAIN = `// JavaScript only (MES-044). No network or filesystem access.
console.log("Hello from the Mendanize sandbox");
const sum = [1, 2, 3].reduce((a, b) => a + b, 0);
console.log("sum =", sum);
`

export type CodeExecutionSettingRecord = {
  id: string
  enabled: boolean
  timeoutMs: number
  memoryLimitBytes: number
  maxStdoutBytes: number
  maxStderrBytes: number
  freeDailyLimit: number
  paidDailyLimit: number
  maxSourceBytes: number
  updatedAt: string
}

export type CodeWorkspaceRecord = {
  id: string
  title: string
  language: string
  files: Array<{ id: string; path: string; content: string }>
  updatedAt: string
}

export type CodeRunRecord = {
  id: string
  status: string
  stdout: string | null
  stderr: string | null
  exitCode: number | null
  durationMs: number | null
  errorMessage: string | null
  entryPath: string
  createdAt: string
  finishedAt: string | null
}

function db() {
  return getPrisma()
}

export async function getCodeExecutionSettings(): Promise<CodeExecutionSettingRecord> {
  if (!isDatabaseConfigured()) {
    return {
      id: "local",
      enabled: true,
      timeoutMs: 3000,
      memoryLimitBytes: 16 * 1024 * 1024,
      maxStdoutBytes: 64 * 1024,
      maxStderrBytes: 16 * 1024,
      freeDailyLimit: 20,
      paidDailyLimit: 200,
      maxSourceBytes: 100_000,
      updatedAt: new Date().toISOString(),
    }
  }
  let row = await db().codeExecutionSetting.findUnique({ where: { key: KEY } })
  if (!row) {
    row = await db().codeExecutionSetting.create({
      data: { key: KEY },
    })
  }
  return {
    id: row.id,
    enabled: row.enabled,
    timeoutMs: row.timeoutMs,
    memoryLimitBytes: row.memoryLimitBytes,
    maxStdoutBytes: row.maxStdoutBytes,
    maxStderrBytes: row.maxStderrBytes,
    freeDailyLimit: row.freeDailyLimit,
    paidDailyLimit: row.paidDailyLimit,
    maxSourceBytes: row.maxSourceBytes,
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function updateCodeExecutionSettings(
  input: Partial<
    Omit<CodeExecutionSettingRecord, "id" | "updatedAt">
  >,
  actor?: { id?: string | null; email?: string | null },
) {
  assertDatabaseForProductionWrites("services/code-execution")
  await getCodeExecutionSettings()
  const row = await db().codeExecutionSetting.update({
    where: { key: KEY },
    data: {
      ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
      ...(input.timeoutMs !== undefined ? { timeoutMs: input.timeoutMs } : {}),
      ...(input.memoryLimitBytes !== undefined
        ? { memoryLimitBytes: input.memoryLimitBytes }
        : {}),
      ...(input.maxStdoutBytes !== undefined
        ? { maxStdoutBytes: input.maxStdoutBytes }
        : {}),
      ...(input.maxStderrBytes !== undefined
        ? { maxStderrBytes: input.maxStderrBytes }
        : {}),
      ...(input.freeDailyLimit !== undefined
        ? { freeDailyLimit: input.freeDailyLimit }
        : {}),
      ...(input.paidDailyLimit !== undefined
        ? { paidDailyLimit: input.paidDailyLimit }
        : {}),
      ...(input.maxSourceBytes !== undefined
        ? { maxSourceBytes: input.maxSourceBytes }
        : {}),
    },
  })
  await recordAudit({
    actorId: actor?.id,
    actorEmail: actor?.email,
    action: "update",
    entityType: "code_execution_settings",
    entityId: row.id,
    summary: `Code execution ${row.enabled ? "enabled" : "DISABLED"} · timeout ${row.timeoutMs}ms`,
  })
  return getCodeExecutionSettings()
}

export async function getOrCreateDefaultWorkspace(
  publicUserId: string,
): Promise<CodeWorkspaceRecord> {
  assertDatabaseForProductionWrites("services/code-execution")
  if (!isDatabaseConfigured()) {
    return {
      id: "local",
      title: "My workspace",
      language: "javascript",
      files: [{ id: "local-main", path: "main.js", content: DEFAULT_MAIN }],
      updatedAt: new Date().toISOString(),
    }
  }
  let ws = await db().codeWorkspace.findFirst({
    where: { publicUserId },
    include: { files: { orderBy: { path: "asc" } } },
    orderBy: { updatedAt: "desc" },
  })
  if (!ws) {
    ws = await db().codeWorkspace.create({
      data: {
        publicUserId,
        title: "My workspace",
        language: "javascript",
        files: {
          create: [{ path: "main.js", content: DEFAULT_MAIN }],
        },
      },
      include: { files: true },
    })
  }
  return {
    id: ws.id,
    title: ws.title,
    language: ws.language,
    files: ws.files.map((f) => ({
      id: f.id,
      path: f.path,
      content: f.content,
    })),
    updatedAt: ws.updatedAt.toISOString(),
  }
}

export async function saveWorkspaceFile(input: {
  publicUserId: string
  workspaceId: string
  path: string
  content: string
}) {
  assertDatabaseForProductionWrites("services/code-execution")
  const ws = await db().codeWorkspace.findFirst({
    where: { id: input.workspaceId, publicUserId: input.publicUserId },
  })
  if (!ws) throw new Error("Workspace not found")
  const path = input.path.trim().replace(/^\/+/, "")
  if (!path || path.includes("..") || path.includes("\\")) {
    throw new Error("Invalid file path")
  }
  if (!path.endsWith(".js")) {
    throw new Error("Only .js files are supported in v1")
  }
  const settings = await getCodeExecutionSettings()
  if (Buffer.byteLength(input.content, "utf8") > settings.maxSourceBytes) {
    throw new Error("Source exceeds size limit")
  }
  await db().codeWorkspaceFile.upsert({
    where: {
      workspaceId_path: { workspaceId: input.workspaceId, path },
    },
    create: {
      workspaceId: input.workspaceId,
      path,
      content: input.content,
    },
    update: { content: input.content },
  })
  await db().codeWorkspace.update({
    where: { id: input.workspaceId },
    data: { updatedAt: new Date() },
  })
  return getOrCreateDefaultWorkspace(input.publicUserId)
}

async function dailyRunCount(publicUserId: string) {
  const start = new Date()
  start.setUTCHours(0, 0, 0, 0)
  return db().codeExecutionRun.count({
    where: {
      publicUserId,
      createdAt: { gte: start },
      status: { notIn: ["DISABLED", "RATE_LIMITED"] },
    },
  })
}

export async function executeWorkspace(input: {
  publicUserId: string
  workspaceId: string
  entryPath?: string
}) {
  assertDatabaseForProductionWrites("services/code-execution")
  const settings = await getCodeExecutionSettings()
  const entryPath = (input.entryPath ?? "main.js").trim()

  if (!settings.enabled) {
    const run = await db().codeExecutionRun.create({
      data: {
        publicUserId: input.publicUserId,
        workspaceId: input.workspaceId,
        entryPath,
        sourceSnapshot: "",
        status: "DISABLED",
        errorMessage: "Code execution is disabled by an administrator",
        finishedAt: new Date(),
      },
    })
    return mapRun(run)
  }

  const ws = await db().codeWorkspace.findFirst({
    where: { id: input.workspaceId, publicUserId: input.publicUserId },
    include: { files: true },
  })
  if (!ws) throw new Error("Workspace not found")

  const file = ws.files.find((f) => f.path === entryPath)
  if (!file) throw new Error(`Entry file not found: ${entryPath}`)

  const sub = await getSubscriptionForUser(input.publicUserId)
  const paid = sub.plan !== "FREE" && sub.status === "active"
  const limit = paid ? settings.paidDailyLimit : settings.freeDailyLimit
  const used = await dailyRunCount(input.publicUserId)
  if (used >= limit) {
    const run = await db().codeExecutionRun.create({
      data: {
        publicUserId: input.publicUserId,
        workspaceId: input.workspaceId,
        entryPath,
        sourceSnapshot: file.content.slice(0, 2000),
        status: "RATE_LIMITED",
        errorMessage: `Daily limit reached (${limit}). ${paid ? "" : "Upgrade for a higher limit."}`,
        finishedAt: new Date(),
      },
    })
    return mapRun(run)
  }

  const run = await db().codeExecutionRun.create({
    data: {
      publicUserId: input.publicUserId,
      workspaceId: input.workspaceId,
      language: "javascript",
      entryPath,
      sourceSnapshot: file.content,
      status: "RUNNING",
    },
  })

  const result = await runJavascriptInSandbox(file.content, {
    timeoutMs: settings.timeoutMs,
    memoryLimitBytes: settings.memoryLimitBytes,
    maxStdoutBytes: settings.maxStdoutBytes,
    maxStderrBytes: settings.maxStderrBytes,
  })

  const updated = await db().codeExecutionRun.update({
    where: { id: run.id },
    data: {
      status: result.status,
      stdout: result.stdout || null,
      stderr: result.stderr || null,
      exitCode: result.exitCode,
      durationMs: result.durationMs,
      errorMessage: result.errorMessage ?? null,
      finishedAt: new Date(),
    },
  })

  await recordAudit({
    actorId: input.publicUserId,
    action: "execute",
    entityType: "code_execution_run",
    entityId: updated.id,
    summary: `JS sandbox ${result.status} in ${result.durationMs}ms`,
    metadata: { workspaceId: input.workspaceId, entryPath },
  })

  return mapRun(updated)
}

function mapRun(row: {
  id: string
  status: string
  stdout: string | null
  stderr: string | null
  exitCode: number | null
  durationMs: number | null
  errorMessage: string | null
  entryPath: string
  createdAt: Date
  finishedAt: Date | null
}): CodeRunRecord {
  return {
    id: row.id,
    status: row.status,
    stdout: row.stdout,
    stderr: row.stderr,
    exitCode: row.exitCode,
    durationMs: row.durationMs,
    errorMessage: row.errorMessage,
    entryPath: row.entryPath,
    createdAt: row.createdAt.toISOString(),
    finishedAt: row.finishedAt?.toISOString() ?? null,
  }
}

export async function listRecentRunsForUser(
  publicUserId: string,
  take = 10,
): Promise<CodeRunRecord[]> {
  if (!isDatabaseConfigured()) return []
  const rows = await db().codeExecutionRun.findMany({
    where: { publicUserId },
    orderBy: { createdAt: "desc" },
    take,
  })
  return rows.map(mapRun)
}

export async function getCodeExecutionUsageAdmin(take = 50) {
  if (!isDatabaseConfigured()) {
    return { settings: await getCodeExecutionSettings(), runs: [], todayCount: 0 }
  }
  const start = new Date()
  start.setUTCHours(0, 0, 0, 0)
  const [settings, runs, todayCount] = await Promise.all([
    getCodeExecutionSettings(),
    db().codeExecutionRun.findMany({
      orderBy: { createdAt: "desc" },
      take,
      include: {
        publicUser: { select: { id: true, email: true, name: true } },
      },
    }),
    db().codeExecutionRun.count({
      where: {
        createdAt: { gte: start },
        status: { notIn: ["DISABLED", "RATE_LIMITED"] },
      },
    }),
  ])
  return {
    settings,
    todayCount,
    runs: runs.map((r) => ({
      ...mapRun(r),
      userEmail: r.publicUser.email,
      userName: r.publicUser.name,
    })),
  }
}
