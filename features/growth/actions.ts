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

function unauthorized() {
  return { ok: false as const, message: "Sign in as a learner to continue." }
}

async function requireLearner() {
  const session = await getPublicSession()
  if (!session?.user?.id) return null
  return session
}

export async function enableClientFlagAction() {
  const session = await requireLearner()
  if (!session) return unauthorized()
  await ensureClientFlag(session.user.id)
  revalidatePath("/account/hiring")
  revalidatePath("/account/work")
  return { ok: true as const }
}

export async function enableCreatorFlagAction() {
  const session = await requireLearner()
  if (!session) return unauthorized()
  await ensureCreatorFlag(session.user.id)
  revalidatePath("/account/marketplace")
  revalidatePath("/account/tools-marketplace")
  return { ok: true as const }
}

export async function createJobAction(formData: FormData) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const budget = Number(formData.get("budgetCents") ?? 0)
  if (!title || !description) {
    return { ok: false as const, message: "Title and description required." }
  }
  try {
    await createJobPosting({
      clientId: session.user.id,
      title,
      description,
      budgetCents: Number.isFinite(budget) && budget > 0 ? budget : null,
      submitForReview: true,
    })
    revalidatePath("/account/hiring")
    return { ok: true as const }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Could not create job",
    }
  }
}

export async function applyToJobAction(formData: FormData) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  const jobId = String(formData.get("jobId") ?? "")
  const coverLetter = String(formData.get("coverLetter") ?? "").trim()
  if (!jobId || !coverLetter) {
    return { ok: false as const, message: "Cover letter required." }
  }
  try {
    await applyToJob({
      jobId,
      publicUserId: session.user.id,
      coverLetter,
    })
    revalidatePath("/account/work")
    return { ok: true as const }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Could not apply",
    }
  }
}

export async function acceptApplicationAction(formData: FormData) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  const applicationId = String(formData.get("applicationId") ?? "")
  try {
    await acceptApplication({
      applicationId,
      clientId: session.user.id,
    })
    revalidatePath("/account/hiring")
    return { ok: true as const }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Could not accept",
    }
  }
}

export async function fundMilestoneAction(formData: FormData) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  const milestoneId = String(formData.get("milestoneId") ?? "")
  try {
    const result = await fundMilestone({
      milestoneId,
      clientId: session.user.id,
    })
    revalidatePath("/account/hiring")
    return { ok: true as const, ...result }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Could not fund milestone",
    }
  }
}

export async function createListingAction(formData: FormData) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const kind = String(formData.get("kind") ?? "PROMPT_PACK") as MarketplaceListingKind
  const priceCents = Number(formData.get("priceCents") ?? 0)
  if (!title || !description || !Number.isFinite(priceCents)) {
    return { ok: false as const, message: "Title, description, and price required." }
  }
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
    return { ok: true as const }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Could not create listing",
    }
  }
}

export async function purchaseListingAction(formData: FormData) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  const listingId = String(formData.get("listingId") ?? "")
  try {
    const purchase = await purchaseListing({
      listingId,
      buyerId: session.user.id,
    })
    revalidatePath("/account/tools-marketplace")
    return { ok: true as const, purchaseId: purchase.id, status: purchase.status }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Could not purchase",
    }
  }
}

export async function connectOnboardingAction() {
  const session = await requireLearner()
  if (!session) return unauthorized()
  try {
    const result = await createConnectOnboardingLink(session.user.id)
    if (result.url) redirect(result.url)
    return {
      ok: false as const,
      message: result.message ?? "Stripe Connect is not configured yet.",
    }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Connect onboarding failed",
    }
  }
}

export async function createPromptAction(formData: FormData) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  const title = String(formData.get("title") ?? "").trim()
  const body = String(formData.get("body") ?? "").trim()
  if (!title || !body) return { ok: false as const, message: "Title and body required." }
  await createPromptEntry({ publicUserId: session.user.id, title, body })
  revalidatePath("/account/prompts")
  return { ok: true as const }
}

export async function deletePromptAction(formData: FormData) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  await deletePromptEntry(String(formData.get("id") ?? ""), session.user.id)
  revalidatePath("/account/prompts")
  return { ok: true as const }
}

export async function createNoteAction(formData: FormData) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  const title = String(formData.get("title") ?? "").trim()
  const body = String(formData.get("body") ?? "").trim()
  if (!title || !body) return { ok: false as const, message: "Title and body required." }
  await createLearnerNote({ publicUserId: session.user.id, title, body })
  revalidatePath("/account/notes")
  return { ok: true as const }
}

export async function deleteNoteAction(formData: FormData) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  await deleteLearnerNote(String(formData.get("id") ?? ""), session.user.id)
  revalidatePath("/account/notes")
  return { ok: true as const }
}

export async function updateCareerAction(formData: FormData) {
  const session = await requireLearner()
  if (!session) return unauthorized()
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
  return { ok: true as const }
}

