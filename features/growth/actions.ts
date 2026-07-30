"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import {
  getPublicSession,
  requireEditor,
  requireSuperAdministrator,
} from "@/features/authentication/server"
import {
  applyToJob,
  acceptApplication,
  adminReviewJob,
  adminReviewListing,
  createJobPosting,
  createMarketplaceListing,
  createConnectOnboardingLink,
  ensureClientFlag,
  ensureCreatorFlag,
  fundMilestone,
  releaseMilestone,
  purchaseListing,
  submitJobForReview,
  submitListingForReview,
  adminSetListingSource,
  upsertCommissionRule,
  addContractMilestone,
  setJobFeatured,
  setListingFeatured,
  transferLicense,
  completeContract,
  startContinuationContract,
  cancelContinuationContract,
  createMaintenanceTask,
  updateMaintenanceTaskStatus,
  startMaintenanceRetainer,
  cancelMaintenanceRetainer,
  type MarketplaceListingKind,
  type MarketplaceListingSource,
  type MarketplaceLicenseType,
  type MaintenanceTaskType,
  type MaintenanceTaskPriority,
  type MaintenanceTaskStatus,
} from "@/services/marketplace"
import {
  addOrganizationMember,
  createOrganization,
  reviewOrganization,
  submitOrganizationForVerification,
  updateOrganization,
} from "@/services/organization"
import type { OrganizationType } from "@prisma/client"
import {
  computeCareerReadiness,
  createLearnerNote,
  createPromptEntry,
  deleteLearnerNote,
  deletePromptEntry,
  requestMentorship,
  respondMentorship,
  saveResumeVersion,
  startInterviewSession,
  submitAssessmentAttempt,
  submitChallengeEntry,
  updateCareerProfile,
  recomputeLeaderboard,
} from "@/services/growth"
import {
  computeValuation,
  generateGrowthInsights,
} from "@/services/valuation"

async function requireLearner() {
  const session = await getPublicSession()
  if (!session?.user?.id) return null
  return session
}

/** Form actions must return void for Next.js `<form action={...}>`. */

/**
 * Employer onboarding: company registration if no org, else hiring dashboard.
 * Never throws to the generic error page for expected journey states.
 */
