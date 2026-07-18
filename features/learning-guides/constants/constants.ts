export const GUIDE_STATUSES = [
  "DRAFT",
  "REVIEW",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
] as const

export const GUIDE_STATUS_LABELS: Record<
  (typeof GUIDE_STATUSES)[number],
  string
> = {
  DRAFT: "Draft",
  REVIEW: "Review",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
}

export const GUIDE_DIFFICULTIES = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
] as const

export const GUIDE_DIFFICULTY_LABELS: Record<
  (typeof GUIDE_DIFFICULTIES)[number],
  string
> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
}
