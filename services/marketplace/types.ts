export type JobPostingStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "OPEN"
  | "FILLED"
  | "CLOSED"
  | "REJECTED"

export type JobApplicationStatus =
  | "SUBMITTED"
  | "SHORTLISTED"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN"

export type ContractStatus = "ACTIVE" | "COMPLETED" | "DISPUTED" | "CANCELLED"

export type MarketplaceListingKind =
  | "AI_APP"
  | "AGENT"
  | "PROMPT_PACK"
  | "TEMPLATE"
  | "AUTOMATION"

export type MarketplaceListingStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "ARCHIVED"

export type MarketplacePricingModel = "ONE_TIME" | "SUBSCRIPTION"

export type JobPostingRecord = {
  id: string
  clientId: string
  title: string
  slug: string
  description: string
  budgetCents: number | null
  currency: string
  skills: string[]
  status: JobPostingStatus
  reviewNote: string | null
  publishedAt: string | null
  createdAt: string
  clientName?: string | null
}

export type JobApplicationRecord = {
  id: string
  jobId: string
  publicUserId: string
  coverLetter: string
  status: JobApplicationStatus
  createdAt: string
  applicantName?: string | null
}

export type ContractRecord = {
  id: string
  jobId: string
  clientId: string
  workerId: string
  status: ContractStatus
  disputeNote: string | null
  createdAt: string
}

export type MarketplaceListingRecord = {
  id: string
  creatorId: string
  title: string
  slug: string
  description: string
  kind: MarketplaceListingKind
  pricingModel: MarketplacePricingModel
  priceCents: number
  currency: string
  status: MarketplaceListingStatus
  reviewNote: string | null
  publishedAt: string | null
  createdAt: string
  creatorName?: string | null
}

export type MarketplacePurchaseRecord = {
  id: string
  listingId: string
  buyerId: string
  amountCents: number
  status: string
  stripePaymentIntentId: string | null
  createdAt: string
}

export type MarketplaceMetrics = {
  openJobs: number
  pendingJobReviews: number
  completedContracts: number
  activeClients: number
  approvedListings: number
  pendingListingReviews: number
  purchasesCompleted: number
  activeCreators: number
}