export async function enableClientFlagAction(): Promise<void> {
  const session = await requireLearner()
  if (!session) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent("/account/work")}`)
  }

  const { getOrganizationForUser } = await import("@/services/organization")
  const org = await getOrganizationForUser(session.user.id)

  if (!org) {
    redirect("/account/company?intent=employer")
  }

  try {
    await ensureClientFlag(session.user.id)
  } catch (error) {
    console.error("[growth] enableClientFlagAction", error)
    redirect("/account/hiring?error=client-setup")
  }

  revalidatePath("/account/hiring")
  revalidatePath("/account/work")
  revalidatePath("/account/company")
  redirect("/account/hiring?onboarded=1")
}

/**
 * Creator onboarding: enable creator capability and open creator dashboard.
 */
export async function enableCreatorFlagAction(): Promise<void> {
  const session = await requireLearner()
  if (!session) {
    redirect(
      `/sign-in?callbackUrl=${encodeURIComponent("/account/tools-marketplace")}`,
    )
  }

  try {
    const flag = await ensureCreatorFlag(session.user.id)
    if (!flag) {
      redirect("/account/marketplace?error=creator-setup")
    }
  } catch (error) {
    if (isRedirectError(error)) throw error
    console.error("[growth] enableCreatorFlagAction", error)
    redirect("/account/marketplace?error=creator-setup")
  }

  revalidatePath("/account/marketplace")
  revalidatePath("/account/tools-marketplace")
  redirect("/account/marketplace?onboarded=1")
}

export async function createJobAction(formData: FormData): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const budget = Number(formData.get("budgetCents") ?? 0)
  const organizationId = String(formData.get("organizationId") ?? "").trim() || null
  const category = String(formData.get("category") ?? "").trim() || null
  const jobType = String(formData.get("jobType") ?? "").trim() || null
  const location = String(formData.get("location") ?? "").trim() || null
  const experienceLevel = String(formData.get("experienceLevel") ?? "").trim() || null
  const workplaceType = String(formData.get("workplaceType") ?? "").trim() || null
  const skillsRaw = String(formData.get("skills") ?? "").trim()
  const skills = skillsRaw
    ? skillsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : []
  if (!title || !description) return
  try {
    await createJobPosting({
      clientId: session.user.id,
      title,
      description,
      budgetCents: Number.isFinite(budget) && budget > 0 ? budget : null,
      organizationId,
      category,
      jobType,
      location,
      experienceLevel,
      workplaceType,
      skills,
      submitForReview: true,
    })
    revalidatePath("/account/hiring")
    revalidatePath("/account/company")
    revalidatePath("/account/work")
  } catch {
    /* form action — errors stay server-side */
  }
}

export async function applyToJobAction(formData: FormData): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  const jobId = String(formData.get("jobId") ?? "")
  const coverLetter = String(formData.get("coverLetter") ?? "").trim()
  const bidDollars = Number(formData.get("bidDollars") ?? NaN)
  const estimatedDays = Number(formData.get("estimatedDays") ?? NaN)
  if (!jobId || !coverLetter) return
  try {
    await applyToJob({
      jobId,
      publicUserId: session.user.id,
      coverLetter,
      bidCents:
        Number.isFinite(bidDollars) && bidDollars > 0
          ? Math.round(bidDollars * 100)
          : null,
      estimatedDays:
        Number.isFinite(estimatedDays) && estimatedDays > 0
          ? Math.round(estimatedDays)
          : null,
    })
    revalidatePath("/account/work")
  } catch {
    /* ignore */
  }
}

export async function acceptApplicationAction(formData: FormData): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  const applicationId = String(formData.get("applicationId") ?? "")
  try {
    const contract = await acceptApplication({
      applicationId,
      clientId: session.user.id,
    })
    revalidatePath("/account/hiring")
    revalidatePath(`/account/work/contracts/${contract.id}`)
    redirect(`/account/work/contracts/${contract.id}`)
  } catch (error) {
    if (isRedirectError(error)) throw error
  }
}

export async function fundMilestoneAction(formData: FormData): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  const milestoneId = String(formData.get("milestoneId") ?? "")
  try {
    const result = await fundMilestone({
      milestoneId,
      clientId: session.user.id,
    })
    const { getPrisma } = await import("@/lib/db/prisma")
    const milestone = await getPrisma().milestone.findUnique({
      where: { id: milestoneId },
      select: { contractId: true },
    })
    revalidatePath("/account/hiring")
    revalidatePath("/account/work")
    if (milestone?.contractId) {
      revalidatePath(`/account/work/contracts/${milestone.contractId}`)
    }
    void result
  } catch {
    /* ignore */
  }
}

export async function releaseMilestoneAction(formData: FormData): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  const milestoneId = String(formData.get("milestoneId") ?? "")
  if (!milestoneId) return
  try {
    const { getPrisma } = await import("@/lib/db/prisma")
    const milestone = await getPrisma().milestone.findUnique({
      where: { id: milestoneId },
      include: { contract: true },
    })
    if (!milestone || milestone.contract.clientId !== session.user.id) return
    await releaseMilestone({ milestoneId })
    revalidatePath("/account/hiring")
    revalidatePath("/account/work")
    revalidatePath(`/account/work/contracts/${milestone.contractId}`)
  } catch {
    /* ignore */
  }
}

export async function createListingAction(formData: FormData): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const kind = String(formData.get("kind") ?? "PROMPT_PACK") as MarketplaceListingKind
  const sourceRaw = String(formData.get("source") ?? "BUILT_ON_MENDANIZE")
  const source = (
    sourceRaw === "THIRD_PARTY" ? "THIRD_PARTY" : "BUILT_ON_MENDANIZE"
  ) as MarketplaceListingSource
  const priceCents = Number(formData.get("priceCents") ?? 0)
  const category = String(formData.get("category") ?? "").trim() || null
  const licenseRaw = String(formData.get("licenseType") ?? "STANDARD")
  const licenseType = (
    licenseRaw === "TRANSFERABLE" || licenseRaw === "RESALE"
      ? licenseRaw
      : "STANDARD"
  ) as MarketplaceLicenseType
  if (!title || !description || !Number.isFinite(priceCents)) return
  try {
    await createMarketplaceListing({
      creatorId: session.user.id,
      title,
      description,
      kind,
      source,
      priceCents: Math.round(priceCents),
      category,
      licenseType,
      submitForReview: true,
    })
    revalidatePath("/account/marketplace")
    revalidatePath("/account/tools-marketplace")
  } catch {
    /* ignore */
  }
}

export async function purchaseListingAction(formData: FormData): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  const listingId = String(formData.get("listingId") ?? "")
  try {
    await purchaseListing({
      listingId,
      buyerId: session.user.id,
    })
    revalidatePath("/account/tools-marketplace")
  } catch {
    /* ignore */
  }
}

export async function connectOnboardingAction(): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  try {
    const result = await createConnectOnboardingLink(session.user.id)
    if (result.url) redirect(result.url)
  } catch {
    /* ignore */
  }
}

export async function createPromptAction(formData: FormData): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  const title = String(formData.get("title") ?? "").trim()
  const body = String(formData.get("body") ?? "").trim()
  if (!title || !body) return
  await createPromptEntry({ publicUserId: session.user.id, title, body })
  revalidatePath("/account/prompts")
}

export async function deletePromptAction(formData: FormData): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  await deletePromptEntry(String(formData.get("id") ?? ""), session.user.id)
  revalidatePath("/account/prompts")
}

export async function createNoteAction(formData: FormData): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  const title = String(formData.get("title") ?? "").trim()
  const body = String(formData.get("body") ?? "").trim()
  if (!title || !body) return
  await createLearnerNote({ publicUserId: session.user.id, title, body })
  revalidatePath("/account/notes")
}

export async function deleteNoteAction(formData: FormData): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  await deleteLearnerNote(String(formData.get("id") ?? ""), session.user.id)
  revalidatePath("/account/notes")
}

export async function updateCareerAction(formData: FormData): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  const skillsRaw = String(formData.get("skills") ?? "")
  await updateCareerProfile({
    publicUserId: session.user.id,
    headline: String(formData.get("headline") ?? "") || null,
    summary: String(formData.get("summary") ?? "") || null,
    targetRole: String(formData.get("targetRole") ?? "") || null,
    location: String(formData.get("location") ?? "") || null,
    skills: skillsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  })
  revalidatePath("/account/career")
}

export async function saveResumeAction(formData: FormData): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  await saveResumeVersion({
    publicUserId: session.user.id,
    label: String(formData.get("label") ?? "Resume") || "Resume",
    contentMarkdown: String(formData.get("contentMarkdown") ?? ""),
  })
  revalidatePath("/account/career")
}

export async function computeReadinessAction(): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  await computeCareerReadiness(session.user.id)
  revalidatePath("/account/career")
}

export async function startInterviewAction(formData: FormData): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  const targetRole = String(formData.get("targetRole") ?? "") || undefined
  await startInterviewSession({
    publicUserId: session.user.id,
    targetRole,
  })
  const q = new URLSearchParams()
  q.set("context", "INTERVIEW")
  if (targetRole) q.set("topic", targetRole)
  redirect(`/ask?${q.toString()}`)
}

export async function requestMentorshipAction(formData: FormData): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  const mentorId = String(formData.get("mentorId") ?? "")
  if (!mentorId) return
  try {
    await requestMentorship({
      mentorId,
      menteeId: session.user.id,
      note: String(formData.get("note") ?? "") || undefined,
    })
    revalidatePath("/community")
    revalidatePath("/account/career")
  } catch {
    /* ignore */
  }
}

export async function respondMentorshipAction(formData: FormData): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  await respondMentorship({
    id: String(formData.get("id") ?? ""),
    mentorId: session.user.id,
    accept: String(formData.get("accept") ?? "") === "1",
  })
  revalidatePath("/account/career")
}

export async function submitChallengeAction(formData: FormData): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  try {
    await submitChallengeEntry({
      challengeId: String(formData.get("challengeId") ?? ""),
      publicUserId: session.user.id,
      body: String(formData.get("body") ?? ""),
    })
    revalidatePath("/community")
  } catch {
    /* ignore */
  }
}

export async function submitAssessmentAction(formData: FormData): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  const assessmentId = String(formData.get("assessmentId") ?? "")
  const answersJson = String(formData.get("answers") ?? "[]")
  let answers: number[] = []
  try {
    answers = JSON.parse(answersJson) as number[]
  } catch {
    return
  }
  try {
    await submitAssessmentAttempt({
      assessmentId,
      publicUserId: session.user.id,
      answers,
    })
    revalidatePath("/account/certificates")
  } catch {
    /* ignore */
  }
}

export async function adminReviewJobAction(formData: FormData): Promise<void> {
  const session = await requireEditor()
  if (!session?.admin?.id) return
  await adminReviewJob({
    jobId: String(formData.get("jobId") ?? ""),
    adminId: session.admin.id,
    adminEmail: session.admin.email,
    approve: String(formData.get("approve") ?? "") === "1",
    note: String(formData.get("note") ?? "") || undefined,
  })
  revalidatePath("/dashboard/marketplace")
}

export async function adminReviewListingAction(formData: FormData): Promise<void> {
  const session = await requireEditor()
  if (!session?.admin?.id) return
  await adminReviewListing({
    listingId: String(formData.get("listingId") ?? ""),
    adminId: session.admin.id,
    adminEmail: session.admin.email,
    approve: String(formData.get("approve") ?? "") === "1",
    note: String(formData.get("note") ?? "") || undefined,
  })
  revalidatePath("/dashboard/marketplace")
}

export async function adminRecomputeLeaderboardAction(): Promise<void> {
  const session = await requireEditor()
  if (!session?.admin?.id) return
  const periodKey = new Date().toISOString().slice(0, 7)
  await recomputeLeaderboard(periodKey)
  revalidatePath("/dashboard/marketplace")
  revalidatePath("/community")
}

export async function computeValuationAction(): Promise<void> {
  const session = await requireSuperAdministrator()
  if (!session?.admin?.id) return
  await computeValuation({
    adminId: session.admin.id,
    adminEmail: session.admin.email,
  })
  revalidatePath("/dashboard/bi")
  revalidatePath("/dashboard/bi/valuation")
}

export async function generateInsightsAction(): Promise<void> {
  const session = await requireSuperAdministrator()
  if (!session?.admin?.id) return
  await generateGrowthInsights({
    adminId: session.admin.id,
    adminEmail: session.admin.email,
  })
  revalidatePath("/dashboard/bi")
}

/** MES-040 — Company / Organization */

export async function createOrganizationAction(formData: FormData): Promise<void> {
  const session = await requireLearner()
  if (!session) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent("/account/company")}`)
  }
  const name = String(formData.get("name") ?? "").trim()
  if (!name) {
    redirect("/account/company?intent=employer&error=validation")
  }
  try {
    await createOrganization({
      ownerPublicUserId: session.user.id,
      name,
      type: (String(formData.get("type") ?? "COMPANY") as OrganizationType) || "COMPANY",
      description: String(formData.get("description") ?? "").trim() || null,
      website: String(formData.get("website") ?? "").trim() || null,
      industry: String(formData.get("industry") ?? "").trim() || null,
      size: String(formData.get("size") ?? "").trim() || null,
      location: String(formData.get("location") ?? "").trim() || null,
    })
    revalidatePath("/account/company")
    revalidatePath("/account/hiring")
    revalidatePath("/account/work")
    redirect("/account/hiring?onboarded=1")
  } catch (error) {
    if (isRedirectError(error)) throw error
    console.error("[growth] createOrganizationAction", error)
    redirect("/account/company?intent=employer&error=create")
  }
}

