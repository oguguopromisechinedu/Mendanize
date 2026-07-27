import "server-only"

import { randomBytes } from "crypto"
import type { AdminRoleKey } from "@prisma/client"

import { staffRoleLabel } from "@/lib/admin/staff-roles"
import {
  assertDatabaseForProductionWrites,
  getPrisma,
  isDatabaseConfigured,
} from "@/lib/db/prisma"
import { isEmailConfigured, sendEmail } from "@/lib/email/send"

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000

function db() {
  return getPrisma()
}

function inviteUrl(token: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  return `${base}/dashboard/accept-invite?token=${encodeURIComponent(token)}`
}

function newToken() {
  return randomBytes(32).toString("hex")
}

export async function sendStaffInvitationEmail(input: {
  email: string
  name?: string | null
  role: AdminRoleKey
  token: string
  inviterName?: string | null
}) {
  const link = inviteUrl(input.token)
  const roleLabel = staffRoleLabel(input.role)
  const greeting = input.name?.trim() || "there"

  const text = [
    `Hi ${greeting},`,
    "",
    `${input.inviterName ?? "A Mendanize founder"} invited you to join the Mendanize staff dashboard as ${roleLabel}.`,
    "",
    `Accept your invitation and set your password: ${link}`,
    "",
    "This link expires in 7 days. Staff accounts sign in at /dashboard/login.",
    "",
    "If you did not expect this email, you can ignore it.",
  ].join("\n")

  const html = `
    <p>Hi ${greeting},</p>
    <p><strong>${input.inviterName ?? "A Mendanize founder"}</strong> invited you to join the Mendanize staff dashboard as <strong>${roleLabel}</strong>.</p>
    <p><a href="${link}">Accept invitation and set your password</a></p>
    <p style="color:#666;font-size:13px;">This link expires in 7 days. Staff sign in at /dashboard/login.</p>
  `

  const configured = await isEmailConfigured()
  if (!configured) {
    console.warn("[staff-invite] Email not configured — invitation link:", link)
    return { ok: false as const, error: "Email is not configured", link }
  }

  const result = await sendEmail({
    to: input.email,
    subject: `You're invited to Mendanize (${roleLabel})`,
    text,
    html,
  })

  return result.ok
    ? { ok: true as const, link }
    : { ok: false as const, error: result.error ?? "Send failed", link }
}

export async function createStaffInvitation(input: {
  email: string
  name?: string | null
  role: AdminRoleKey
  invitedByAdminId: string
  inviterName?: string | null
  sendEmail?: boolean
}) {
  assertDatabaseForProductionWrites("services/admin/invitations")
  if (!isDatabaseConfigured()) {
    throw new Error("Database is required to invite staff")
  }

  const email = input.email.trim().toLowerCase()
  if (!email) throw new Error("Email is required")

  const existingAdmin = await db().admin.findUnique({ where: { email } })
  if (existingAdmin) {
    throw new Error("A staff account with this email already exists")
  }

  const pending = await db().adminInvitation.findFirst({
    where: { email, acceptedAt: null, expiresAt: { gt: new Date() } },
  })
  if (pending) {
    throw new Error("A pending invitation already exists for this email")
  }

  const roleRow = await db().adminRole.findUnique({ where: { key: input.role } })
  if (!roleRow) throw new Error(`Role ${input.role} is not seeded`)

  const token = newToken()
  const invitation = await db().adminInvitation.create({
    data: {
      email,
      name: input.name?.trim() || null,
      roleId: roleRow.id,
      token,
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
      invitedByAdminId: input.invitedByAdminId,
    },
    include: {
      role: { select: { key: true } },
    },
  })

  let emailSent = false
  let emailError: string | undefined
  if (input.sendEmail !== false) {
    const mail = await sendStaffInvitationEmail({
      email,
      name: input.name,
      role: invitation.role.key,
      token,
      inviterName: input.inviterName,
    })
    emailSent = mail.ok
    emailError = mail.ok ? undefined : mail.error
  }

  return { invitation, emailSent, emailError, inviteLink: inviteUrl(token) }
}

export async function resendStaffInvitation(input: {
  invitationId: string
  inviterName?: string | null
}) {
  if (!isDatabaseConfigured()) {
    throw new Error("Database is required")
  }

  const invitation = await db().adminInvitation.findUnique({
    where: { id: input.invitationId },
    include: { role: { select: { key: true } } },
  })
  if (!invitation || invitation.acceptedAt) {
    throw new Error("Invitation not found or already accepted")
  }

  const token = newToken()
  const updated = await db().adminInvitation.update({
    where: { id: invitation.id },
    data: {
      token,
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
    },
    include: { role: { select: { key: true } } },
  })

  const mail = await sendStaffInvitationEmail({
    email: updated.email,
    name: updated.name,
    role: updated.role.key,
    token,
    inviterName: input.inviterName,
  })

  return {
    invitation: updated,
    emailSent: mail.ok,
    emailError: mail.ok ? undefined : mail.error,
    inviteLink: inviteUrl(token),
  }
}

export async function getInvitationByToken(token: string) {
  if (!isDatabaseConfigured()) return null
  const row = await db().adminInvitation.findUnique({
    where: { token },
    include: {
      role: {
        include: {
          permissions: { include: { permission: true } },
        },
      },
    },
  })
  if (!row || row.acceptedAt || row.expiresAt < new Date()) return null
  return row
}

export async function acceptStaffInvitation(input: {
  token: string
  password: string
  name?: string | null
}) {
  assertDatabaseForProductionWrites("services/admin/invitations")
  if (!isDatabaseConfigured()) {
    throw new Error("Database is required")
  }
  if (input.password.length < 8) {
    throw new Error("Password must be at least 8 characters")
  }

  const invitation = await getInvitationByToken(input.token)
  if (!invitation) throw new Error("Invitation is invalid or expired")

  const existing = await db().admin.findUnique({
    where: { email: invitation.email },
  })
  if (existing) throw new Error("An account with this email already exists")

  const { hashPassword } = await import("@/lib/auth/password")
  const passwordHash = await hashPassword(input.password)

  const admin = await db().admin.create({
    data: {
      email: invitation.email,
      name: input.name?.trim() || invitation.name,
      roleId: invitation.roleId,
      active: true,
      emailVerified: new Date(),
      passwordHash,
    },
  })

  await db().adminInvitation.update({
    where: { id: invitation.id },
    data: { acceptedAt: new Date(), adminId: admin.id },
  })

  return admin
}

export async function cancelStaffInvitation(invitationId: string) {
  if (!isDatabaseConfigured()) return
  await db().adminInvitation.delete({
    where: { id: invitationId },
  })
}

export async function listAdminRolesWithPermissions() {
  if (!isDatabaseConfigured()) return []
  const rows = await db().adminRole.findMany({
    orderBy: { name: "asc" },
    include: {
      permissions: { include: { permission: true } },
    },
  })
  return rows.map((role) => ({
    key: role.key,
    name: role.name,
    description: role.description,
    label: staffRoleLabel(role.key),
    permissions: role.permissions.map((rp) => ({
      key: rp.permission.key,
      name: rp.permission.name,
    })),
  }))
}
