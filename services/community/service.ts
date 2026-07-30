/**
 * Community module service — MES-036.
 * Owns UGC models directly; reuses Search, Notification, Media, Audit, Ask AI.
 */

import "server-only"

import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma"
import { recordAudit } from "@/services/admin/audit"
import { dispatch as dispatchNotification } from "@/services/notification"
import type {
  CommunityCategoryRecord,
  CommunityHomePayload,
  CommunityModeratorRecord,
  CommunityProfileRecord,
  CommunityReportContentType,
  CommunityReportRecord,
  CommunityReportStatus,
  CommunitySearchHit,
  CommunityVisibility,
  DiscussionDetail,
  DiscussionReplyRecord,
  DiscussionSummary,
  ShowcaseProjectDetail,
  ShowcaseProjectSummary,
  StudyGroupDetail,
  StudyGroupSummary,
  TeamDetail,
  TeamProgressStatus,
  TeamSummary,
} from "./types"

export type * from "./types"

function db() {
  return getPrisma()
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
}

async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  let slug = slugify(base) || `item-${Date.now()}`
  let n = 0
  while (await exists(slug)) {
    n += 1
    slug = `${slugify(base)}-${n}`
  }
  return slug
}

function preview(text: string, max = 160): string {
  const t = text.replace(/\s+/g, " ").trim()
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`
}

const DEFAULT_CATEGORIES: Array<{
  name: string
  slug: string
  description: string
  sortOrder: number
}> = [
  {
    name: "Artificial Intelligence",
    slug: "artificial-intelligence",
    description: "AI concepts, models, and applications",
    sortOrder: 0,
  },
  {
    name: "Prompt Engineering",
    slug: "prompt-engineering",
    description: "Crafting effective prompts",
    sortOrder: 1,
  },
  {
    name: "Programming",
    slug: "programming",
    description: "Languages, patterns, and practice",
    sortOrder: 2,
  },
  {
    name: "Web Development",
    slug: "web-development",
    description: "Frontend, backend, and full-stack",
    sortOrder: 3,
  },
  {
    name: "Mobile Development",
    slug: "mobile-development",
    description: "iOS, Android, and cross-platform",
    sortOrder: 4,
  },
  {
    name: "Machine Learning",
    slug: "machine-learning",
    description: "ML models and pipelines",
    sortOrder: 5,
  },
  {
    name: "Data Science",
    slug: "data-science",
    description: "Analysis, visualization, and data work",
    sortOrder: 6,
  },
  {
    name: "UI/UX",
    slug: "ui-ux",
    description: "Design and user experience",
    sortOrder: 7,
  },
  {
    name: "Career Advice",
    slug: "career-advice",
    description: "Jobs, interviews, and growth",
    sortOrder: 8,
  },
  {
    name: "Certifications",
    slug: "certifications",
    description: "Exam prep and credentials",
    sortOrder: 9,
  },
  {
    name: "General Discussion",
    slug: "general-discussion",
    description: "Open conversation",
    sortOrder: 10,
  },
  {
    name: "Community Help",
    slug: "community-help",
    description: "Get help from fellow learners",
    sortOrder: 11,
  },
]

export async function ensureCommunityCategories(): Promise<void> {
  if (!isDatabaseConfigured()) return
  const count = await db().communityCategory.count()
  if (count > 0) return
  await db().communityCategory.createMany({
    data: DEFAULT_CATEGORIES.map((c) => ({
      name: c.name,
      slug: c.slug,
      description: c.description,
      sortOrder: c.sortOrder,
      active: true,
    })),
    skipDuplicates: true,
  })
}

export async function isCommunityModerator(
  publicUserId: string,
): Promise<boolean> {
  if (!isDatabaseConfigured()) return false
  const flag = await db().communityModeratorFlag.findUnique({
    where: { publicUserId },
  })
  return Boolean(flag?.active)
}

async function bumpReputation(publicUserId: string, delta: number) {
  if (!isDatabaseConfigured() || delta === 0) return
  await ensureCommunityProfile(publicUserId)
  await db().communityProfile.update({
    where: { publicUserId },
    data: { reputation: { increment: delta } },
  })
}

export async function ensureCommunityProfile(publicUserId: string) {
  if (!isDatabaseConfigured()) return null
  return db().communityProfile.upsert({
    where: { publicUserId },
    create: { publicUserId },
    update: {},
  })
}

function mapDiscussion(row: {
  id: string
  title: string
  body: string
  tags: string[]
  viewCount: number
  pinned: boolean
  createdAt: Date
  category: { id: string; name: string; slug: string }
  publicUser: { id: string; name: string | null; image: string | null }
  _count: { replies: number; likes: number }
}): DiscussionSummary {
  return {
    id: row.id,
    title: row.title,
    slugHint: slugify(row.title),
    bodyPreview: preview(row.body),
    tags: row.tags,
    viewCount: row.viewCount,
    replyCount: row._count.replies,
    likeCount: row._count.likes,
    pinned: row.pinned,
    category: row.category,
    author: {
      id: row.publicUser.id,
      name: row.publicUser.name,
      image: row.publicUser.image,
    },
    createdAt: row.createdAt.toISOString(),
  }
}

export async function getCommunityHome(): Promise<CommunityHomePayload> {
  if (!isDatabaseConfigured()) {
    return {
      categories: [],
      latestDiscussions: [],
      trendingDiscussions: [],
      recommendedGroups: [],
      activeTeams: [],
      featuredProjects: [],
      upcomingEvents: [],
    }
  }
  await ensureCommunityCategories()

  const [categories, latest, trending, groups, teams, projects, events] =
    await Promise.all([
      db().communityCategory.findMany({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { discussions: true } } },
      }),
      db().discussion.findMany({
        where: { hidden: false },
        orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
        take: 8,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          publicUser: { select: { id: true, name: true, image: true } },
          _count: { select: { replies: true, likes: true } },
        },
      }),
      db().discussion.findMany({
        where: { hidden: false },
        orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
        take: 6,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          publicUser: { select: { id: true, name: true, image: true } },
          _count: { select: { replies: true, likes: true } },
        },
      }),
      db().studyGroup.findMany({
        where: { archived: false, visibility: "PUBLIC" },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          owner: { select: { id: true, name: true } },
          _count: { select: { members: true } },
        },
      }),
      db().team.findMany({
        where: { visibility: "PUBLIC" },
        orderBy: { updatedAt: "desc" },
        take: 6,
        include: {
          owner: { select: { id: true, name: true } },
          _count: { select: { members: true } },
        },
      }),
      db().showcaseProject.findMany({
        where: { hidden: false, featured: true },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          publicUser: { select: { id: true, name: true } },
          team: { select: { id: true, name: true, slug: true } },
          guide: { select: { id: true, title: true, slug: true } },
          _count: { select: { likes: true, comments: true } },
        },
      }),
      db().communityEvent.findMany({
        where: {
          status: "PUBLISHED",
          endsAt: { gte: new Date() },
        },
        orderBy: { startsAt: "asc" },
        take: 6,
        include: { _count: { select: { rsvps: true } } },
      }),
    ])

  return {
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      sortOrder: c.sortOrder,
      discussionCount: c._count.discussions,
    })),
    latestDiscussions: latest.map(mapDiscussion),
    trendingDiscussions: trending.map(mapDiscussion),
    recommendedGroups: groups.map((g) => ({
      id: g.id,
      name: g.name,
      slug: g.slug,
      description: g.description,
      visibility: g.visibility,
      memberCount: g._count.members,
      owner: g.owner,
      createdAt: g.createdAt.toISOString(),
    })),
    activeTeams: teams.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      description: t.description,
      skills: t.skills,
      visibility: t.visibility,
      progressStatus: t.progressStatus,
      memberCount: t._count.members,
      owner: t.owner,
      createdAt: t.createdAt.toISOString(),
    })),
    featuredProjects: projects.map(mapProject),
    upcomingEvents: events.map((e) => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      startsAt: e.startsAt.toISOString(),
      locationType: e.locationType,
      rsvpCount: e._count.rsvps,
    })),
  }
}

function mapProject(row: {
  id: string
  title: string
  slug: string
  description: string
  technologies: string[]
  screenshotUrls: string[]
  featured: boolean
  createdAt: Date
  publicUser: { id: string; name: string | null } | null
  team: { id: string; name: string; slug: string } | null
  guide: { id: string; title: string; slug: string } | null
  _count: { likes: number; comments: number }
}): ShowcaseProjectSummary {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    descriptionPreview: preview(row.description),
    technologies: row.technologies,
    screenshotUrls: row.screenshotUrls,
    featured: row.featured,
    likeCount: row._count.likes,
    commentCount: row._count.comments,
    guide: row.guide,
    author: row.publicUser,
    team: row.team,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function listCategories(): Promise<CommunityCategoryRecord[]> {
  if (!isDatabaseConfigured()) return []
  await ensureCommunityCategories()
  const rows = await db().communityCategory.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { discussions: true } } },
  })
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    sortOrder: c.sortOrder,
    discussionCount: c._count.discussions,
  }))
}

export async function listDiscussions(input?: {
  categorySlug?: string
  sort?: "latest" | "popular" | "active"
  page?: number
  pageSize?: number
  query?: string
}): Promise<{ items: DiscussionSummary[]; total: number }> {
  if (!isDatabaseConfigured()) return { items: [], total: 0 }
  const page = Math.max(1, input?.page ?? 1)
  const pageSize = Math.min(50, Math.max(1, input?.pageSize ?? 20))
  const where = {
    hidden: false,
    ...(input?.categorySlug
      ? { category: { slug: input.categorySlug } }
      : {}),
    ...(input?.query?.trim()
      ? {
          OR: [
            { title: { contains: input.query.trim(), mode: "insensitive" as const } },
            { body: { contains: input.query.trim(), mode: "insensitive" as const } },
            { tags: { has: input.query.trim().toLowerCase() } },
          ],
        }
      : {}),
  }
  const orderBy =
    input?.sort === "popular"
      ? [{ viewCount: "desc" as const }, { createdAt: "desc" as const }]
      : input?.sort === "active"
        ? [{ updatedAt: "desc" as const }]
        : [{ pinned: "desc" as const }, { createdAt: "desc" as const }]

  const [total, rows] = await Promise.all([
    db().discussion.count({ where }),
    db().discussion.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        publicUser: { select: { id: true, name: true, image: true } },
        _count: { select: { replies: true, likes: true } },
      },
    }),
  ])
  return { items: rows.map(mapDiscussion), total }
}

export async function getDiscussion(
  id: string,
): Promise<DiscussionDetail | null> {
  if (!isDatabaseConfigured()) return null
  const row = await db().discussion.findFirst({
    where: { id, hidden: false },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      publicUser: { select: { id: true, name: true, image: true } },
      _count: { select: { replies: true, likes: true } },
      replies: {
        where: { hidden: false },
        orderBy: { createdAt: "asc" },
        include: {
          publicUser: { select: { id: true, name: true, image: true } },
        },
      },
    },
  })
  if (!row) return null
  await db().discussion.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  })
  const replies: DiscussionReplyRecord[] = row.replies.map((r) => ({
    id: r.id,
    body: r.body,
    helpful: r.helpful,
    author: {
      id: r.publicUser.id,
      name: r.publicUser.name,
      image: r.publicUser.image,
    },
    createdAt: r.createdAt.toISOString(),
  }))
  return {
    ...mapDiscussion(row),
    body: row.body,
    replies,
  }
}

export async function createDiscussion(input: {
  publicUserId: string
  categoryId: string
  title: string
  body: string
  tags?: string[]
}): Promise<DiscussionSummary> {
  if (!isDatabaseConfigured()) throw new Error("Database not configured")
  await ensureCommunityProfile(input.publicUserId)
  const row = await db().discussion.create({
    data: {
      publicUserId: input.publicUserId,
      categoryId: input.categoryId,
      title: input.title.trim(),
      body: input.body.trim(),
      tags: (input.tags ?? []).map((t) => t.trim().toLowerCase()).filter(Boolean),
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      publicUser: { select: { id: true, name: true, image: true } },
      _count: { select: { replies: true, likes: true } },
    },
  })
  return mapDiscussion(row)
}

export async function replyToDiscussion(input: {
  publicUserId: string
  discussionId: string
  body: string
}): Promise<DiscussionReplyRecord> {
  if (!isDatabaseConfigured()) throw new Error("Database not configured")
  const discussion = await db().discussion.findUnique({
    where: { id: input.discussionId },
  })
  if (!discussion || discussion.hidden) throw new Error("Discussion not found")

  const reply = await db().discussionReply.create({
    data: {
      publicUserId: input.publicUserId,
      discussionId: input.discussionId,
      body: input.body.trim(),
    },
    include: {
      publicUser: { select: { id: true, name: true, image: true } },
    },
  })

  await db().discussion.update({
    where: { id: input.discussionId },
    data: { updatedAt: new Date() },
  })

  if (discussion.publicUserId !== input.publicUserId) {
    await dispatchNotification({
      userId: discussion.publicUserId,
      channel: "in_app",
      template: "system.info",
      type: "LEARNING",
      title: "New reply on your discussion",
      body: preview(input.body, 100),
      link: `/community/discussions/${discussion.id}`,
    }).catch(() => undefined)
  }

  return {
    id: reply.id,
    body: reply.body,
    helpful: reply.helpful,
    author: {
      id: reply.publicUser.id,
      name: reply.publicUser.name,
      image: reply.publicUser.image,
    },
    createdAt: reply.createdAt.toISOString(),
  }
}

export async function likeDiscussion(input: {
  publicUserId: string
  discussionId: string
}): Promise<{ liked: boolean }> {
  if (!isDatabaseConfigured()) throw new Error("Database not configured")
  const existing = await db().discussionLike.findUnique({
    where: {
      publicUserId_discussionId: {
        publicUserId: input.publicUserId,
        discussionId: input.discussionId,
      },
    },
  })
  if (existing) {
    await db().discussionLike.delete({ where: { id: existing.id } })
    return { liked: false }
  }
  const discussion = await db().discussion.findUnique({
    where: { id: input.discussionId },
  })
  await db().discussionLike.create({
    data: {
      publicUserId: input.publicUserId,
      discussionId: input.discussionId,
    },
  })
  if (discussion && discussion.publicUserId !== input.publicUserId) {
    await bumpReputation(discussion.publicUserId, 1)
  }
  return { liked: true }
}

export async function listStudyGroups(input?: {
  page?: number
  pageSize?: number
}): Promise<{ items: StudyGroupSummary[]; total: number }> {
  if (!isDatabaseConfigured()) return { items: [], total: 0 }
  const page = Math.max(1, input?.page ?? 1)
  const pageSize = Math.min(50, input?.pageSize ?? 20)
  const where = { archived: false, visibility: "PUBLIC" as const }
  const [total, rows] = await Promise.all([
    db().studyGroup.count({ where }),
    db().studyGroup.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        owner: { select: { id: true, name: true } },
        _count: { select: { members: true } },
      },
    }),
  ])
  return {
    total,
    items: rows.map((g) => ({
      id: g.id,
      name: g.name,
      slug: g.slug,
      description: g.description,
      visibility: g.visibility,
      memberCount: g._count.members,
      owner: g.owner,
      createdAt: g.createdAt.toISOString(),
    })),
  }
}

export async function getStudyGroup(
  slug: string,
): Promise<StudyGroupDetail | null> {
  if (!isDatabaseConfigured()) return null
  const g = await db().studyGroup.findUnique({
    where: { slug },
    include: {
      owner: { select: { id: true, name: true } },
      members: {
        include: { publicUser: { select: { id: true, name: true } } },
      },
      _count: { select: { members: true } },
    },
  })
  if (!g || g.archived) return null
  return {
    id: g.id,
    name: g.name,
    slug: g.slug,
    description: g.description,
    visibility: g.visibility,
    memberCount: g._count.members,
    owner: g.owner,
    createdAt: g.createdAt.toISOString(),
    pinnedResources: g.pinnedResources,
    sharedNotes: g.sharedNotes,
    archived: g.archived,
    members: g.members.map((m) => ({
      publicUserId: m.publicUserId,
      name: m.publicUser.name,
      role: m.role,
      status: m.status,
    })),
    learningProgressPlaceholder: true,
  }
}

export async function createStudyGroup(input: {
  publicUserId: string
  name: string
  description?: string
  visibility?: CommunityVisibility
}): Promise<StudyGroupSummary> {
  if (!isDatabaseConfigured()) throw new Error("Database not configured")
  const slug = await uniqueSlug(input.name, async (s) =>
    Boolean(await db().studyGroup.findUnique({ where: { slug: s } })),
  )
  const g = await db().studyGroup.create({
    data: {
      ownerPublicUserId: input.publicUserId,
      name: input.name.trim(),
      slug,
      description: input.description?.trim() || null,
      visibility: input.visibility ?? "PUBLIC",
      members: {
        create: {
          publicUserId: input.publicUserId,
          role: "OWNER",
          status: "ACTIVE",
        },
      },
    },
    include: {
      owner: { select: { id: true, name: true } },
      _count: { select: { members: true } },
    },
  })
  return {
    id: g.id,
    name: g.name,
    slug: g.slug,
    description: g.description,
    visibility: g.visibility,
    memberCount: g._count.members,
    owner: g.owner,
    createdAt: g.createdAt.toISOString(),
  }
}

export async function joinStudyGroup(input: {
  publicUserId: string
  studyGroupId: string
}): Promise<{ status: string }> {
  if (!isDatabaseConfigured()) throw new Error("Database not configured")
  const group = await db().studyGroup.findUnique({
    where: { id: input.studyGroupId },
  })
  if (!group || group.archived) throw new Error("Group not found")
  const status = group.visibility === "PRIVATE" ? "PENDING" : "ACTIVE"
  await db().studyGroupMember.upsert({
    where: {
      publicUserId_studyGroupId: {
        publicUserId: input.publicUserId,
        studyGroupId: input.studyGroupId,
      },
    },
    create: {
      publicUserId: input.publicUserId,
      studyGroupId: input.studyGroupId,
      role: "MEMBER",
      status,
    },
    update: { status },
  })
  if (group.ownerPublicUserId !== input.publicUserId) {
    await dispatchNotification({
      userId: group.ownerPublicUserId,
      channel: "in_app",
      template: "system.info",
      type: "LEARNING",
      title:
        status === "PENDING"
          ? "Study group join request"
          : "Someone joined your study group",
      body: group.name,
      link: `/community/groups/${group.slug}`,
    }).catch(() => undefined)
  }
  return { status }
}

export async function leaveStudyGroup(input: {
  publicUserId: string
  studyGroupId: string
}): Promise<void> {
  if (!isDatabaseConfigured()) throw new Error("Database not configured")
  await db().studyGroupMember.updateMany({
    where: {
      publicUserId: input.publicUserId,
      studyGroupId: input.studyGroupId,
      role: { not: "OWNER" },
    },
    data: { status: "LEFT" },
  })
}

export async function listTeams(input?: {
  page?: number
  pageSize?: number
}): Promise<{ items: TeamSummary[]; total: number }> {
  if (!isDatabaseConfigured()) return { items: [], total: 0 }
  const page = Math.max(1, input?.page ?? 1)
  const pageSize = Math.min(50, input?.pageSize ?? 20)
  const where = { visibility: "PUBLIC" as const }
  const [total, rows] = await Promise.all([
    db().team.count({ where }),
    db().team.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        owner: { select: { id: true, name: true } },
        _count: { select: { members: true } },
      },
    }),
  ])
  return {
    total,
    items: rows.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      description: t.description,
      skills: t.skills,
      visibility: t.visibility,
      progressStatus: t.progressStatus,
      memberCount: t._count.members,
      owner: t.owner,
      createdAt: t.createdAt.toISOString(),
    })),
  }
}

export async function getTeam(slug: string): Promise<TeamDetail | null> {
  if (!isDatabaseConfigured()) return null
  const t = await db().team.findUnique({
    where: { slug },
    include: {
      owner: { select: { id: true, name: true } },
      members: {
        include: { publicUser: { select: { id: true, name: true } } },
      },
      _count: { select: { members: true } },
    },
  })
  if (!t) return null
  return {
    id: t.id,
    name: t.name,
    slug: t.slug,
    description: t.description,
    skills: t.skills,
    visibility: t.visibility,
    progressStatus: t.progressStatus,
    memberCount: t._count.members,
    owner: t.owner,
    createdAt: t.createdAt.toISOString(),
    members: t.members.map((m) => ({
      publicUserId: m.publicUserId,
      name: m.publicUser.name,
      role: m.role,
    })),
    tasksPlaceholder: true,
    filesPlaceholder: true,
  }
}

export async function createTeam(input: {
  publicUserId: string
  name: string
  description?: string
  categoryId?: string
  skills?: string[]
  visibility?: CommunityVisibility
}): Promise<TeamSummary> {
  if (!isDatabaseConfigured()) throw new Error("Database not configured")
  const slug = await uniqueSlug(input.name, async (s) =>
    Boolean(await db().team.findUnique({ where: { slug: s } })),
  )
  const t = await db().team.create({
    data: {
      ownerPublicUserId: input.publicUserId,
      name: input.name.trim(),
      slug,
      description: input.description?.trim() || null,
      categoryId: input.categoryId || null,
      skills: (input.skills ?? []).map((s) => s.trim()).filter(Boolean),
      visibility: input.visibility ?? "PUBLIC",
      members: {
        create: {
          publicUserId: input.publicUserId,
          role: "OWNER",
        },
      },
    },
    include: {
      owner: { select: { id: true, name: true } },
      _count: { select: { members: true } },
    },
  })
  return {
    id: t.id,
    name: t.name,
    slug: t.slug,
    description: t.description,
    skills: t.skills,
    visibility: t.visibility,
    progressStatus: t.progressStatus,
    memberCount: t._count.members,
    owner: t.owner,
    createdAt: t.createdAt.toISOString(),
  }
}

export async function joinTeam(input: {
  publicUserId: string
  teamId: string
}): Promise<void> {
  if (!isDatabaseConfigured()) throw new Error("Database not configured")
  const team = await db().team.findUnique({ where: { id: input.teamId } })
  if (!team) throw new Error("Team not found")
  await db().teamMember.upsert({
    where: {
      publicUserId_teamId: {
        publicUserId: input.publicUserId,
        teamId: input.teamId,
      },
    },
    create: {
      publicUserId: input.publicUserId,
      teamId: input.teamId,
      role: "MEMBER",
    },
    update: {},
  })
  if (team.ownerPublicUserId !== input.publicUserId) {
    await dispatchNotification({
      userId: team.ownerPublicUserId,
      channel: "in_app",
      template: "system.info",
      type: "LEARNING",
      title: "Someone joined your team",
      body: team.name,
      link: `/community/teams/${team.slug}`,
    }).catch(() => undefined)
  }
}

export async function updateTeamProgress(input: {
  publicUserId: string
  teamId: string
  progressStatus: TeamProgressStatus
}): Promise<void> {
  if (!isDatabaseConfigured()) throw new Error("Database not configured")
  const member = await db().teamMember.findUnique({
    where: {
      publicUserId_teamId: {
        publicUserId: input.publicUserId,
        teamId: input.teamId,
      },
    },
  })
  if (!member || (member.role !== "OWNER" && member.role !== "LEAD")) {
    throw new Error("Only Owner or Lead can update progress")
  }
  await db().team.update({
    where: { id: input.teamId },
    data: { progressStatus: input.progressStatus },
  })
}

export async function listShowcaseProjects(input?: {
  featuredOnly?: boolean
  page?: number
  pageSize?: number
}): Promise<{ items: ShowcaseProjectSummary[]; total: number }> {
  if (!isDatabaseConfigured()) return { items: [], total: 0 }
  const page = Math.max(1, input?.page ?? 1)
  const pageSize = Math.min(50, input?.pageSize ?? 20)
  const where = {
    hidden: false,
    ...(input?.featuredOnly ? { featured: true } : {}),
  }
  const [total, rows] = await Promise.all([
    db().showcaseProject.count({ where }),
    db().showcaseProject.findMany({
      where,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        publicUser: { select: { id: true, name: true } },
        team: { select: { id: true, name: true, slug: true } },
        guide: { select: { id: true, title: true, slug: true } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
  ])
  return { total, items: rows.map(mapProject) }
}

export async function listShowcaseProjectsForUser(
  publicUserId: string,
): Promise<ShowcaseProjectSummary[]> {
  if (!isDatabaseConfigured()) return []
  const rows = await db().showcaseProject.findMany({
    where: { publicUserId, hidden: false },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    include: {
      publicUser: { select: { id: true, name: true } },
      team: { select: { id: true, name: true, slug: true } },
      guide: { select: { id: true, title: true, slug: true } },
      _count: { select: { likes: true, comments: true } },
    },
  })
  return rows.map(mapProject)
}

export async function getShowcaseProject(
  slug: string,
): Promise<ShowcaseProjectDetail | null> {
  if (!isDatabaseConfigured()) return null
  const p = await db().showcaseProject.findFirst({
    where: { slug, hidden: false },
    include: {
      publicUser: { select: { id: true, name: true } },
      team: { select: { id: true, name: true, slug: true } },
      guide: { select: { id: true, title: true, slug: true } },
      _count: { select: { likes: true, comments: true } },
      comments: {
        where: { hidden: false },
        orderBy: { createdAt: "asc" },
        include: { publicUser: { select: { id: true, name: true } } },
      },
    },
  })
  if (!p) return null
  return {
    ...mapProject(p),
    description: p.description,
    demoUrl: p.demoUrl,
    repoUrl: p.repoUrl,
    comments: p.comments.map((c) => ({
      id: c.id,
      body: c.body,
      author: { id: c.publicUser.id, name: c.publicUser.name },
      createdAt: c.createdAt.toISOString(),
    })),
  }
}

export async function createShowcaseProject(input: {
  publicUserId: string
  title: string
  description: string
  technologies?: string[]
  screenshotUrls?: string[]
  guideId?: string | null
  teamId?: string | null
  demoUrl?: string | null
  repoUrl?: string | null
}): Promise<ShowcaseProjectSummary> {
  if (!isDatabaseConfigured()) throw new Error("Database not configured")
  const slug = await uniqueSlug(input.title, async (s) =>
    Boolean(await db().showcaseProject.findUnique({ where: { slug: s } })),
  )
  const p = await db().showcaseProject.create({
    data: {
      publicUserId: input.publicUserId,
      teamId: input.teamId || null,
      guideId: input.guideId || null,
      title: input.title.trim(),
      slug,
      description: input.description.trim(),
      technologies: (input.technologies ?? [])
        .map((t) => t.trim())
        .filter(Boolean),
      screenshotUrls: (input.screenshotUrls ?? []).filter(Boolean),
      demoUrl: input.demoUrl?.trim() || null,
      repoUrl: input.repoUrl?.trim() || null,
    },
    include: {
      publicUser: { select: { id: true, name: true } },
      team: { select: { id: true, name: true, slug: true } },
      guide: { select: { id: true, title: true, slug: true } },
      _count: { select: { likes: true, comments: true } },
    },
  })
  return mapProject(p)
}

export async function likeProject(input: {
  publicUserId: string
  projectId: string
}): Promise<{ liked: boolean }> {
  if (!isDatabaseConfigured()) throw new Error("Database not configured")
  const existing = await db().projectLike.findUnique({
    where: {
      publicUserId_projectId: {
        publicUserId: input.publicUserId,
        projectId: input.projectId,
      },
    },
  })
  if (existing) {
    await db().projectLike.delete({ where: { id: existing.id } })
    return { liked: false }
  }
  const project = await db().showcaseProject.findUnique({
    where: { id: input.projectId },
  })
  await db().projectLike.create({
    data: {
      publicUserId: input.publicUserId,
      projectId: input.projectId,
    },
  })
  if (project?.publicUserId && project.publicUserId !== input.publicUserId) {
    await bumpReputation(project.publicUserId, 1)
    await dispatchNotification({
      userId: project.publicUserId,
      channel: "in_app",
      template: "system.info",
      type: "LEARNING",
      title: "Someone liked your project",
      body: project.title,
      link: `/community/projects/${project.slug}`,
    }).catch(() => undefined)
  }
  return { liked: true }
}

export async function commentOnProject(input: {
  publicUserId: string
  projectId: string
  body: string
}): Promise<void> {
  if (!isDatabaseConfigured()) throw new Error("Database not configured")
  const project = await db().showcaseProject.findUnique({
    where: { id: input.projectId },
  })
  if (!project || project.hidden) throw new Error("Project not found")
  await db().projectComment.create({
    data: {
      publicUserId: input.publicUserId,
      projectId: input.projectId,
      body: input.body.trim(),
    },
  })
  if (project.publicUserId && project.publicUserId !== input.publicUserId) {
    await dispatchNotification({
      userId: project.publicUserId,
      channel: "in_app",
      template: "system.info",
      type: "LEARNING",
      title: "New feedback on your project",
      body: preview(input.body, 100),
      link: `/community/projects/${project.slug}`,
    }).catch(() => undefined)
  }
}

export async function bookmarkProject(input: {
  publicUserId: string
  projectId: string
}): Promise<{ bookmarked: boolean }> {
  if (!isDatabaseConfigured()) throw new Error("Database not configured")
  const existing = await db().projectBookmark.findUnique({
    where: {
      publicUserId_projectId: {
        publicUserId: input.publicUserId,
        projectId: input.projectId,
      },
    },
  })
  if (existing) {
    await db().projectBookmark.delete({ where: { id: existing.id } })
    return { bookmarked: false }
  }
  await db().projectBookmark.create({
    data: {
      publicUserId: input.publicUserId,
      projectId: input.projectId,
    },
  })
  return { bookmarked: true }
}

export async function getCommunityProfile(
  publicUserId: string,
): Promise<CommunityProfileRecord | null> {
  if (!isDatabaseConfigured()) return null
  const user = await db().publicUser.findUnique({
    where: { id: publicUserId },
    include: {
      communityProfile: true,
      _count: {
        select: {
          studyGroupMemberships: true,
          teamMemberships: true,
          showcaseProjects: true,
        },
      },
    },
  })
  if (!user) return null
  const profile = user.communityProfile ?? (await ensureCommunityProfile(publicUserId))
  return {
    publicUserId: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: profile?.avatarUrl ?? user.image,
    bio: profile?.bio ?? null,
    skills: profile?.skills ?? [],
    reputation: profile?.reputation ?? 0,
    certificatesPlaceholder: true,
    guidesCompletedPlaceholder: true,
    studyGroupCount: user._count.studyGroupMemberships,
    teamCount: user._count.teamMemberships,
    projectCount: user._count.showcaseProjects,
  }
}

export async function updateCommunityProfile(input: {
  publicUserId: string
  bio?: string
  skills?: string[]
  avatarUrl?: string | null
}): Promise<CommunityProfileRecord> {
  if (!isDatabaseConfigured()) throw new Error("Database not configured")
  await db().communityProfile.upsert({
    where: { publicUserId: input.publicUserId },
    create: {
      publicUserId: input.publicUserId,
      bio: input.bio?.trim() || null,
      skills: input.skills ?? [],
      avatarUrl: input.avatarUrl ?? null,
    },
    update: {
      ...(input.bio !== undefined ? { bio: input.bio.trim() || null } : {}),
      ...(input.skills !== undefined ? { skills: input.skills } : {}),
      ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
    },
  })
  const profile = await getCommunityProfile(input.publicUserId)
  if (!profile) throw new Error("Profile not found")
  return profile
}

export async function createReport(input: {
  reporterPublicUserId: string
  contentType: CommunityReportContentType
  contentId: string
  reason: string
}): Promise<void> {
  if (!isDatabaseConfigured()) throw new Error("Database not configured")
  await db().communityReport.create({
    data: {
      reporterPublicUserId: input.reporterPublicUserId,
      contentType: input.contentType,
      contentId: input.contentId,
      reason: input.reason.trim(),
    },
  })
}

export async function searchCommunity(
  query: string,
): Promise<CommunitySearchHit[]> {
  if (!isDatabaseConfigured() || !query.trim()) return []
  const q = query.trim()
  const [discussions, groups, teams, projects] = await Promise.all([
    db().discussion.findMany({
      where: {
        hidden: false,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { body: { contains: q, mode: "insensitive" } },
          { tags: { has: q.toLowerCase() } },
        ],
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    db().studyGroup.findMany({
      where: {
        archived: false,
        visibility: "PUBLIC",
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 6,
    }),
    db().team.findMany({
      where: {
        visibility: "PUBLIC",
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 6,
    }),
    db().showcaseProject.findMany({
      where: {
        hidden: false,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { technologies: { has: q } },
        ],
      },
      take: 6,
    }),
  ])

  const { searchPublishedEvents } = await import("@/services/community-events")
  const eventHits = await searchPublishedEvents(q)

  const hits: CommunitySearchHit[] = [
    ...discussions.map((d) => ({
      type: "discussion" as const,
      id: d.id,
      title: d.title,
      href: `/community/discussions/${d.id}`,
      excerpt: preview(d.body),
    })),
    ...groups.map((g) => ({
      type: "group" as const,
      id: g.id,
      title: g.name,
      href: `/community/groups/${g.slug}`,
      excerpt: g.description,
    })),
    ...teams.map((t) => ({
      type: "team" as const,
      id: t.id,
      title: t.name,
      href: `/community/teams/${t.slug}`,
      excerpt: t.description,
    })),
    ...projects.map((p) => ({
      type: "project" as const,
      id: p.id,
      title: p.title,
      href: `/community/projects/${p.slug}`,
      excerpt: preview(p.description),
    })),
    ...eventHits,
  ]
  return hits
}

// ── Admin / moderation ──────────────────────────────────────────────────────

export async function listOpenReports(): Promise<CommunityReportRecord[]> {
  if (!isDatabaseConfigured()) return []
  const rows = await db().communityReport.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      reporter: { select: { id: true, name: true, email: true } },
    },
  })
  return rows.map((r) => ({
    id: r.id,
    contentType: r.contentType,
    contentId: r.contentId,
    reason: r.reason,
    status: r.status,
    reporter: r.reporter,
    createdAt: r.createdAt.toISOString(),
    resolutionNote: r.resolutionNote,
  }))
}

export async function resolveReport(input: {
  reportId: string
  adminId: string
  adminEmail: string
  status: Exclude<CommunityReportStatus, "OPEN">
  resolutionNote?: string
  hideContent?: boolean
}): Promise<void> {
  if (!isDatabaseConfigured()) throw new Error("Database not configured")
  const report = await db().communityReport.update({
    where: { id: input.reportId },
    data: {
      status: input.status,
      resolvedByAdminId: input.adminId,
      resolutionNote: input.resolutionNote?.trim() || null,
    },
  })

  if (input.hideContent) {
    if (report.contentType === "DISCUSSION") {
      await db().discussion.update({
        where: { id: report.contentId },
        data: { hidden: true },
      })
    } else if (report.contentType === "REPLY") {
      await db().discussionReply.update({
        where: { id: report.contentId },
        data: { hidden: true },
      })
    } else if (report.contentType === "PROJECT") {
      await db().showcaseProject.update({
        where: { id: report.contentId },
        data: { hidden: true },
      })
    } else if (report.contentType === "COMMENT") {
      await db().projectComment.update({
        where: { id: report.contentId },
        data: { hidden: true },
      })
    }
  }

  await recordAudit({
    actorId: input.adminId,
    actorEmail: input.adminEmail,
    action: "community.resolve_report",
    entityType: "CommunityReport",
    entityId: report.id,
    summary: `Resolved community report as ${input.status}`,
  })
}

export async function hideContentAsModerator(input: {
  actorPublicUserId?: string
  actorAdminId?: string
  actorEmail?: string
  contentType: CommunityReportContentType
  contentId: string
}): Promise<void> {
  if (!isDatabaseConfigured()) throw new Error("Database not configured")

  if (input.actorPublicUserId) {
    const ok = await isCommunityModerator(input.actorPublicUserId)
    if (!ok) throw new Error("Not a community moderator")
  }

  if (input.contentType === "DISCUSSION") {
    await db().discussion.update({
      where: { id: input.contentId },
      data: { hidden: true },
    })
  } else if (input.contentType === "REPLY") {
    await db().discussionReply.update({
      where: { id: input.contentId },
      data: { hidden: true },
    })
  } else if (input.contentType === "PROJECT") {
    await db().showcaseProject.update({
      where: { id: input.contentId },
      data: { hidden: true },
    })
  } else if (input.contentType === "COMMENT") {
    await db().projectComment.update({
      where: { id: input.contentId },
      data: { hidden: true },
    })
  }

  if (input.actorAdminId) {
    await recordAudit({
      actorId: input.actorAdminId,
      actorEmail: input.actorEmail ?? null,
      action: "community.hide_content",
      entityType: input.contentType,
      entityId: input.contentId,
      summary: `Hid community ${input.contentType.toLowerCase()}`,
    })
  }
}

export async function pinDiscussion(input: {
  adminId: string
  adminEmail: string
  discussionId: string
  pinned: boolean
}): Promise<void> {
  if (!isDatabaseConfigured()) throw new Error("Database not configured")
  await db().discussion.update({
    where: { id: input.discussionId },
    data: { pinned: input.pinned },
  })
  await recordAudit({
    actorId: input.adminId,
    actorEmail: input.adminEmail,
    action: "community.pin_discussion",
    entityType: "Discussion",
    entityId: input.discussionId,
    summary: input.pinned ? "Pinned discussion" : "Unpinned discussion",
  })
}

export async function setProjectFeatured(input: {
  adminId: string
  adminEmail: string
  projectId: string
  featured: boolean
}): Promise<void> {
  if (!isDatabaseConfigured()) throw new Error("Database not configured")
  await db().showcaseProject.update({
    where: { id: input.projectId },
    data: { featured: input.featured },
  })
  await recordAudit({
    actorId: input.adminId,
    actorEmail: input.adminEmail,
    action: "community.feature_project",
    entityType: "ShowcaseProject",
    entityId: input.projectId,
    summary: input.featured ? "Featured project" : "Unfeatured project",
  })
}

export async function listCommunityModerators(): Promise<
  CommunityModeratorRecord[]
> {
  if (!isDatabaseConfigured()) return []
  const rows = await db().communityModeratorFlag.findMany({
    where: { active: true },
    include: {
      publicUser: { select: { id: true, name: true, email: true } },
    },
    orderBy: { grantedAt: "desc" },
  })
  return rows.map((r) => ({
    publicUserId: r.publicUserId,
    name: r.publicUser.name,
    email: r.publicUser.email,
    active: r.active,
    note: r.note,
    grantedAt: r.grantedAt.toISOString(),
    grantedByAdminId: r.grantedByAdminId,
  }))
}

export async function grantCommunityModerator(input: {
  adminId: string
  adminEmail: string
  publicUserId: string
  note?: string
}): Promise<void> {
  if (!isDatabaseConfigured()) throw new Error("Database not configured")
  await db().communityModeratorFlag.upsert({
    where: { publicUserId: input.publicUserId },
    create: {
      publicUserId: input.publicUserId,
      grantedByAdminId: input.adminId,
      note: input.note?.trim() || null,
      active: true,
    },
    update: {
      grantedByAdminId: input.adminId,
      note: input.note?.trim() || null,
      active: true,
      revokedAt: null,
      grantedAt: new Date(),
    },
  })
  await recordAudit({
    actorId: input.adminId,
    actorEmail: input.adminEmail,
    action: "community.grant_moderator",
    entityType: "CommunityModeratorFlag",
    entityId: input.publicUserId,
    summary: "Granted community moderator flag (does not grant /dashboard access)",
  })
}

export async function revokeCommunityModerator(input: {
  adminId: string
  adminEmail: string
  publicUserId: string
}): Promise<void> {
  if (!isDatabaseConfigured()) throw new Error("Database not configured")
  await db().communityModeratorFlag.update({
    where: { publicUserId: input.publicUserId },
    data: { active: false, revokedAt: new Date() },
  })
  await recordAudit({
    actorId: input.adminId,
    actorEmail: input.adminEmail,
    action: "community.revoke_moderator",
    entityType: "CommunityModeratorFlag",
    entityId: input.publicUserId,
    summary: "Revoked community moderator flag",
  })
}

export async function upsertCommunityCategory(input: {
  adminId: string
  adminEmail: string
  id?: string
  name: string
  slug?: string
  description?: string
  sortOrder?: number
  active?: boolean
}): Promise<CommunityCategoryRecord> {
  if (!isDatabaseConfigured()) throw new Error("Database not configured")
  const slug =
    input.slug?.trim() ||
    (await uniqueSlug(input.name, async (s) =>
      Boolean(await db().communityCategory.findUnique({ where: { slug: s } })),
    ))
  const row = input.id
    ? await db().communityCategory.update({
        where: { id: input.id },
        data: {
          name: input.name.trim(),
          slug,
          description: input.description?.trim() || null,
          sortOrder: input.sortOrder ?? 0,
          active: input.active ?? true,
        },
      })
    : await db().communityCategory.create({
        data: {
          name: input.name.trim(),
          slug,
          description: input.description?.trim() || null,
          sortOrder: input.sortOrder ?? 0,
          active: input.active ?? true,
        },
      })
  await recordAudit({
    actorId: input.adminId,
    actorEmail: input.adminEmail,
    action: input.id ? "community.update_category" : "community.create_category",
    entityType: "CommunityCategory",
    entityId: row.id,
    summary: `${input.id ? "Updated" : "Created"} community category ${row.name}`,
  })
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    sortOrder: row.sortOrder,
  }
}
