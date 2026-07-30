"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import {
  requirePublicUser,
  requireSuperAdministrator,
  requireEditor,
} from "@/features/authentication/server"
import {
  executeWorkspace,
  saveWorkspaceFile,
  updateCodeExecutionSettings,
} from "@/services/code-execution"

type ActionResult<T = undefined> = {
  ok: boolean
  message: string
  data?: T
}

export async function saveWorkspaceFileAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requirePublicUser()
  if (!session?.user?.id) return { ok: false, message: "Sign in required" }
  const parsed = z
    .object({
      workspaceId: z.string().min(1),
      path: z.string().min(1).max(120),
      content: z.string().max(200_000),
    })
    .safeParse(input)
  if (!parsed.success) return { ok: false, message: "Invalid file" }
  try {
    await saveWorkspaceFile({
      publicUserId: session.user.id,
      ...parsed.data,
    })
    revalidatePath("/account/workspace")
    return { ok: true, message: "Saved" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function runWorkspaceAction(
  input: unknown,
): Promise<
  ActionResult<{
    id: string
    status: string
    stdout: string | null
    stderr: string | null
    durationMs: number | null
    errorMessage: string | null
  }>
> {
  const session = await requirePublicUser()
  if (!session?.user?.id) return { ok: false, message: "Sign in required" }
  const parsed = z
    .object({
      workspaceId: z.string().min(1),
      entryPath: z.string().optional(),
      content: z.string().max(200_000).optional(),
      path: z.string().optional(),
    })
    .safeParse(input)
  if (!parsed.success) return { ok: false, message: "Invalid run request" }
  try {
    if (parsed.data.content !== undefined && parsed.data.path) {
      await saveWorkspaceFile({
        publicUserId: session.user.id,
        workspaceId: parsed.data.workspaceId,
        path: parsed.data.path,
        content: parsed.data.content,
      })
    }
    const run = await executeWorkspace({
      publicUserId: session.user.id,
      workspaceId: parsed.data.workspaceId,
      entryPath: parsed.data.entryPath,
    })
    revalidatePath("/account/workspace")
    revalidatePath("/dashboard/code-execution")
    return {
      ok: true,
      message: run.status,
      data: {
        id: run.id,
        status: run.status,
        stdout: run.stdout,
        stderr: run.stderr,
        durationMs: run.durationMs,
        errorMessage: run.errorMessage,
      },
    }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function updateCodeExecutionSettingsAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireSuperAdministrator()
  if (!session) return { ok: false, message: "Super Administrator required" }
  const parsed = z
    .object({
      enabled: z.boolean().optional(),
      timeoutMs: z.number().int().min(500).max(30_000).optional(),
      memoryLimitBytes: z.number().int().min(1_000_000).max(64_000_000).optional(),
      freeDailyLimit: z.number().int().min(0).max(10_000).optional(),
      paidDailyLimit: z.number().int().min(0).max(50_000).optional(),
    })
    .safeParse(input)
  if (!parsed.success) return { ok: false, message: "Validation failed" }
  try {
    await updateCodeExecutionSettings(parsed.data, {
      id: session.admin.id,
      email: session.admin.email,
    })
    revalidatePath("/dashboard/code-execution")
    revalidatePath("/account/workspace")
    return { ok: true, message: "Settings saved" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function killSwitchAction(enabled: boolean): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  // Only Super Admin can flip kill switch
  const superSession = await requireSuperAdministrator()
  if (!superSession) return { ok: false, message: "Super Administrator required" }
  try {
    await updateCodeExecutionSettings(
      { enabled },
      { id: superSession.admin.id, email: superSession.admin.email },
    )
    revalidatePath("/dashboard/code-execution")
    return {
      ok: true,
      message: enabled ? "Execution enabled" : "Kill switch ON — execution disabled",
    }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}
