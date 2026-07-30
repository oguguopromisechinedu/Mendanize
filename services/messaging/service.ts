/**
 * MES-043 Learner Messaging — PublicUser DMs (not Ask AI `Message`).
 */
import "server-only"

import {
  assertDatabaseForProductionWrites,
  getPrisma,
  isDatabaseConfigured,
} from "@/lib/db/prisma"
import { recordAudit } from "@/services/admin/audit"

const RECALL_MS = 5 * 60 * 1000
const MAX_GROUP = 8

export type ThreadListItem = {
  id: string
  subject: string | null
  updatedAt: string
  muted: boolean
  unread: boolean
  lastPreview: string | null
  others: Array<{ id: string; name: string | null; email: string }>
}

export type ThreadMessageItem = {
  id: string
  body: string
  attachmentUrl: string | null
  createdAt: string
  deletedAt: string | null
  sender: { id: string; name: string | null; email: string }
  mine: boolean
  canRecall: boolean
}

function db() {
  return getPrisma()
}

export async function isEitherBlocked(a: string, b: string) {
  if (!isDatabaseConfigured()) return false
  const row = await db().userBlock.findFirst({
    where: {
      OR: [
        { blockerId: a, blockedId: b },
        { blockerId: b, blockedId: a },
      ],
    },
  })
  return Boolean(row)
}

export async function blockUser(blockerId: string, blockedId: string) {
  assertDatabaseForProductionWrites("services/messaging")
  if (blockerId === blockedId) throw new Error("Cannot block yourself")
  await db().userBlock.upsert({
    where: {
      blockerId_blockedId: { blockerId, blockedId },
    },
    create: { blockerId, blockedId },
    update: {},
  })
}

export async function unblockUser(blockerId: string, blockedId: string) {
  assertDatabaseForProductionWrites("services/messaging")
  await db().userBlock.deleteMany({
    where: { blockerId, blockedId },
  })
}