export async function updateOrganizationAction(formData: FormData): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  const organizationId = String(formData.get("organizationId") ?? "")
  if (!organizationId) return
  try {
    await updateOrganization(organizationId, session.user.id, {
      name: String(formData.get("name") ?? "").trim() || undefined,
      description: String(formData.get("description") ?? "").trim() || null,
      website: String(formData.get("website") ?? "").trim() || null,
      industry: String(formData.get("industry") ?? "").trim() || null,
      size: String(formData.get("size") ?? "").trim() || null,
      location: String(formData.get("location") ?? "").trim() || null,
      type: (String(formData.get("type") ?? "") as OrganizationType) || undefined,
    })
    revalidatePath("/account/company")
    redirect("/account/company?saved=1")
  } catch (error) {
    if (isRedirectError(error)) throw error
    console.error("[growth] updateOrganizationAction", error)
    redirect("/account/company?error=create")
  }
}

export async function submitOrganizationVerificationAction(
  formData: FormData,
): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  const organizationId = String(formData.get("organizationId") ?? "")
  if (!organizationId) return
  try {
    await submitOrganizationForVerification(organizationId, session.user.id)
    revalidatePath("/account/company")
    redirect("/account/company?verified=1")
  } catch (error) {
    if (isRedirectError(error)) throw error
    console.error("[growth] submitOrganizationVerificationAction", error)
    redirect("/account/company?error=create")
  }
}

