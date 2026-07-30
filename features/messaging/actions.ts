"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import {
  requirePublicUser,
  requireEditor,
} from "@/features/authentication/server"
import {
  blockUser,
  findPublicUserByEmail,
  recallThreadMessage,
  reportThreadMessage,
  resolveMessageReport,
  sendThreadMessage,
  setThreadMuted,
  startOrGetThread,
  unblockUser,
} from "@/services/messaging"

type ActionResult<T = undefined> = {
  ok: boolean
  message: string
  data?: T
}

function revalidateMessages(threadId?: string) {
  revalidatePath("/account/messages")
  if (threadId) revalidatePath(`/account/messages/${threadId}`)
  revalidatePath("/dashboard/community/messages")
}

export async function startThreadAction(
  input: unknown,
): Promise<ActionResult<{ threadId: string }>> {
  const session = await requirePublicUser()
  if (!session?.user?.id) return { ok: false, message: "Sign in required" }
  const parsed = z
    .object({
      email: z.string().email().optional(),
      userId: z.string().min(1).optional(),
      body: z.string().max(5000).optional(),
      subject: z.string().max(200).optional(),
    })
    .safeParse(input)
  if (!parsed.success) return { ok: false, message: "Valid recipient required" }

  try {
    let recipientId = parsed.data.userId
    if (!recipientId && parsed.data.email) {
      const recipient = await findPublicUserByEmail(parsed.data.email)
      if (!recipient) return { ok: false, message: "No learner found with that email" }
      recipientId = recipient.id
    }
    if (!recipientId) return { ok: false, message: "Email or userId required" }
    if (recipientId === session.user.id) {
      return { ok: false, message: "Cannot message yourself" }
    }
    const threadId = await startOrGetThread({
      initiatorId: session.user.id,
      participantIds: [recipientId],
      subject: parsed.data.subject,
      initialBody: parsed.data.body,
    })
    revalidateMessages(threadId)
    return { ok: true, message: "Thread ready", data: { threadId } }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function sendMessageAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requirePublicUser()
  if (!session?.user?.id) return { ok: false, message: "Sign in required" }
  const parsed = z
    .object({
      threadId: z.string().min(1),
      body: z.string().max(8000),
      attachmentUrl: z.string().url().optional().nullable(),
    })
    .safeParse(input)
  if (!parsed.success) return { ok: false, message: "Message required" }
  try {
    await sendThreadMessage({
      threadId: parsed.data.threadId,
      senderId: session.user.id,
      body: parsed.data.body,
      attachmentUrl: parsed.data.attachmentUrl,
    })
    revalidateMessages(parsed.data.threadId)
    return { ok: true, message: "Sent" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function recallMessageAction(
  messageId: string,
): Promise<ActionResult> {
  const session = await requirePublicUser()
  if (!session?.user?.id) return { ok: false, message: "Sign in required" }
  try {
    const msg = await recallThreadMessage(messageId, session.user.id)
    revalidateMessages(msg.threadId)
    return { ok: true, message: "Message recalled" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function muteThreadAction(
  threadId: string,
  muted: boolean,
): Promise<ActionResult> {
  const session = await requirePublicUser()
  if (!session?.user?.id) return { ok: false, message: "Sign in required" }
  try {
    await setThreadMuted(threadId, session.user.id, muted)
    revalidateMessages(threadId)
    return { ok: true, message: muted ? "Muted" : "Unmuted" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function reportMessageAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requirePublicUser()
  if (!session?.user?.id) return { ok: false, message: "Sign in required" }
  const parsed = z
    .object({
      messageId: z.string().min(1),
      reason: z.string().min(3).max(2000),
    })
    .safeParse(input)
  if (!parsed.success) return { ok: false, message: "Reason required" }
  try {
    await reportThreadMessage({
      messageId: parsed.data.messageId,
      reporterId: session.user.id,
      reason: parsed.data.reason,
    })
    revalidatePath("/dashboard/community/messages")
    return { ok: true, message: "Report submitted for review" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function blockUserAction(email: string): Promise<ActionResult> {
  const session = await requirePublicUser()
  if (!session?.user?.id) return { ok: false, message: "Sign in required" }
  try {
    const target = await findPublicUserByEmail(email)
    if (!target) return { ok: false, message: "User not found" }
    await blockUser(session.user.id, target.id)
    revalidateMessages()
    return { ok: true, message: `Blocked ${target.email}` }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function unblockUserAction(userId: string): Promise<ActionResult> {
  const session = await requirePublicUser()
  if (!session?.user?.id) return { ok: false, message: "Sign in required" }
  try {
    await unblockUser(session.user.id, userId)
    revalidateMessages()
    return { ok: true, message: "Unblocked" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function resolveMessageReportAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = z
    .object({
      reportId: z.string().min(1),
      status: z.enum(["RESOLVED", "DISMISSED"]),
      hideMessage: z.boolean().optional(),
    })
    .safeParse(input)
  if (!parsed.success) return { ok: false, message: "Invalid" }
  try {
    await resolveMessageReport({
      reportId: parsed.data.reportId,
      adminId: session.admin.id,
      status: parsed.data.status,
      hideMessage: parsed.data.hideMessage,
    })
    revalidatePath("/dashboard/community/messages")
    revalidatePath("/dashboard/community")
    return { ok: true, message: "Report updated" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}
