export const ARTICLE_STATUSES = [
  "DRAFT",
  "REVIEW",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
] as const

export const STATUS_LABELS: Record<(typeof ARTICLE_STATUSES)[number], string> = {
  DRAFT: "Draft",
  REVIEW: "Review",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
}

export const ARTICLE_LIST_PAGE_SIZE = 20