export async function addOrganizationMemberAction(formData: FormData): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  const organizationId = String(formData.get("organizationId") ?? "")
  const email = String(formData.get("email") ?? "").trim()
  if (!organizationId || !email) return
  try {
    await addOrganizationMember({
      organizationId,
      actorId: session.user.id,
      email,
      role: "MEMBER",
    })
    revalidatePath("/account/company")
    redirect("/account/company?member=1")
  } catch (error) {
    if (isRedirectError(error)) throw error
    console.error("[growth] addOrganizationMemberAction", error)
    redirect("/account/company?member=0")
  }
}

export async function adminReviewOrganizationAction(
  formData: FormData,
): Promise<void> {
  const session = await requireEditor()
  if (!session?.admin?.id) return
  await reviewOrganization({
    organizationId: String(formData.get("organizationId") ?? ""),
    adminId: session.admin.id,
    approve: String(formData.get("approve") ?? "") === "1",
    note: String(formData.get("note") ?? "") || undefined,
  })
  revalidatePath("/dashboard/marketplace")
}

export async function adminSetListingSourceAction(
  formData: FormData,
): Promise<void> {
  const session = await requireEditor()
  if (!session?.admin?.id) return
  const source = String(formData.get("source") ?? "") as MarketplaceListingSource
  if (!["OFFICIAL", "THIRD_PARTY", "BUILT_ON_MENDANIZE"].includes(source)) return
  await adminSetListingSource({
    listingId: String(formData.get("listingId") ?? ""),
    source,
    adminId: session.admin.id,
  })
  revalidatePath("/dashboard/marketplace")
  revalidatePath("/account/tools-marketplace")
}

