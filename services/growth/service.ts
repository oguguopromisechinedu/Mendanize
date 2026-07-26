/**
 * Professional growth service — MES-039 hubs 1–4 (learning additions, building,
 * community extensions, career). Marketplaces live in `@/services/marketplace`.
 */

import "server-only"

import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma"
import { generateCredentialCode } from "@/services/ecosystem"
import { dispatch as dispatchNotification } from "@/services/notification"

function db() {
  return getPrisma()
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
}

// ─── Assessments & Certificates ───────────────────────────────────────────────

export async function getAssessmentForGuide(guideId: string) {
  if (!isDatabaseConfigured()) return null
  return db().assessment.findUnique({
    where: { guideId },
    include: {
      questions: { orderBy: { sortOrder: "asc" } },
    },
  })
}

export async function upsertAssessment(input: {
  guideId: string
  title: string
  passThreshold?: number
  questions: Array<{
    prompt: string
    choices: string[]
    correctIndex: number
  }>
}) {
  const existing = await db().assessment.findUnique({
    where: { guideId: input.guideId },
  })
  if (existing) {
    await db().assessmentQuestion.deleteMany({
      where: { assessmentId: existing.id },
    })
    return db().assessment.update({
      where: { id: existing.id },
      data: {
        title: input.title,
        passThreshold: input.passThreshold ?? 70,
        questions: {
          create: input.questions.map((q, i) => ({
            prompt: q.prompt,
            choices: q.choices,
            correctIndex: q.correctIndex,
            sortOrder: i,
          })),
        },
      },
      include: { questions: { orderBy: { sortOrder: "asc" } } },
    })
  }
  return db().assessment.create({
    data: {
      guideId: input.guideId,
      title: input.title,
      passThreshold: input.passThreshold ?? 70,
      questions: {
        create: input.questions.map((q, i) => ({
          prompt: q.prompt,
          choices: q.choices,
          correctIndex: q.correctIndex,
          sortOrder: i,
        })),
      },
    },
    include: { questions: { orderBy: { sortOrder: "asc" } } },
  })
}

export async function submitAssessmentAttempt(input: {
  assessmentId: string
  publicUserId: string
  answers: number[]
}) {
  const assessment = await db().assessment.findUnique({
    where: { id: input.assessmentId },
    include: { questions: { orderBy: { sortOrder: "asc" } }, guide: true },
  })
  if (!assessment || !assessment.active) {
    throw new Error("Assessment not found.")
  }
  const total = assessment.questions.length
  if (total === 0) throw new Error("Assessment has no questions.")
  let correct = 0
  assessment.questions.forEach((q, i) => {
    if (input.answers[i] === q.correctIndex) correct += 1
  })
  const scorePercent = Math.round((correct / total) * 100)
  const passed = scorePercent >= assessment.passThreshold

  const attempt = await db().assessmentAttempt.create({
    data: {
      assessmentId: assessment.id,
      publicUserId: input.publicUserId,
      scorePercent,
      passed,
      answersJson: JSON.stringify(input.answers),
    },
  })

  let certificateId: string | null = null
  if (passed) {
    const progress = await db().guideProgress.findUnique({
      where: {
        publicUserId_guideId: {
          publicUserId: input.publicUserId,
          guideId: assessment.guideId,
        },
      },
    })
    const guideComplete =
      Boolean(progress?.completedAt) || (progress?.percentComplete ?? 0) >= 100

    if (guideComplete) {
      const template = await db().certificateTemplate.findFirst({
        where: { guideId: assessment.guideId, status: "PUBLISHED" },
      })
      if (template) {
        const existing = await db().certificate.findUnique({
          where: {
            publicUserId_templateId: {
              publicUserId: input.publicUserId,
              templateId: template.id,
            },
          },
        })
        if (!existing) {
          const cert = await db().certificate.create({
            data: {
              publicUserId: input.publicUserId,
              templateId: template.id,
              guideId: assessment.guideId,
              credentialCode: generateCredentialCode(),
              assessmentAttemptId: attempt.id,
            },
          })
          certificateId = cert.id
          await dispatchNotification({
            channel: "in_app",
            template: "system.info",
            userId: input.publicUserId,
            type: "LEARNING",
            title: "Certificate earned",
            body: `You earned “${template.title}”.`,
            link: `/verify/${cert.credentialCode}`,
          }).catch(() => undefined)
        } else {
          certificateId = existing.id
        }
      }
    }
  }

  return { attempt, passed, scorePercent, certificateId }
}

