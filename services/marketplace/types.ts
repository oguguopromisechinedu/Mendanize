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

export type ContractKind = "PROJECT" | "CONTINUATION"

export type MaintenanceTaskType =
  | "FEATURE"
  | "BUG"
  | "CONTENT"
  | "SEO"
  | "PERFORMANCE"
  | "OTHER"

export type MaintenanceTaskStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "DECLINED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "DONE"
  | "CANCELLED"

export type MaintenanceTaskPriority = "LOW" | "NORMAL" | "HIGH"

export type MaintenanceRetainerTier =
  | "BASIC"
  | "STANDARD"
  | "PREMIUM"
  | "CUSTOM"

export type MaintenanceSubscriptionStatus =
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELLED"
  | "INCOMPLETE"

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

export type MarketplaceListingSource =
  | "OFFICIAL"
  | "THIRD_PARTY"
  | "BUILT_ON_MENDANIZE"

export type MarketplacePricingModel = "ONE_TIME" | "SUBSCRIPTION" | "FREE"

export type MarketplaceLicenseType = "STANDARD" | "TRANSFERABLE" | "RESALE"

export type JobPostingRecord = {
  id: string
  clientId: string
  organizationId: string | null
  title: string
  slug: string
  description: string
  budgetCents: number | null
  currency: string
  skills: string[]
  category: string | null
  jobType: string | null
  location: string | null
  experienceLevel: string | null
  workplaceType: string | null
  featured: boolean
  status: JobPostingStatus
  reviewNote: string | null
  publishedAt: string | null
  createdAt: string
  clientName?: string | null
  organizationName?: string | null
  proposalCount?: number
}

export type JobApplicationRecord = {
  id: string
  jobId: string
  publicUserId: string
  coverLetter: string
  bidCents: number | null
  estimatedDays: number | null
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
  kind: ContractKind
  parentContractId: string | null
  websiteLabel: string | null
  disputeNote: string | null
  createdAt: string
}

export type MaintenanceTaskRecord = {
  id: string
  contractId: string
  createdById: string
  assigneeId: string
  title: string
  description: string
  type: MaintenanceTaskType
  status: MaintenanceTaskStatus
  priority: MaintenanceTaskPriority
  milestoneId: string | null
  coveredByRetainer: boolean
  amountCents: number | null
  milestoneStatus: string | null
  createdAt: string
  completedAt: string | null
}

export type MaintenanceSubscriptionRecord = {
  id: string
  rootContractId: string
  continuationContractId: string
  clientId: string
  workerId: string
  tier: MaintenanceRetainerTier
  amountCents: number
  currency: string
  status: MaintenanceSubscriptionStatus
  stripeSubscriptionId: string | null
  applicationFeePercent: number
  cancelAtPeriodEnd: boolean
  currentPeriodEnd: string | null
  createdAt: string
}

export type MarketplaceListingRecord = {
  id: string
  creatorId: string
  title: string
  slug: string
  description: string
  kind: MarketplaceListingKind
  source: MarketplaceListingSource
  pricingModel: MarketplacePricingModel
  priceCents: number
  currency: string
  category: string | null
  tags: string[]
  logoUrl: string | null
  featured: boolean
  licenseType: MarketplaceLicenseType
  deliveryType: string | null
  status: MarketplaceListingStatus
  reviewNote: string | null
  publishedAt: string | null
  createdAt: string
  creatorName?: string | null
  averageRating?: number | null
  reviewCount?: number
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
