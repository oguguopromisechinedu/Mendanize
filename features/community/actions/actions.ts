"use server"

import { revalidatePath } from "next/cache"
import {
  getPublicSession,
  requireEditor,
} from "@/features/authentication/server"
import {
  bookmarkProject,
  commentOnProject,
  createDiscussion,
  createReport,
  createShowcaseProject,
  createStudyGroup,
  createTeam,
  grantCommunityModerator,
  hideContentAsModerator,
  isCommunityModerator,
  joinStudyGroup,
  joinTeam,
  leaveStudyGroup,
  likeDiscussion,
  likeProject,
  pinDiscussion,
  replyToDiscussion,
  resolveReport,
  revokeCommunityModerator,
  setProjectFeatured,
  updateCommunityProfile,
  updateTeamProgress,
  upsertCommunityCategory,
  type CommunityReportContentType,
  type CommunityReportStatus,
  type CommunityVisibility,
  type TeamProgressStatus,
} from "@/services/community"

function unauthorized() {
  return { ok: false as const, message: "Sign in as a learner to continue." }
}

async function requireLearner() {
  const session = await getPublicSession()
  if (!session?.user?.id) return null
  return session
}

export async function createDiscussionAction(input: {
  categoryId: string
  title: string
  body: string
  tags?: string
}) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  if (!input.title.trim() || !input.body.trim()) {
    return { ok: false as const, message: "Title and body are required." }
  }
  try {
    const discussion = await createDiscussion({
      publicUserId: session.user.id,
      categoryId: input.categoryId,
      title: input.title,
      body: input.body,
      tags: input.tags
        ? input.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    })
    revalidatePath("/community")
    return { ok: true as const, id: discussion.id }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Could not create discussion",
    }
  }
}

export async function replyToDiscussionAction(input: {
  discussionId: string
  body: string
}) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  if (!input.body.trim()) {
    return { ok: false as const, message: "Reply cannot be empty." }
  }
  try {
    await replyToDiscussion({
      publicUserId: session.user.id,
      discussionId: input.discussionId,
      body: input.body,
    })
    revalidatePath(`/community/discussions/${input.discussionId}`)
    return { ok: true as const }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Could not reply",
    }
  }
}

export async function likeDiscussionAction(discussionId: string) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  try {
    const result = await likeDiscussion({
      publicUserId: session.user.id,
      discussionId,
    })
    revalidatePath(`/community/discussions/${discussionId}`)
    return { ok: true as const, ...result }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Could not like",
    }
  }
}

export async function createStudyGroupAction(input: {
  name: string
  description?: string
  visibility?: CommunityVisibility
}) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  if (!input.name.trim()) {
    return { ok: false as const, message: "Name is required." }
  }
  try {
    const group = await createStudyGroup({
      publicUserId: session.user.id,
      name: input.name,
      description: input.description,
      visibility: input.visibility,
    })
    revalidatePath("/community/groups")
    return { ok: true as const, slug: group.slug }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Could not create group",
    }
  }
}

export async function joinStudyGroupAction(studyGroupId: string) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  try {
    const result = await joinStudyGroup({
      publicUserId: session.user.id,
      studyGroupId,
    })
    revalidatePath("/community/groups")
    return { ok: true as const, ...result }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Could not join",
    }
  }
}

export async function leaveStudyGroupAction(studyGroupId: string) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  try {
    await leaveStudyGroup({
      publicUserId: session.user.id,
      studyGroupId,
    })
    revalidatePath("/community/groups")
    return { ok: true as const }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Could not leave",
    }
  }
}

export async function createTeamAction(input: {
  name: string
  description?: string
  skills?: string
  visibility?: CommunityVisibility
}) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  if (!input.name.trim()) {
    return { ok: false as const, message: "Name is required." }
  }
  try {
    const team = await createTeam({
      publicUserId: session.user.id,
      name: input.name,
      description: input.description,
      skills: input.skills
        ? input.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      visibility: input.visibility,
    })
    revalidatePath("/community/teams")
    return { ok: true as const, slug: team.slug }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Could not create team",
    }
  }
}

export async function joinTeamAction(teamId: string) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  try {
    await joinTeam({ publicUserId: session.user.id, teamId })
    revalidatePath("/community/teams")
    return { ok: true as const }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Could not join team",
    }
  }
}

export async function updateTeamProgressAction(input: {
  teamId: string
  progressStatus: TeamProgressStatus
}) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  try {
    await updateTeamProgress({
      publicUserId: session.user.id,
      teamId: input.teamId,
      progressStatus: input.progressStatus,
    })
    revalidatePath("/community/teams")
    return { ok: true as const }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Could not update progress",
    }
  }
}

export async function createProjectAction(input: {
  title: string
  description: string
  technologies?: string
  screenshotUrls?: string
  guideId?: string
  demoUrl?: string
  repoUrl?: string
}) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  if (!input.title.trim() || !input.description.trim()) {
    return { ok: false as const, message: "Title and description are required." }
  }
  try {
    const project = await createShowcaseProject({
      publicUserId: session.user.id,
      title: input.title,
      description: input.description,
      technologies: input.technologies
        ? input.technologies.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      screenshotUrls: input.screenshotUrls
        ? input.screenshotUrls.split(",").map((u) => u.trim()).filter(Boolean)
        : [],
      guideId: input.guideId || null,
      demoUrl: input.demoUrl || null,
      repoUrl: input.repoUrl || null,
    })
    revalidatePath("/community/projects")
    return { ok: true as const, slug: project.slug }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Could not create project",
    }
  }
}

export async function likeProjectAction(projectId: string) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  try {
    const result = await likeProject({
      publicUserId: session.user.id,
      projectId,
    })
    revalidatePath("/community/projects")
    return { ok: true as const, ...result }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Could not like",
    }
  }
}