export async function verifyCertificate(credentialCode: string) {
  if (!isDatabaseConfigured()) return null
  const row = await db().certificate.findUnique({
    where: { credentialCode },
    include: {
      template: true,
      publicUser: { select: { name: true, id: true } },
    },
  })
  if (!row) return null
  return {
    credentialCode: row.credentialCode,
    title: row.template.title,
    issuedAt: row.issuedAt.toISOString(),
    holderName: row.publicUser.name,
    guideId: row.guideId,
  }
}

export async function listCertificatesForUser(publicUserId: string) {
  if (!isDatabaseConfigured()) return []
  const rows = await db().certificate.findMany({
    where: { publicUserId },
    orderBy: { issuedAt: "desc" },
    include: { template: true },
  })
  return rows.map((r) => ({
    id: r.id,
    title: r.template.title,
    credentialCode: r.credentialCode,
    issuedAt: r.issuedAt.toISOString(),
    verifyPath: `/verify/${r.credentialCode}`,
  }))
}

// ─── Prompt library & Notes ───────────────────────────────────────────────────

export async function listPromptLibrary(publicUserId: string) {
  if (!isDatabaseConfigured()) return []
  return db().promptLibraryEntry.findMany({
    where: { publicUserId },
    orderBy: { updatedAt: "desc" },
  })
}

export async function createPromptEntry(input: {
  publicUserId: string
  title: string
  body: string
  tags?: string[]
  folder?: string | null
}) {
  return db().promptLibraryEntry.create({
    data: {
      publicUserId: input.publicUserId,
      title: input.title.trim(),
      body: input.body.trim(),
      tags: input.tags ?? [],
      folder: input.folder ?? null,
    },
  })
}

export async function deletePromptEntry(id: string, publicUserId: string) {
  await db().promptLibraryEntry.deleteMany({ where: { id, publicUserId } })
}

export async function listLearnerNotes(publicUserId: string) {
  if (!isDatabaseConfigured()) return []
  return db().learnerNote.findMany({
    where: { publicUserId },
    orderBy: { updatedAt: "desc" },
  })
}

export async function createLearnerNote(input: {
  publicUserId: string
  title: string
  body: string
  guideId?: string | null
  lessonId?: string | null
}) {
  return db().learnerNote.create({
    data: {
      publicUserId: input.publicUserId,
      title: input.title.trim(),
      body: input.body.trim(),
      guideId: input.guideId ?? null,
      lessonId: input.lessonId ?? null,
    },
  })
}

export async function deleteLearnerNote(id: string, publicUserId: string) {
  await db().learnerNote.deleteMany({ where: { id, publicUserId } })
}

// ─── Mentorship / Challenges / Leaderboards ───────────────────────────────────

export async function requestMentorship(input: {
  mentorId: string
  menteeId: string
  note?: string
}) {
  if (input.mentorId === input.menteeId) {
    throw new Error("You cannot mentor yourself.")
  }
  return db().mentorshipRelationship.upsert({
    where: {
      mentorId_menteeId: {
        mentorId: input.mentorId,
        menteeId: input.menteeId,
      },
    },
    create: {
      mentorId: input.mentorId,
      menteeId: input.menteeId,
      note: input.note ?? null,
      status: "REQUESTED",
    },
    update: {
      note: input.note ?? null,
      status: "REQUESTED",
    },
  })
}

export async function respondMentorship(input: {
  id: string
  mentorId: string
  accept: boolean
}) {
  return db().mentorshipRelationship.updateMany({
    where: { id: input.id, mentorId: input.mentorId, status: "REQUESTED" },
    data: { status: input.accept ? "ACTIVE" : "DECLINED" },
  })
}

export async function listMentorshipsForUser(publicUserId: string) {
  if (!isDatabaseConfigured()) return { asMentor: [], asMentee: [] }
  const [asMentor, asMentee] = await Promise.all([
    db().mentorshipRelationship.findMany({
      where: { mentorId: publicUserId },
      orderBy: { updatedAt: "desc" },
    }),
    db().mentorshipRelationship.findMany({
      where: { menteeId: publicUserId },
      orderBy: { updatedAt: "desc" },
    }),
  ])
  return { asMentor, asMentee }
}

export async function listOpenChallenges() {
  if (!isDatabaseConfigured()) return []
  return db().challenge.findMany({
    where: { status: "OPEN" },
    orderBy: { endsAt: "asc" },
  })
}

