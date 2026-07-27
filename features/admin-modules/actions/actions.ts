"use server"

import { revalidatePath } from "next/cache"
import type { AdminRoleKey } from "@prisma/client"
import { z } from "zod"

import { invalidateHomepageStatistics } from "@/lib/cache/content"
import {
  advanceWorkflowItem,
  bulkUpdateCommentStatus,
  createKnowledgeArticle,
  createAdminUser,
  createNewsletterCampaign,
  createPage,
  createRedirectFromBrokenLink,
  createSubscriber,
  createTag,
  deleteComments,
  deleteKnowledgeArticles,
  deleteNewsletterCampaigns,
  deletePages,
  deleteSubscribers,
  deleteTags,
  mergeTags,
  recordAudit,
  removeAdminUser,
  runAutomationJob,
  runBrokenLinkScan,
  sendNewsletterCampaign,
  setAdminActive,
  setAdminPassword,
  setAutomationJobEnabled,
  updateBrokenLinkStatus,
  updateKnowledgeArticle,
  updateNewsletterCampaign,
  updatePage,
  updateSubscriber,
  updateTag,
  updateUserRole,
} from "@/services/admin"
import {
  acceptStaffInvitation,
  cancelStaffInvitation,
  createStaffInvitation,
  resendStaffInvitation,
} from "@/services/admin/invitations"
import type { ActionResult } from "../types/types"
import {
  automationToggleSchema,
  brokenLinkRedirectSchema,
  brokenLinkStatusSchema,
  commentStatusSchema,
  idsSchema,
  knowledgeWriteSchema,
  newsletterWriteSchema,
  pageWriteSchema,
  subscriberWriteSchema,
  tagMergeSchema,
  tagWriteSchema,
  userRoleSchema,
  adminPasswordSchema,
  adminCreateSchema,
  staffInviteSchema,
  staffInviteAcceptSchema,
  staffIdSchema,
  invitationIdSchema,
  workflowAdvanceSchema,
} from "../validators/schema"

function revalidate(...paths: string[]) {
  for (const p of paths) revalidatePath(p)
}

async function audit(
  session: { admin?: { id?: string; email?: string | null } } | null,
  action: string,
  entityType: string,
  summary: string,
  entityId?: string
) {
  try {
    await recordAudit({
      actorId: session?.admin?.id ?? null,
      actorEmail: session?.admin?.email ?? null,
      action,
      entityType,
      entityId,
      summary,
    })
  } catch {
    // audit must never block primary action
  }
}

