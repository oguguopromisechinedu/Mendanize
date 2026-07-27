export const TOOL_STATUSES = [
  "DRAFT",
  "REVIEW",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
] as const

export const TOOL_STATUS_LABELS: Record<
  (typeof TOOL_STATUSES)[number],
  string
> = {
  DRAFT: "Draft",
  REVIEW: "Review",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
}

export const TOOL_PRICINGS = [
  "FREE",
  "FREEMIUM",
  "PAID",
  "ENTERPRISE",
] as const

export const TOOL_PRICING_LABELS: Record<
  (typeof TOOL_PRICINGS)[number],
  string
> = {
  FREE: "Free",
  FREEMIUM: "Freemium",
  PAID: "Paid",
  ENTERPRISE: "Enterprise",
}

export const TOOL_DIFFICULTIES = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
] as const

export const TOOL_DIFFICULTY_LABELS: Record<
  (typeof TOOL_DIFFICULTIES)[number],
  string
> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
}

export const TOOL_AVAILABILITIES = [
  "AVAILABLE",
  "BETA",
  "WAITLIST",
  "DISCONTINUED",
] as const

export const TOOL_AVAILABILITY_LABELS: Record<
  (typeof TOOL_AVAILABILITIES)[number],
  string
> = {
  AVAILABLE: "Available",
  BETA: "Beta",
  WAITLIST: "Waitlist",
  DISCONTINUED: "Discontinued",
}

export const TOOL_FEATURE_KINDS = [
  "FEATURE",
  "USE_CASE",
  "ADVANTAGE",
  "LIMITATION",
] as const

export const TOOL_FEATURE_KIND_LABELS: Record<
  (typeof TOOL_FEATURE_KINDS)[number],
  string
> = {
  FEATURE: "Feature",
  USE_CASE: "Use case",
  ADVANTAGE: "Advantage",
  LIMITATION: "Limitation",
}

export const TOOL_PLATFORMS = [
  "Web",
  "Windows",
  "macOS",
  "Linux",
  "Android",
  "iOS",
  "API",
] as const

export const TOOL_SOURCES = [
  "OFFICIAL",
  "THIRD_PARTY",
  "BUILT_ON_MENDANIZE",
] as const

export const TOOL_SOURCE_LABELS: Record<(typeof TOOL_SOURCES)[number], string> =
  {
    OFFICIAL: "Official Mendanize",
    THIRD_PARTY: "Third-Party",
    BUILT_ON_MENDANIZE: "Built on Mendanize",
  }