export async function createChallenge(input: {
  title: string
  prompt: string
  category?: string
  startsAt?: Date | null
  endsAt?: Date | null
  open?: boolean
}) {
  let slug = slugify(input.title) || `challenge-${Date.now()}`
  let n = 0
  while (await db().challenge.findUnique({ where: { slug } })) {
    n += 1
    slug = `${slugify(input.title)}-${n}`
  }
  return db().challenge.create({
    data: {
      title: input.title.trim(),
      slug,
      prompt: input.prompt.trim(),
      category: input.category ?? null,
      startsAt: input.startsAt ?? null,
      endsAt: input.endsAt ?? null,
      status: input.open ? "OPEN" : "DRAFT",
    },
  })
}

export async function submitChallengeEntry(input: {
  challengeId: string
  publicUserId: string
  body: string
}) {
  const challenge = await db().challenge.findUnique({
    where: { id: input.challengeId },
  })
  if (!challenge || challenge.status !== "OPEN") {
    throw new Error("Challenge is not open.")
  }
  return db().challengeSubmission.upsert({
    where: {
      challengeId_publicUserId: {
        challengeId: input.challengeId,
        publicUserId: input.publicUserId,
      },
    },
    create: {
      challengeId: input.challengeId,
      publicUserId: input.publicUserId,
      body: input.body.trim(),
    },
    update: { body: input.body.trim(), status: "SUBMITTED" },
  })
}

export async function recomputeLeaderboard(periodKey: string) {
  if (!isDatabaseConfigured()) return []
  const profiles = await db().communityProfile.findMany({
    select: { publicUserId: true, reputation: true },
  })
  const certCounts = await db().certificate.groupBy({
    by: ["publicUserId"],
    _count: { _all: true },
  })
  const jobsDone = await db().contract.groupBy({
    by: ["workerId"],
    where: { status: "COMPLETED" },
    _count: { _all: true },
  })
  const sales = await db().marketplacePurchase.groupBy({
    by: ["listingId"],
    where: { status: { in: ["succeeded", "completed", "paid"] } },
    _count: { _all: true },
  })
  const listingCreators = await db().marketplaceListing.findMany({
    where: { id: { in: sales.map((s) => s.listingId) } },
    select: { id: true, creatorId: true },
  })
  const salesByCreator = new Map<string, number>()
  for (const s of sales) {
    const creator = listingCreators.find((l) => l.id === s.listingId)?.creatorId
    if (!creator) continue
    salesByCreator.set(
      creator,
      (salesByCreator.get(creator) ?? 0) + s._count._all,
    )
  }

  const scoreMap = new Map<string, number>()
  for (const p of profiles) {
    scoreMap.set(p.publicUserId, p.reputation)
  }
  for (const c of certCounts) {
    scoreMap.set(
      c.publicUserId,
      (scoreMap.get(c.publicUserId) ?? 0) + c._count._all * 25,
    )
  }
  for (const j of jobsDone) {
    scoreMap.set(j.workerId, (scoreMap.get(j.workerId) ?? 0) + j._count._all * 40)
  }
  for (const [creatorId, count] of Array.from(salesByCreator.entries())) {
    scoreMap.set(creatorId, (scoreMap.get(creatorId) ?? 0) + count * 30)
  }

  const ranked = Array.from(scoreMap.entries())
    .map(([publicUserId, score]) => ({ publicUserId, score }))
    .sort((a, b) => b.score - a.score)

  await db().leaderboardEntry.deleteMany({ where: { periodKey } })
  if (ranked.length === 0) return []

  await db().leaderboardEntry.createMany({
    data: ranked.map((r, i) => ({
      periodKey,
      publicUserId: r.publicUserId,
      score: r.score,
      rank: i + 1,
    })),
  })

  for (const r of ranked.slice(0, 200)) {
    await db().reputationScore.upsert({
      where: { publicUserId: r.publicUserId },
      create: {
        publicUserId: r.publicUserId,
        total: r.score,
        breakdownJson: JSON.stringify({ periodKey, source: "recompute" }),
      },
      update: {
        total: r.score,
        breakdownJson: JSON.stringify({ periodKey, source: "recompute" }),
        computedAt: new Date(),
      },
    })
  }

  return ranked.slice(0, 50)
}

export async function getLeaderboard(periodKey: string, limit = 25) {
  if (!isDatabaseConfigured()) return []
  return db().leaderboardEntry.findMany({
    where: { periodKey },
    orderBy: { rank: "asc" },
    take: limit,
  })
}

// ─── Career Hub ───────────────────────────────────────────────────────────────

export async function getOrCreateCareerProfile(publicUserId: string) {
  if (!isDatabaseConfigured()) return null
  const existing = await db().careerProfile.findUnique({
    where: { publicUserId },
    include: { resumeVersions: { orderBy: { createdAt: "desc" }, take: 5 } },
  })
  if (existing) return existing
  return db().careerProfile.create({
    data: { publicUserId },
    include: { resumeVersions: true },
  })
}