export async function adminUpsertCommissionRuleAction(
  formData: FormData,
): Promise<void> {
  const session = await requireSuperAdministrator()
  if (!session?.admin?.id) return
  const scopeRaw = String(formData.get("scope") ?? "")
  const tierRaw = String(formData.get("sellerTier") ?? "")
  const feeBps = Number(formData.get("feeBps") ?? NaN)
  const label = String(formData.get("label") ?? "").trim() || undefined
  const active = formData.get("active") === "1"
  if (scopeRaw !== "TOOLS" && scopeRaw !== "WORK") return
  if (tierRaw !== "STANDARD" && tierRaw !== "PRO" && tierRaw !== "ENTERPRISE") {
    return
  }
  if (!Number.isFinite(feeBps)) return
  await upsertCommissionRule({
    scope: scopeRaw,
    sellerTier: tierRaw,
    feeBps: Math.round(feeBps),
    label,
    active,
    adminId: session.admin.id,
  })
  revalidatePath("/dashboard/marketplace/finance")
  revalidatePath("/dashboard/marketplace")
}

export async function addContractMilestoneAction(
  formData: FormData,
): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  const contractId = String(formData.get("contractId") ?? "")
  const title = String(formData.get("title") ?? "").trim()
  const amountDollars = Number(formData.get("amountDollars") ?? NaN)
  if (!contractId || !title || !Number.isFinite(amountDollars) || amountDollars <= 0) {
    return
  }
  try {
    await addContractMilestone({
      contractId,
      clientId: session.user.id,
      title,
      amountCents: Math.round(amountDollars * 100),
    })
    revalidatePath(`/account/work/contracts/${contractId}`)
    revalidatePath("/account/hiring")
  } catch {
    /* ignore */
  }
}

export async function completeContractAction(formData: FormData): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  const contractId = String(formData.get("contractId") ?? "")
  if (!contractId) return
  try {
    await completeContract({ contractId, clientId: session.user.id })
    revalidatePath(`/account/work/contracts/${contractId}`)
    revalidatePath("/account/hiring")
    revalidatePath("/account/work")
  } catch {
    /* ignore */
  }
}

export async function startContinuationAction(formData: FormData): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  const sourceContractId = String(formData.get("sourceContractId") ?? "")
  const websiteLabel = String(formData.get("websiteLabel") ?? "").trim()
  const openingNote = String(formData.get("openingNote") ?? "").trim()
  if (!sourceContractId) return
  try {
    const contract = await startContinuationContract({
      sourceContractId,
      clientId: session.user.id,
      websiteLabel: websiteLabel || null,
      openingNote: openingNote || null,
    })
    revalidatePath(`/account/work/contracts/${sourceContractId}`)
    revalidatePath(`/account/work/contracts/${contract.id}`)
    revalidatePath("/account/hiring")
    revalidatePath("/account/work")
    redirect(`/account/work/contracts/${contract.id}`)
  } catch (e) {
    if (isRedirectError(e)) throw e
  }
}

