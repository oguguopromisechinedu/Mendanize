/** Community Shared Service types — MES-036 */

export type CommunityVisibility = "PUBLIC" | "PRIVATE"
export type TeamMemberRole = "OWNER" | "LEAD" | "MEMBER"
export type StudyGroupMemberRole = "OWNER" | "MODERATOR" | "MEMBER"
export type TeamProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE"
export type CommunityReportStatus = "OPEN" | "RESOLVED" | "DISMISSED"
export type CommunityReportContentType =
  | "DISCUSSION"
  | "REPLY"
  | "PROJECT"
  | "COMMENT"

export type CommunityCategoryRecord = {
  id: string
  name: string
  slug: string
  description: string | null
  sortOrder: number
  discussionCount?: number
}

export type DiscussionSummary = {
  id: string
  title: string
  slugHint: string
  bodyPreview: string
  tags: string[]
  viewCount: number
  replyCount: number
  likeCount: number
  pinned: boolean
  category: { id: string; name: string; slug: string }
  author: { id: string; name: string | null; image: string | null }
  createdAt: string
}

export type DiscussionDetail = DiscussionSummary & {
  body: string
  replies: DiscussionReplyRecord[]
}

export type DiscussionReplyRecord = {
  id: string
  body: string
  helpful: boolean
  author: { id: string; name: string | null; image: string | null }
  createdAt: string
}

export type StudyGroupSummary = {
  id: string
  name: string
  slug: string
  description: string | null
  visibility: CommunityVisibility
  memberCount: number
  owner: { id: string; name: string | null }
  createdAt: string
}

export type StudyGroupDetail = StudyGroupSummary & {
  pinnedResources: string[]
  sharedNotes: string | null
  archived: boolean
  members: Array<{
    publicUserId: string
    name: string | null
    role: StudyGroupMemberRole
    status: string
  }>
  /** Placeholder — real progress tracking deferred */
  learningProgressPlaceholder: true
}

export type TeamSummary = {
  id: string
  name: string
  slug: string
  description: string | null
  skills: string[]
  visibility: CommunityVisibility
  progressStatus: TeamProgressStatus
  memberCount: number
  owner: { id: string; name: string | null }
  createdAt: string
}

export type TeamDetail = TeamSummary & {
  members: Array<{
    publicUserId: string
    name: string | null
    role: TeamMemberRole
  }>
  /** Tasks / Files are placeholders per MES-036 */
  tasksPlaceholder: true
  filesPlaceholder: true
}

export type ShowcaseProjectSummary = {
  id: string
  title: string
  slug: string
  descriptionPreview: string
  technologies: string[]
  screenshotUrls: string[]
  featured: boolean
  likeCount: number
  commentCount: number
  guide: { id: string; title: string; slug: string } | null
  author: { id: string; name: string | null } | null
  team: { id: string; name: string; slug: string } | null
  createdAt: string
}

export type ShowcaseProjectDetail = ShowcaseProjectSummary & {
  description: string
  demoUrl: string | null
  repoUrl: string | null
  comments: Array<{
    id: string
    body: string
    author: { id: string; name: string | null }
    createdAt: string
  }>
}

export type CommunityProfileRecord = {
  publicUserId: string
  name: string | null
  email: string
  avatarUrl: string | null
  bio: string | null
  skills: string[]
  reputation: number
  certificatesPlaceholder: true
  guidesCompletedPlaceholder: true
  studyGroupCount: number
  teamCount: number
  projectCount: number
}

export type CommunityReportRecord = {
  id: string
  contentType: CommunityReportContentType
  contentId: string
  reason: string
  status: CommunityReportStatus
  reporter: { id: string; name: string | null; email: string }
  createdAt: string
  resolutionNote: string | null
}

export type CommunityModeratorRecord = {
  publicUserId: string
  name: string | null
  email: string
  active: boolean
  note: string | null
  grantedAt: string
  grantedByAdminId: string
}

export type CommunitySearchHit = {
  type: "discussion" | "group" | "team" | "project" | "tag" | "event"
  id: string
  title: string
  href: string
  excerpt?: string | null
}

export type CommunityEventHomeItem = {
  id: string
  title: string
  slug: string
  startsAt: string
  locationType: string
  rsvpCount: number
}

export type CommunityHomePayload = {
  categories: CommunityCategoryRecord[]
  latestDiscussions: DiscussionSummary[]
  trendingDiscussions: DiscussionSummary[]
  recommendedGroups: StudyGroupSummary[]
  activeTeams: TeamSummary[]
  featuredProjects: ShowcaseProjectSummary[]
  upcomingEvents: CommunityEventHomeItem[]
}