export async function updateCareerProfile(input: {
  publicUserId: string
  headline?: string | null
  summary?: string | null
  targetRole?: string | null
  location?: string | null
  skills?: string[]
  portfolioProjectIds?: string[]
}) {
  await getOrCreateCareerProfile(input.publicUserId)
  return db().careerProfile.update({
    where: { publicUserId: input.publicUserId },
    data: {
      ...(input.headline !== undefined ? { headline: input.headline } : {}),
      ...(input.summary !== undefined ? { summary: input.summary } : {}),
      ...(input.targetRole !== undefined ? { targetRole: input.targetRole } : {}),
      ...(input.location !== undefined ? { location: input.location } : {}),
      ...(input.skills !== undefined ? { skills: input.skills } : {}),
      ...(input.portfolioProjectIds !== undefined
        ? { portfolioProjectIds: input.portfolioProjectIds }
        : {}),
    },
    include: { resumeVersions: { orderBy: { createdAt: "desc" }, take: 5 } },
  })
}

export async function saveResumeVersion(input: {
  publicUserId: string
  label: string
  contentMarkdown: string
}) {
  const profile = await getOrCreateCareerProfile(input.publicUserId)
  if (!profile) throw new Error("Career profile unavailable.")
  return db().resumeVersion.create({
    data: {
      careerProfileId: profile.id,
      label: input.label.trim(),
      contentMarkdown: input.contentMarkdown,
    },
  })
}

export async function startInterviewSession(input: {
  publicUserId: string
  targetRole?: string
  conversationId?: string
}) {
  return db().interviewSession.create({
    data: {
      publicUserId: input.publicUserId,
      targetRole: input.targetRole ?? null,
      conversationId: input.conversationId ?? null,
    },
  })
}

export async function getLatestCareerReadiness(publicUserId: string) {
  if (!isDatabaseConfigured()) {
    return { score: 0, breakdown: {} as Record<string, number>, gaps: [] as string[] }
  }
  const latest = await db().careerReadinessScore.findFirst({
    where: { publicUserId },
    orderBy: { computedAt: "desc" },
  })
  const gapRow = await db().skillGapResult.findFirst({
    where: { publicUserId },
    orderBy: { computedAt: "desc" },
  })
  if (!latest) {
    return { score: 0, breakdown: {} as Record<string, number>, gaps: [] as string[] }
  }
  let breakdown: Record<string, number> = {}
  try {
    breakdown = JSON.parse(latest.breakdownJson) as Record<string, number>
  } catch {
    breakdown = {}
  }
  let gaps: string[] = []
  try {
    gaps = gapRow ? (JSON.parse(gapRow.gapsJson) as string[]) : []
  } catch {
    gaps = []
  }
  return { score: latest.score, breakdown, gaps }
}

export async function computeCareerReadiness(publicUserId: string) {
  if (!isDatabaseConfigured()) {
    return { score: 0, breakdown: {} as Record<string, number> }
  }
  const [certs, attempts, guides, projects, profile] = await Promise.all([
    db().certificate.count({ where: { publicUserId } }),
    db().assessmentAttempt.count({ where: { publicUserId, passed: true } }),
    db().guideProgress.count({
      where: { publicUserId, OR: [{ completedAt: { not: null } }, { percentComplete: { gte: 100 } }] },
    }),
    db().showcaseProject.count({ where: { publicUserId, hidden: false } }),
    db().careerProfile.findUnique({ where: { publicUserId } }),
  ])

  const breakdown = {
    certificates: Math.min(30, certs * 10),
    assessments: Math.min(20, attempts * 5),
    guides: Math.min(25, guides * 8),
    projects: Math.min(15, projects * 5),
    profile: profile?.headline && profile.summary ? 10 : profile ? 5 : 0,
  }
  const score = Object.values(breakdown).reduce((a, b) => a + b, 0)

  await db().careerReadinessScore.create({
    data: {
      publicUserId,
      score,
      breakdownJson: JSON.stringify(breakdown),
    },
  })

  const gaps: string[] = []
  if (certs === 0) gaps.push("Earn a verifiable certificate")
  if (attempts === 0) gaps.push("Pass a guide assessment")
  if (guides < 2) gaps.push("Complete more learning guides")
  if (projects === 0) gaps.push("Publish a showcase project")
  if (!profile?.headline) gaps.push("Add a career headline")

  await db().skillGapResult.create({
    data: {
      publicUserId,
      targetRole: profile?.targetRole ?? "General",
      gapsJson: JSON.stringify(gaps),
    },
  })

  return { score, breakdown, gaps }
}
