"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
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
  purchaseListing,
  submitJobForReview,
  submitListingForReview,
  type MarketplaceListingKind,
} from "@/services/marketplace"
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

export async function enableClientFlagAction(): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  await ensureClientFlag(session.user.id)
  revalidatePath("/account/hiring")
  revalidatePath("/account/work")
}

export async function enableCreatorFlagAction(): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  await ensureCreatorFlag(session.user.id)
  revalidatePath("/account/marketplace")
  revalidatePath("/account/tools-marketplace")
}

export async function createJobAction(formData: FormData): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const budget = Number(formData.get("budgetCents") ?? 0)
  if (!title || !description) return
  try {
    await createJobPosting({
      clientId: session.user.id,
      title,
      description,
      budgetCents: Number.isFinite(budget) && budget > 0 ? budget : null,
      submitForReview: true,
    })
    revalidatePath("/account/hiring")
  } catch {
    /* form action — errors stay server-side */
  }
}

export async function applyToJobAction(formData: FormData): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  const jobId = String(formData.get("jobId") ?? "")
  const coverLetter = String(formData.get("coverLetter") ?? "").trim()
  if (!jobId || !coverLetter) return
  try {
    await applyToJob({
      jobId,
      publicUserId: session.user.id,
      coverLetter,
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
    await acceptApplication({
      applicationId,
      clientId: session.user.id,
    })
    revalidatePath("/account/hiring")
  } catch {
    /* ignore */
  }
}

export async function fundMilestoneAction(formData: FormData): Promise<void> {
  const session = await requireLearner()
  if (!session) return
  const milestoneId = String(formData.get("milestoneId") ?? "")
  try {
    await fundMilestone({
      milestoneId,
      clientId: session.user.id,
    })
    revalidatePath("/account/hiring")
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
  const priceCents = Number(formData.get("priceCents") ?? 0)
  if (!title || !description || !Number.isFinite(priceCents)) return
  try {
    await createMarketplaceListing({
      creatorId: session.user.id,
      title,
      description,
      kind,
      priceCents: Math.round(priceCents),
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

export { submitJobForReview, submitListingForReview }