export async function cancelContinuationAction(formData: FormData): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  const contractId = String(formData.get("contractId") ?? "")
  if (!contractId) return
  try {
    await cancelContinuationContract({
      contractId,
      actorId: session.user.id,
    })
    revalidatePath(`/account/work/contracts/${contractId}`)
    revalidatePath("/account/hiring")
    revalidatePath("/account/work")
  } catch {
    /* ignore */
  }
}

export async function createMaintenanceTaskAction(
  formData: FormData,
): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  const contractId = String(formData.get("contractId") ?? "")
  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const type = String(formData.get("type") ?? "OTHER") as MaintenanceTaskType
  const priority = String(
    formData.get("priority") ?? "NORMAL",
  ) as MaintenanceTaskPriority
  const amountRaw = String(formData.get("amountDollars") ?? "").trim()
  const amountDollars = amountRaw ? Number(amountRaw) : null
  const coveredByRetainer = String(formData.get("coveredByRetainer") ?? "") === "1"
  if (!contractId || !title || !description) return
  try {
    await createMaintenanceTask({
      contractId,
      clientId: session.user.id,
      title,
      description,
      type,
      priority,
      coveredByRetainer,
      amountCents:
        amountDollars != null && Number.isFinite(amountDollars) && amountDollars > 0
          ? Math.round(amountDollars * 100)
          : null,
    })
    revalidatePath(`/account/work/contracts/${contractId}`)
  } catch {
    /* ignore */
  }
}

export async function startMaintenanceRetainerAction(
  formData: FormData,
): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  const contractId = String(formData.get("contractId") ?? "")
  const tier = String(formData.get("tier") ?? "BASIC") as
    | "BASIC"
    | "STANDARD"
    | "PREMIUM"
  if (!contractId || !["BASIC", "STANDARD", "PREMIUM"].includes(tier)) return
  try {
    await startMaintenanceRetainer({
      continuationContractId: contractId,
      clientId: session.user.id,
      tier,
    })
    revalidatePath(`/account/work/contracts/${contractId}`)
    revalidatePath("/dashboard/marketplace/finance")
  } catch {
    /* ignore */
  }
}

export async function cancelMaintenanceRetainerAction(
  formData: FormData,
): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  const contractId = String(formData.get("contractId") ?? "")
  if (!contractId) return
  try {
    await cancelMaintenanceRetainer({
      continuationContractId: contractId,
      clientId: session.user.id,
      immediate: String(formData.get("immediate") ?? "") === "1",
    })
    revalidatePath(`/account/work/contracts/${contractId}`)
    revalidatePath("/dashboard/marketplace/finance")
  } catch {
    /* ignore */
  }
}

export async function updateMaintenanceTaskStatusAction(
  formData: FormData,
): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  const taskId = String(formData.get("taskId") ?? "")
  const contractId = String(formData.get("contractId") ?? "")
  const status = String(formData.get("status") ?? "") as MaintenanceTaskStatus
  if (!taskId || !status) return
  try {
    await updateMaintenanceTaskStatus({
      taskId,
      actorId: session.user.id,
      status,
    })
    if (contractId) revalidatePath(`/account/work/contracts/${contractId}`)
  } catch {
    /* ignore */
  }
}

export async function transferLicenseAction(formData: FormData): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  const licenseId = String(formData.get("licenseId") ?? "")
  const recipientEmail = String(formData.get("recipientEmail") ?? "").trim()
  if (!licenseId || !recipientEmail) return
  try {
    await transferLicense({
      licenseId,
      fromOwnerId: session.user.id,
      recipientEmail,
    })
    revalidatePath("/account/tools-marketplace")
    revalidatePath("/account/marketplace")
  } catch {
    /* ignore */
  }
}

export async function adminSetJobFeaturedAction(
  formData: FormData,
): Promise<void> {
  const session = await requireEditor()
  if (!session?.admin?.id) return
  await setJobFeatured({
    jobId: String(formData.get("jobId") ?? ""),
    featured: String(formData.get("featured") ?? "") === "1",
    adminId: session.admin.id,
  })
  revalidatePath("/dashboard/marketplace")
  revalidatePath("/account/work")
}

export async function adminSetListingFeaturedAction(
  formData: FormData,
): Promise<void> {
  const session = await requireEditor()
  if (!session?.admin?.id) return
  await setListingFeatured({
    listingId: String(formData.get("listingId") ?? ""),
    featured: String(formData.get("featured") ?? "") === "1",
    adminId: session.admin.id,
  })
  revalidatePath("/dashboard/marketplace")
  revalidatePath("/account/tools-marketplace")
}

export { submitJobForReview, submitListingForReview }