export async function createTagAction(input: unknown): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = tagWriteSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      message: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }
  try {
    const tag = await createTag(parsed.data)
    await audit(session, "create", "tag", `Created tag “${tag.name}”`, tag.id)
    revalidate("/dashboard/tags")
    return { ok: true, message: "Tag created" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function updateTagAction(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = tagWriteSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Validation failed" }
  try {
    const tag = await updateTag(id, parsed.data)
    await audit(session, "update", "tag", `Updated tag “${tag.name}”`, id)
    revalidate("/dashboard/tags")
    return { ok: true, message: "Tag updated" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function deleteTagsAction(input: unknown): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = idsSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Select tags to delete" }
  try {
    const n = await deleteTags(parsed.data.ids)
    await audit(session, "delete", "tag", `Deleted ${n} tag(s)`)
    revalidate("/dashboard/tags")
    return { ok: true, message: `Deleted ${n} tag(s)` }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function mergeTagsAction(input: unknown): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = tagMergeSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Invalid merge" }
  try {
    const tag = await mergeTags(parsed.data.sourceId, parsed.data.targetId)
    await audit(session, "merge", "tag", `Merged into “${tag.name}”`, tag.id)
    revalidate("/dashboard/tags")
    return { ok: true, message: "Tags merged" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function updateUserRoleAction(
  input: unknown
): Promise<ActionResult> {
  const session = await requirePermission(PERMISSIONS.USERS_MANAGE)
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = userRoleSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Invalid role" }
  try {
    const user = await updateUserRole(
      parsed.data.id,
      parsed.data.role as AdminRoleKey,
      session.admin?.id
    )
    await audit(
      session,
      "update_role",
      "user",
      `Set ${user.email} → ${user.role}`,
      user.id
    )
    revalidate("/dashboard/users")
    return { ok: true, message: `Role updated to ${user.role}` }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function createAdminAction(
  input: unknown
): Promise<ActionResult> {
  const session = await requireSuperAdministrator()
  if (!session) {
    return { ok: false, message: "Only the founder can directly create staff accounts" }
  }
  const parsed = adminCreateSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check email, password (min 8 characters), and role",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    }
  }
  if (
    parsed.data.role === "SUPER_ADMINISTRATOR" &&
    session.admin?.roleKey !== "SUPER_ADMINISTRATOR"
  ) {
    return {
      ok: false,
      message: "Only a Super Administrator can create another Super Administrator",
    }
  }
  try {
    const user = await createAdminUser({
      email: parsed.data.email,
      name: parsed.data.name,
      password: parsed.data.password,
      role: parsed.data.role as AdminRoleKey,
      actorId: session.admin?.id,
    })
    await audit(
      session,
      "create",
      "user",
      `Created admin ${user.email} (${user.role})`,
      user.id
    )
    revalidate("/dashboard/users")
    return { ok: true, message: `Admin ${user.email} created` }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function inviteStaffAction(
  input: unknown
): Promise<ActionResult> {
  const session = await requireSuperAdministrator()
  if (!session?.admin?.id) {
    return { ok: false, message: "Only the founder can invite staff" }
  }
  const parsed = staffInviteSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: "Valid email and role are required" }
  }
  if (
    parsed.data.role === "SUPER_ADMINISTRATOR" &&
    session.admin.roleKey !== "SUPER_ADMINISTRATOR"
  ) {
    return {
      ok: false,
      message: "Only a Super Administrator can invite another Super Administrator",
    }
  }
  try {
    const result = await createStaffInvitation({
      email: parsed.data.email,
      name: parsed.data.name,
      role: parsed.data.role as AdminRoleKey,
      invitedByAdminId: session.admin.id,
      inviterName: session.admin.name,
      sendEmail: parsed.data.sendEmail ?? true,
    })
    await audit(
      session,
      "invite",
      "user",
      `Invited ${parsed.data.email} as ${parsed.data.role}`,
    )
    revalidate("/dashboard/users")
    const suffix = result.emailSent
      ? "Invitation email sent."
      : result.emailError
        ? `Invitation created but email failed: ${result.emailError}`
        : "Invitation created."
    return { ok: true, message: suffix }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function resendStaffInviteAction(
  input: unknown
): Promise<ActionResult> {
  const session = await requireSuperAdministrator()
  if (!session?.admin?.id) {
    return { ok: false, message: "Only the founder can resend invitations" }
  }
  const parsed = invitationIdSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Invalid invitation" }
  try {
    const result = await resendStaffInvitation({
      invitationId: parsed.data.invitationId,
      inviterName: session.admin.name,
    })
    revalidate("/dashboard/users")
    return {
      ok: true,
      message: result.emailSent
        ? "Invitation resent"
        : `Invitation updated but email failed: ${result.emailError}`,
    }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function cancelStaffInviteAction(
  input: unknown
): Promise<ActionResult> {
  const session = await requireSuperAdministrator()
  if (!session) return { ok: false, message: "Only the founder can cancel invitations" }
  const parsed = invitationIdSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Invalid invitation" }
  try {
    await cancelStaffInvitation(parsed.data.invitationId)
    revalidate("/dashboard/users")
    return { ok: true, message: "Invitation cancelled" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function setAdminActiveAction(
  input: unknown
): Promise<ActionResult> {
  const session = await requireSuperAdministrator()
  if (!session) {
    return { ok: false, message: "Only the founder can change staff status" }
  }
  const parsed = staffIdSchema
    .extend({ active: z.boolean() })
    .safeParse(input)
  if (!parsed.success) return { ok: false, message: "Invalid request" }
  try {
    const user = await setAdminActive(
      parsed.data.id,
      parsed.data.active,
      session.admin?.id,
    )
    revalidate("/dashboard/users")
    return {
      ok: true,
      message: `${user.email} is now ${parsed.data.active ? "active" : "deactivated"}`,
    }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function removeAdminUserAction(
  input: unknown
): Promise<ActionResult> {
  const session = await requireSuperAdministrator()
  if (!session) return { ok: false, message: "Only the founder can remove staff" }
  const parsed = staffIdSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Invalid user" }
  try {
    await removeAdminUser(parsed.data.id, session.admin?.id)
    revalidate("/dashboard/users")
    return { ok: true, message: "Staff member removed" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function acceptStaffInviteAction(
  input: unknown
): Promise<ActionResult> {
  const parsed = staffInviteAcceptSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: "Password must be at least 8 characters" }
  }
  try {
    await acceptStaffInvitation({
      token: parsed.data.token,
      password: parsed.data.password,
      name: parsed.data.name,
    })
    return { ok: true, message: "Account created — you can sign in now" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function setAdminPasswordAction(
  input: unknown
): Promise<ActionResult> {
  const session = await requirePermission(PERMISSIONS.USERS_MANAGE)
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = adminPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      message: "Password must be at least 8 characters",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    }
  }
  try {
    const user = await setAdminPassword(
      parsed.data.id,
      parsed.data.password,
      session.admin?.id
    )
    await audit(
      session,
      "set_password",
      "user",
      `Password set for ${user.email}`,
      user.id
    )
    revalidate("/dashboard/users")
    return { ok: true, message: `Password updated for ${user.email}` }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function createSubscriberAction(
  input: unknown
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = subscriberWriteSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Valid email required" }
  try {
    const sub = await createSubscriber(parsed.data)
    await audit(session, "create", "subscriber", `Added ${sub.email}`, sub.id)
    revalidate("/dashboard/subscribers", "/dashboard/newsletter")
    invalidateHomepageStatistics()
    return { ok: true, message: "Subscriber added" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function updateSubscriberAction(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = subscriberWriteSchema.partial().safeParse(input)
  if (!parsed.success) return { ok: false, message: "Validation failed" }
  try {
    await updateSubscriber(id, parsed.data)
    revalidate("/dashboard/subscribers")
    invalidateHomepageStatistics()
    return { ok: true, message: "Subscriber updated" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function deleteSubscribersAction(
  input: unknown
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = idsSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Select subscribers" }
  try {
    const n = await deleteSubscribers(parsed.data.ids)
    revalidate("/dashboard/subscribers")
    invalidateHomepageStatistics()
    return { ok: true, message: `Removed ${n} subscriber(s)` }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function moderateCommentsAction(
  input: unknown
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = commentStatusSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Invalid moderation" }
  try {
    const n = await bulkUpdateCommentStatus(parsed.data.ids, parsed.data.status)
    await audit(
      session,
      "moderate",
      "comment",
      `Set ${n} comment(s) to ${parsed.data.status}`
    )
    revalidate("/dashboard/comments")
    return { ok: true, message: `Updated ${n} comment(s)` }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function deleteCommentsAction(
  input: unknown
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = idsSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Select comments" }
  try {
    const n = await deleteComments(parsed.data.ids)
    revalidate("/dashboard/comments")
    return { ok: true, message: `Deleted ${n} comment(s)` }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function createPageAction(input: unknown): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = pageWriteSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Validation failed" }
  try {
    const page = await createPage(parsed.data)
    await audit(session, "create", "page", `Created page “${page.title}”`, page.id)
    revalidate("/dashboard/pages")
    return { ok: true, message: "Page created" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function updatePageAction(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = pageWriteSchema.partial().safeParse(input)
  if (!parsed.success) return { ok: false, message: "Validation failed" }
  try {
    await updatePage(id, parsed.data)
    revalidate("/dashboard/pages")
    return { ok: true, message: "Page updated" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function deletePagesAction(input: unknown): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = idsSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Select pages" }
  try {
    const n = await deletePages(parsed.data.ids)
    revalidate("/dashboard/pages")
    return { ok: true, message: `Deleted ${n} page(s)` }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function createNewsletterAction(
  input: unknown
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = newsletterWriteSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Subject required" }
  try {
    await createNewsletterCampaign(parsed.data)
    revalidate("/dashboard/newsletter")
    return { ok: true, message: "Campaign saved", data: undefined }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function updateNewsletterAction(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = newsletterWriteSchema.partial().safeParse(input)
  if (!parsed.success) return { ok: false, message: "Validation failed" }
  try {
    await updateNewsletterCampaign(id, parsed.data)
    revalidate("/dashboard/newsletter")
    return { ok: true, message: "Campaign updated" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function sendNewsletterAction(id: string): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  try {
    const campaign = await sendNewsletterCampaign(id)
    await audit(
      session,
      "send",
      "newsletter",
      `Sent “${campaign.subject}” to ${campaign.recipientCount}`,
      id
    )
    revalidate("/dashboard/newsletter", "/dashboard/activity-log")
    return {
      ok: true,
      message: `Marked sent to ${campaign.recipientCount} recipient(s)`,
    }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function deleteNewsletterAction(
  input: unknown
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = idsSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Select campaigns" }
  try {
    const n = await deleteNewsletterCampaigns(parsed.data.ids)
    revalidate("/dashboard/newsletter")
    return { ok: true, message: `Deleted ${n} campaign(s)` }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function scanBrokenLinksAction(): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  try {
    const result = await runBrokenLinkScan()
    await audit(
      session,
      "scan",
      "broken_link",
      `Checked ${result.checked}; ${result.broken} broken; ${result.recovered} recovered`
    )
    revalidate("/dashboard/broken-links", "/dashboard/activity-log")
    return {
      ok: true,
      message: `Scan complete: checked ${result.checked}, ${result.broken} broken, ${result.recovered} recovered${
        result.skipped ? `, ${result.skipped} skipped` : ""
      }`,
    }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function updateBrokenLinkStatusAction(
  input: unknown
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = brokenLinkStatusSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Invalid status" }
  try {
    const n = await updateBrokenLinkStatus(parsed.data.ids, parsed.data.status)
    revalidate("/dashboard/broken-links")
    return { ok: true, message: `Updated ${n} link(s)` }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function redirectBrokenLinkAction(
  input: unknown
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = brokenLinkRedirectSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Destination required" }
  try {
    await createRedirectFromBrokenLink(
      parsed.data.id,
      parsed.data.destination
    )
    revalidate("/dashboard/broken-links", "/dashboard/redirects")
    return { ok: true, message: "Redirect created" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function toggleAutomationAction(
  input: unknown
): Promise<ActionResult> {
  const session = await requirePermission(PERMISSIONS.SETTINGS_MANAGE)
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = automationToggleSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Invalid job" }
  try {
    await setAutomationJobEnabled(parsed.data.key, parsed.data.enabled)
    revalidate("/dashboard/automation")
    return {
      ok: true,
      message: parsed.data.enabled ? "Job enabled" : "Job disabled",
    }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function runAutomationAction(key: string): Promise<ActionResult> {
  const session = await requirePermission(PERMISSIONS.SETTINGS_MANAGE)
  if (!session) return { ok: false, message: "Unauthorized" }
  try {
    const job = await runAutomationJob(key)
    await audit(session, "run", "automation", job.lastResult ?? `Ran ${key}`, key)
    revalidate("/dashboard/automation", "/dashboard/broken-links", "/dashboard/activity-log")
    return { ok: true, message: job.lastResult ?? "Job completed" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function createKnowledgeAction(
  input: unknown
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = knowledgeWriteSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Title required" }
  try {
    await createKnowledgeArticle(parsed.data)
    revalidate("/dashboard/knowledge-base")
    return { ok: true, message: "Article created" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function updateKnowledgeAction(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = knowledgeWriteSchema.partial().safeParse(input)
  if (!parsed.success) return { ok: false, message: "Validation failed" }
  try {
    await updateKnowledgeArticle(id, parsed.data)
    revalidate("/dashboard/knowledge-base")
    return { ok: true, message: "Article updated" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function deleteKnowledgeAction(
  input: unknown
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = idsSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Select articles" }
  try {
    const n = await deleteKnowledgeArticles(parsed.data.ids)
    revalidate("/dashboard/knowledge-base")
    return { ok: true, message: `Deleted ${n} article(s)` }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function advanceWorkflowAction(
  input: unknown
): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = workflowAdvanceSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Invalid transition" }
  try {
    await advanceWorkflowItem(
      parsed.data.kind,
      parsed.data.id,
      parsed.data.status
    )
    await audit(
      session,
      "workflow",
      parsed.data.kind,
      `Moved to ${parsed.data.status}`,
      parsed.data.id
    )
    revalidate(
      "/dashboard/workflow",
      "/dashboard/articles",
      "/dashboard/guides",
      "/dashboard/ai-tools",
      "/dashboard/activity-log"
    )
    return { ok: true, message: `Moved to ${parsed.data.status}` }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}