export async function listBlockedUsers(blockerId: string) {
  if (!isDatabaseConfigured()) return []
  const rows = await db().userBlock.findMany({
    where: { blockerId },
    include: {
      blocked: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  return rows.map((r) => ({
    id: r.blocked.id,
    name: r.blocked.name,
    email: r.blocked.email,
    blockedAt: r.createdAt.toISOString(),
  }))
}

async function assertParticipant(threadId: string, publicUserId: string) {
  const p = await db().messageThreadParticipant.findUnique({
    where: {
      threadId_publicUserId: { threadId, publicUserId },
    },
  })
  if (!p || p.leftAt) throw new Error("Not a participant in this thread")
  return p
}

/** Find or create a 1:1 (or small group) thread. */
export async function startOrGetThread(input: {
  initiatorId: string
  participantIds: string[]
  subject?: string | null
  jobApplicationId?: string | null
  contractId?: string | null
  initialBody?: string | null
}) {
  assertDatabaseForProductionWrites("services/messaging")
  const others = [...new Set(input.participantIds.filter((id) => id !== input.initiatorId))]
  if (!others.length) throw new Error("Pick at least one recipient")
  if (others.length + 1 > MAX_GROUP) {
    throw new Error(`Threads support at most ${MAX_GROUP} people`)
  }

  for (const oid of others) {
    if (await isEitherBlocked(input.initiatorId, oid)) {
      throw new Error("Messaging blocked between these users")
    }
    const exists = await db().publicUser.findUnique({
      where: { id: oid },
      select: { id: true },
    })
    if (!exists) throw new Error("Recipient not found")
  }

  const allIds = [input.initiatorId, ...others].sort()

  // Reuse existing 1:1 with exactly these two participants
  if (allIds.length === 2) {
    const mine = await db().messageThreadParticipant.findMany({
      where: { publicUserId: input.initiatorId, leftAt: null },
      select: { threadId: true },
    })
    for (const { threadId } of mine) {
      const parts = await db().messageThreadParticipant.findMany({
        where: { threadId, leftAt: null },
      })
      if (parts.length !== 2) continue
      const ids = parts.map((p) => p.publicUserId).sort()
      if (ids[0] === allIds[0] && ids[1] === allIds[1]) {
        if (input.initialBody?.trim()) {
          await sendThreadMessage({
            threadId,
            senderId: input.initiatorId,
            body: input.initialBody,
          })
        }
        return threadId
      }
    }
  }

  const thread = await db().messageThread.create({
    data: {
      subject: input.subject?.trim() || null,
      jobApplicationId: input.jobApplicationId ?? null,
      contractId: input.contractId ?? null,
      participants: {
        create: allIds.map((publicUserId) => ({ publicUserId })),
      },
    },
  })

  if (input.initialBody?.trim()) {
    await sendThreadMessage({
      threadId: thread.id,
      senderId: input.initiatorId,
      body: input.initialBody,
    })
  }

  return thread.id
}

export async function listThreadsForUser(
  publicUserId: string,
): Promise<ThreadListItem[]> {
  if (!isDatabaseConfigured()) return []
  const parts = await db().messageThreadParticipant.findMany({
    where: { publicUserId, leftAt: null },
    include: {
      thread: {
        include: {
          participants: {
            where: { leftAt: null },
            include: {
              publicUser: { select: { id: true, name: true, email: true } },
            },
          },
          messages: {
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { thread: { updatedAt: "desc" } },
  })

  return parts.map((p) => {
    const last = p.thread.messages[0]
    const unread =
      Boolean(last) &&
      last.senderId !== publicUserId &&
      (!p.lastReadAt || last.createdAt > p.lastReadAt)
    return {
      id: p.thread.id,
      subject: p.thread.subject,
      updatedAt: p.thread.updatedAt.toISOString(),
      muted: p.muted,
      unread,
      lastPreview: last
        ? last.body.slice(0, 120)
        : null,
      others: p.thread.participants
        .filter((x) => x.publicUserId !== publicUserId)
        .map((x) => ({
          id: x.publicUser.id,
          name: x.publicUser.name,
          email: x.publicUser.email,
        })),
    }
  })
}

export async function getThreadMessages(
  threadId: string,
  publicUserId: string,
): Promise<{
  thread: ThreadListItem
  messages: ThreadMessageItem[]
}> {
  if (!isDatabaseConfigured()) throw new Error("Database not configured")
  await assertParticipant(threadId, publicUserId)

  const [threadMeta] = await listThreadsForUser(publicUserId).then((all) =>
    all.filter((t) => t.id === threadId),
  )
  if (!threadMeta) throw new Error("Thread not found")

  const rows = await db().threadMessage.findMany({
    where: { threadId },
    include: {
      sender: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 200,
  })

  const now = Date.now()
  const messages: ThreadMessageItem[] = rows.map((m) => {
    const mine = m.senderId === publicUserId
    const canRecall =
      mine &&
      !m.deletedAt &&
      now - m.createdAt.getTime() <= RECALL_MS
    return {
      id: m.id,
      body: m.deletedAt ? "" : m.body,
      attachmentUrl: m.deletedAt ? null : m.attachmentUrl,
      createdAt: m.createdAt.toISOString(),
      deletedAt: m.deletedAt?.toISOString() ?? null,
      sender: m.sender,
      mine,
      canRecall,
    }
  })

  await db().messageThreadParticipant.update({
    where: {
      threadId_publicUserId: { threadId, publicUserId },
    },
    data: { lastReadAt: new Date() },
  })

  return { thread: threadMeta, messages }
}

export async function sendThreadMessage(input: {
  threadId: string
  senderId: string
  body: string
  attachmentUrl?: string | null
}) {
  assertDatabaseForProductionWrites("services/messaging")
  const body = input.body.trim()
  if (!body && !input.attachmentUrl?.trim()) {
    throw new Error("Message cannot be empty")
  }
  await assertParticipant(input.threadId, input.senderId)

  const peers = await db().messageThreadParticipant.findMany({
    where: { threadId: input.threadId, leftAt: null },
  })
  for (const peer of peers) {
    if (peer.publicUserId === input.senderId) continue
    if (await isEitherBlocked(input.senderId, peer.publicUserId)) {
      throw new Error("Messaging blocked between these users")
    }
  }

  const msg = await db().threadMessage.create({
    data: {
      threadId: input.threadId,
      senderId: input.senderId,
      body: body || "(attachment)",
      attachmentUrl: input.attachmentUrl?.trim() || null,
    },
  })
  await db().messageThread.update({
    where: { id: input.threadId },
    data: { updatedAt: new Date() },
  })

  // Notify unmuted peers (MES-024)
  const sender = await db().publicUser.findUnique({
    where: { id: input.senderId },
    select: { name: true, email: true },
  })
  const { dispatch } = await import("@/services/notification")
  for (const peer of peers) {
    if (peer.publicUserId === input.senderId || peer.muted) continue
    try {
      await dispatch({
        userId: peer.publicUserId,
        channel: "in_app",
        template: "system.info",
        type: "INFO",
        title: "New message",
        body: `${sender?.name ?? sender?.email ?? "Someone"}: ${body.slice(0, 100)}`,
        link: `/account/messages/${input.threadId}`,
        payload: { threadId: input.threadId },
      })
    } catch {
      // non-fatal
    }
  }

  return msg
}

export async function recallThreadMessage(
  messageId: string,
  publicUserId: string,
) {
  assertDatabaseForProductionWrites("services/messaging")
  const msg = await db().threadMessage.findUnique({ where: { id: messageId } })
  if (!msg || msg.senderId !== publicUserId) {
    throw new Error("Message not found")
  }
  if (msg.deletedAt) throw new Error("Already deleted")
  if (Date.now() - msg.createdAt.getTime() > RECALL_MS) {
    throw new Error("Recall window expired (5 minutes)")
  }
  return db().threadMessage.update({
    where: { id: messageId },
    data: { deletedAt: new Date(), body: "", attachmentUrl: null },
  })
}

export async function setThreadMuted(
  threadId: string,
  publicUserId: string,
  muted: boolean,
) {
  assertDatabaseForProductionWrites("services/messaging")
  await assertParticipant(threadId, publicUserId)
  return db().messageThreadParticipant.update({
    where: {
      threadId_publicUserId: { threadId, publicUserId },
    },
    data: { muted },
  })
}

export async function reportThreadMessage(input: {
  messageId: string
  reporterId: string
  reason: string
}) {
  assertDatabaseForProductionWrites("services/messaging")
  const reason = input.reason.trim()
  if (!reason) throw new Error("Reason required")
  const msg = await db().threadMessage.findUnique({
    where: { id: input.messageId },
  })
  if (!msg || msg.deletedAt) throw new Error("Message not found")
  await assertParticipant(msg.threadId, input.reporterId)
  return db().messageReport.create({
    data: {
      messageId: msg.id,
      threadId: msg.threadId,
      reporterPublicUserId: input.reporterId,
      reason,
    },
  })
}

export async function findPublicUserByEmail(email: string) {
  if (!isDatabaseConfigured()) return null
  return db().publicUser.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, name: true, email: true },
  })
}

export async function listOpenMessageReports() {
  if (!isDatabaseConfigured()) return []
  const rows = await db().messageReport.findMany({
    where: { status: "OPEN" },
    include: {
      reporter: { select: { id: true, name: true, email: true } },
      message: {
        select: {
          id: true,
          body: true,
          senderId: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })
  return rows.map((r) => ({
    id: r.id,
    threadId: r.threadId,
    messageId: r.messageId,
    reason: r.reason,
    createdAt: r.createdAt.toISOString(),
    reporter: r.reporter,
    messageBody: r.message.body.slice(0, 280),
    messageSenderId: r.message.senderId,
  }))
}

export async function resolveMessageReport(input: {
  reportId: string
  adminId: string
  status: "RESOLVED" | "DISMISSED"
  hideMessage?: boolean
}) {
  assertDatabaseForProductionWrites("services/messaging")
  const report = await db().messageReport.findUnique({
    where: { id: input.reportId },
  })
  if (!report) throw new Error("Report not found")
  if (input.hideMessage) {
    await db().threadMessage.update({
      where: { id: report.messageId },
      data: { deletedAt: new Date(), body: "[removed by moderation]", attachmentUrl: null },
    })
  }
  const row = await db().messageReport.update({
    where: { id: input.reportId },
    data: {
      status: input.status,
      resolvedByAdminId: input.adminId,
      resolvedAt: new Date(),
    },
  })
  await recordAudit({
    actorId: input.adminId,
    action: "resolve",
    entityType: "message_report",
    entityId: row.id,
    summary: `Message report ${input.status}${input.hideMessage ? " (hidden)" : ""}`,
  })
  return row
}