export async function commentOnProjectAction(input: {
  projectId: string
  body: string
}) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  if (!input.body.trim()) {
    return { ok: false as const, message: "Comment cannot be empty." }
  }
  try {
    await commentOnProject({
      publicUserId: session.user.id,
      projectId: input.projectId,
      body: input.body,
    })
    revalidatePath("/community/projects")
    return { ok: true as const }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Could not comment",
    }
  }
}

export async function bookmarkProjectAction(projectId: string) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  try {
    const result = await bookmarkProject({
      publicUserId: session.user.id,
      projectId,
    })
    return { ok: true as const, ...result }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Could not bookmark",
    }
  }
}

export async function updateProfileAction(input: {
  bio?: string
  skills?: string
  avatarUrl?: string
}) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  try {
    await updateCommunityProfile({
      publicUserId: session.user.id,
      bio: input.bio,
      skills: input.skills
        ? input.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined,
      avatarUrl: input.avatarUrl,
    })
    revalidatePath("/community/profile")
    revalidatePath("/account/community")
    return { ok: true as const }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Could not update profile",
    }
  }
}

export async function reportContentAction(input: {
  contentType: CommunityReportContentType
  contentId: string
  reason: string
}) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  if (!input.reason.trim()) {
    return { ok: false as const, message: "Reason is required." }
  }
  try {
    await createReport({
      reporterPublicUserId: session.user.id,
      contentType: input.contentType,
      contentId: input.contentId,
      reason: input.reason,
    })
    return { ok: true as const }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Could not report",
    }
  }
}

export async function hideAsCommunityModeratorAction(input: {
  contentType: CommunityReportContentType
  contentId: string
}) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  const mod = await isCommunityModerator(session.user.id)
  if (!mod) {
    return {
      ok: false as const,
      message: "Community moderator flag required (does not grant dashboard access).",
    }
  }
  try {
    await hideContentAsModerator({
      actorPublicUserId: session.user.id,
      contentType: input.contentType,
      contentId: input.contentId,
    })
    revalidatePath("/community")
    return { ok: true as const }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Could not hide content",
    }
  }
}

// ── Admin actions (Admin session only — never PublicUser) ───────────────────

export async function resolveReportAction(input: {
  reportId: string
  status: Exclude<CommunityReportStatus, "OPEN">
  resolutionNote?: string
  hideContent?: boolean
}) {
  const admin = await requireEditor()
  if (!admin) return { ok: false as const, message: "Admin required" }
  try {
    await resolveReport({
      reportId: input.reportId,
      adminId: admin.admin.id,
      adminEmail: admin.admin.email,
      status: input.status,
      resolutionNote: input.resolutionNote,
      hideContent: input.hideContent,
    })
    revalidatePath("/dashboard/community")
    return { ok: true as const }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Could not resolve",
    }
  }
}

export async function pinDiscussionAction(input: {
  discussionId: string
  pinned: boolean
}) {
  const admin = await requireEditor()
  if (!admin) return { ok: false as const, message: "Admin required" }
  try {
    await pinDiscussion({
      adminId: admin.admin.id,
      adminEmail: admin.admin.email,
      discussionId: input.discussionId,
      pinned: input.pinned,
    })
    revalidatePath("/dashboard/community")
    return { ok: true as const }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Could not pin",
    }
  }
}

export async function featureProjectAction(input: {
  projectId: string
  featured: boolean
}) {
  const admin = await requireEditor()
  if (!admin) return { ok: false as const, message: "Admin required" }
  try {
    await setProjectFeatured({
      adminId: admin.admin.id,
      adminEmail: admin.admin.email,
      projectId: input.projectId,
      featured: input.featured,
    })
    revalidatePath("/dashboard/community")
    return { ok: true as const }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Could not feature",
    }
  }
}

export async function grantModeratorAction(input: {
  publicUserId: string
  note?: string
}) {
  const admin = await requireEditor()
  if (!admin) return { ok: false as const, message: "Admin required" }
  try {
    await grantCommunityModerator({
      adminId: admin.admin.id,
      adminEmail: admin.admin.email,
      publicUserId: input.publicUserId,
      note: input.note,
    })
    revalidatePath("/dashboard/community")
    return { ok: true as const }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Could not grant",
    }
  }
}

export async function revokeModeratorAction(publicUserId: string) {
  const admin = await requireEditor()
  if (!admin) return { ok: false as const, message: "Admin required" }
  try {
    await revokeCommunityModerator({
      adminId: admin.admin.id,
      adminEmail: admin.admin.email,
      publicUserId,
    })
    revalidatePath("/dashboard/community")
    return { ok: true as const }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Could not revoke",
    }
  }
}

export async function upsertCategoryAction(input: {
  id?: string
  name: string
  slug?: string
  description?: string
  sortOrder?: number
  active?: boolean
}) {
  const admin = await requireEditor()
  if (!admin) return { ok: false as const, message: "Admin required" }
  try {
    const cat = await upsertCommunityCategory({
      adminId: admin.admin.id,
      adminEmail: admin.admin.email,
      ...input,
    })
    revalidatePath("/dashboard/community")
    revalidatePath("/community")
    return { ok: true as const, category: cat }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Could not save category",
    }
  }
}

export async function hideContentAdminAction(input: {
  contentType: CommunityReportContentType
  contentId: string
}) {
  const admin = await requireEditor()
  if (!admin) return { ok: false as const, message: "Admin required" }
  try {
    await hideContentAsModerator({
      actorAdminId: admin.admin.id,
      actorEmail: admin.admin.email,
      contentType: input.contentType,
      contentId: input.contentId,
    })
    revalidatePath("/dashboard/community")
    revalidatePath("/community")
    return { ok: true as const }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Could not hide",
    }
  }
}