export async function saveResumeAction(formData: FormData) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  await saveResumeVersion({
    publicUserId: session.user.id,
    label: String(formData.get("label") ?? "Resume") || "Resume",
    contentMarkdown: String(formData.get("contentMarkdown") ?? ""),
  })
  revalidatePath("/account/career")
  return { ok: true as const }
}

export async function computeReadinessAction() {
  const session = await requireLearner()
  if (!session) return unauthorized()
  const result = await computeCareerReadiness(session.user.id)
  revalidatePath("/account/career")
  return { ok: true as const, ...result }
}

export async function startInterviewAction(formData: FormData) {
  const session = await requireLearner()
  if (!session) return unauthorized()
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

export async function requestMentorshipAction(formData: FormData) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  const mentorId = String(formData.get("mentorId") ?? "")
  if (!mentorId) return { ok: false as const, message: "Mentor required." }
  try {
    await requestMentorship({
      mentorId,
      menteeId: session.user.id,
      note: String(formData.get("note") ?? "") || undefined,
    })
    revalidatePath("/community")
    revalidatePath("/account/career")
    return { ok: true as const }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Request failed",
    }
  }
}

export async function respondMentorshipAction(formData: FormData) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  await respondMentorship({
    id: String(formData.get("id") ?? ""),
    mentorId: session.user.id,
    accept: String(formData.get("accept") ?? "") === "1",
  })
  revalidatePath("/account/career")
  return { ok: true as const }
}

export async function submitChallengeAction(formData: FormData) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  try {
    await submitChallengeEntry({
      challengeId: String(formData.get("challengeId") ?? ""),
      publicUserId: session.user.id,
      body: String(formData.get("body") ?? ""),
    })
    revalidatePath("/community")
    return { ok: true as const }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Submit failed",
    }
  }
}

export async function submitAssessmentAction(formData: FormData) {
  const session = await requireLearner()
  if (!session) return unauthorized()
  const assessmentId = String(formData.get("assessmentId") ?? "")
  const answersJson = String(formData.get("answers") ?? "[]")
  let answers: number[] = []
  try {
    answers = JSON.parse(answersJson) as number[]
  } catch {
    return { ok: false as const, message: "Invalid answers." }
  }
  try {
    const result = await submitAssessmentAttempt({
      assessmentId,
      publicUserId: session.user.id,
      answers,
    })
    revalidatePath("/account/certificates")
    return {
      ok: true as const,
      passed: result.passed,
      scorePercent: result.scorePercent,
      certificateId: result.certificateId,
    }
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Attempt failed",
    }
  }
}

export async function adminReviewJobAction(formData: FormData) {
  const session = await requireEditor()
  if (!session?.admin?.id) {
    return { ok: false as const, message: "Admin required." }
  }
  await adminReviewJob({
    jobId: String(formData.get("jobId") ?? ""),
    adminId: session.admin.id,
    adminEmail: session.admin.email,
    approve: String(formData.get("approve") ?? "") === "1",
    note: String(formData.get("note") ?? "") || undefined,
  })
  revalidatePath("/dashboard/marketplace")
  return { ok: true as const }
}

export async function adminReviewListingAction(formData: FormData) {
  const session = await requireEditor()
  if (!session?.admin?.id) {
    return { ok: false as const, message: "Admin required." }
  }
  await adminReviewListing({
    listingId: String(formData.get("listingId") ?? ""),
    adminId: session.admin.id,
    adminEmail: session.admin.email,
    approve: String(formData.get("approve") ?? "") === "1",
    note: String(formData.get("note") ?? "") || undefined,
  })
  revalidatePath("/dashboard/marketplace")
  return { ok: true as const }
}

export async function adminRecomputeLeaderboardAction() {
  const session = await requireEditor()
  if (!session?.admin?.id) {
    return { ok: false as const, message: "Admin required." }
  }
  const periodKey = new Date().toISOString().slice(0, 7)
  await recomputeLeaderboard(periodKey)
  revalidatePath("/dashboard/marketplace")
  revalidatePath("/community")
  return { ok: true as const, periodKey }
}

export async function computeValuationAction() {
  const session = await requireSuperAdministrator()
  if (!session?.admin?.id) {
    return { ok: false as const, message: "Super Administrator required." }
  }
  const snapshot = await computeValuation({
    adminId: session.admin.id,
    adminEmail: session.admin.email,
  })
  revalidatePath("/dashboard/bi")
  revalidatePath("/dashboard/bi/valuation")
  return { ok: true as const, snapshot }
}

export async function generateInsightsAction() {
  const session = await requireSuperAdministrator()
  if (!session?.admin?.id) {
    return { ok: false as const, message: "Super Administrator required." }
  }
  const insightText = await generateGrowthInsights({
    adminId: session.admin.id,
    adminEmail: session.admin.email,
  })
  revalidatePath("/dashboard/bi")
  return { ok: true as const, insightText }
}

// Keep submit/review helpers exported for pages that call them directly
export { submitJobForReview, submitListingForReview }
