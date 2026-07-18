export const TAXONOMY_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "HIDDEN",
  "ARCHIVED",
] as const

export const TAXONOMY_STATUS_LABELS: Record<
  (typeof TAXONOMY_STATUSES)[number],
  string
> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  HIDDEN: "Hidden",
  ARCHIVED: "Archived",
}
