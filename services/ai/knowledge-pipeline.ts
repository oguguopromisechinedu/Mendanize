/**
 * MES-031 — AI Knowledge Generation Pipeline (backend).
 * One-way Public→Admin trigger: enqueue only; never expose drafts to PublicUser.
 */
import "server-only"

import { createHash } from "crypto"
import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma"
import { logger } from "@/lib/logger"
import { search } from "@/services/search"
import { recordAudit } from "@/services/admin/audit"

export type KnowledgeHit = {
  id: string
  title: string
  href: string
  type: string
}

/** Search published knowledge before generation (MES-031 step 2). */
export async function searchExistingKnowledge(
  question: string,
): Promise<KnowledgeHit[]> {
  try {
    const result = await search({
      query: question,
      page: 1,
      pageSize: 5,
      types: ["article", "guide", "ai_tool"],
    })
    const hits = result.hits?.length
      ? result.hits
      : result.groups.flatMap((g) => g.hits)
    return hits.slice(0, 5).map((h) => ({
      id: h.id,
      title: h.title,
      href: h.href,
      type: h.type,
    }))
  } catch (error) {
    logger.warn("MES-031 knowledge search failed", {
      message: error instanceof Error ? error.message : String(error),
    })
    return []
  }
}

function fingerprint(seed: string): string {
  return createHash("sha256").update(seed).digest("hex").slice(0, 24)
}

/**
 * Enqueue an AI draft job when no suitable knowledge exists.
 * Fire-and-forget safe — never blocks the Ask response.
 */
export async function enqueueKnowledgeGeneration(input: {
  question: string
  /** Optional anonymized seed (IP bucket / request id) — never PublicUser.id */
  sourceSeed?: string
}): Promise<{ jobId: string } | null> {
  if (!isDatabaseConfigured()) return null
  const question = input.question.trim()
  if (!question) return null

  try {
    const prisma = getPrisma()

    // Near-duplicate: recent queued/processing jobs with same question
    const recent = await prisma.aIGenerationJob.findFirst({
      where: {
        question: { equals: question, mode: "insensitive" },
        status: { in: ["QUEUED", "PROCESSING"] },
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    })
    if (recent) return { jobId: recent.id }

    // Near-duplicate published articles — record merge suggestion instead
    const published = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: question.slice(0, 48), mode: "insensitive" } },
          { excerpt: { contains: question.slice(0, 48), mode: "insensitive" } },
        ],
      },
      take: 3,
      select: { id: true, title: true },
    })

    const job = await prisma.aIGenerationJob.create({
      data: {
        question,
        sourceFingerprint: input.sourceSeed
          ? fingerprint(input.sourceSeed)
          : null,
        status: published.length > 0 ? "MERGED" : "QUEUED",
        duplicates: {
          create: published.map((a) => ({
            existingArticleId: a.id,
            similarityNote: `Possible overlap with “${a.title}”`,
          })),
        },
      },
    })

    if (published.length === 0) {
      // Process asynchronously — do not await in Ask path
      void processKnowledgeJob(job.id).catch((error) => {
        logger.error("MES-031 job processing failed", {
          jobId: job.id,
          message: error instanceof Error ? error.message : String(error),
        })
      })
    }

    return { jobId: job.id }
  } catch (error) {
    logger.error("MES-031 enqueue failed", {
      message: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || `ai-draft-${Date.now()}`
  )
}

/** Turn a queued job into an Article with status AI_DRAFT (never auto-publishes). */
export async function processKnowledgeJob(jobId: string): Promise<void> {
  if (!isDatabaseConfigured()) return
  const prisma = getPrisma()
  const job = await prisma.aIGenerationJob.findUnique({ where: { id: jobId } })
  if (!job || job.status !== "QUEUED") return

  await prisma.aIGenerationJob.update({
    where: { id: jobId },
    data: { status: "PROCESSING" },
  })

  try {
    const admin =
      (await prisma.admin.findFirst({
        where: { active: true },
        orderBy: { createdAt: "asc" },
      })) ?? null
    if (!admin) {
      await prisma.aIGenerationJob.update({
        where: { id: jobId },
        data: {
          status: "FAILED",
          errorMessage: "No active Admin available to own AI Draft",
        },
      })
      return
    }

    const title =
      job.question.length > 80
        ? `${job.question.slice(0, 77)}…`
        : job.question.replace(/\?*$/, "").trim() || "AI Knowledge Draft"
    let slug = slugify(title)
    const clash = await prisma.article.findUnique({ where: { slug } })
    if (clash) slug = `${slug}-${Date.now().toString(36)}`

    const content = [
      `# ${title}`,
      "",
      "> AI Draft — generated from an Ask Mendanize knowledge gap. Review before publish.",
      "",
      "## Summary",
      "",
      `This draft was created because visitors asked: “${job.question}”. Expand with accurate Mendanize voice, examples, and sources.`,
      "",
      "## Introduction",
      "",
      "TODO: write a clear introduction for learners.",
      "",
      "## Main sections",
      "",
      "TODO: add structured sections, examples, and best practices.",
      "",
      "## FAQ",
      "",
      `- **Q:** ${job.question}`,
      "- **A:** TODO — answer after editorial review.",
      "",
      "## Conclusion",
      "",
      "TODO: summarize key takeaways and next steps.",
    ].join("\n")

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        excerpt: `AI Draft answering: ${job.question.slice(0, 140)}`,
        content,
        status: "AI_DRAFT",
        authorId: admin.id,
        readingTimeMin: 5,
        seoTitle: title,
        seoDescription: `Draft educational article for: ${job.question.slice(0, 120)}`,
      },
    })

    await prisma.aIGenerationJob.update({
      where: { id: jobId },
      data: { status: "COMPLETED", articleId: article.id },
    })

    await recordAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      action: "ai_knowledge_draft_created",
      entityType: "article",
      entityId: article.id,
      summary: `AI Knowledge Draft queued from Ask gap: “${title}”`,
    }).catch(() => undefined)

    // Best-effort: audit already recorded; notification service may not expose createAdminNotification yet
    logger.info("MES-031 AI Draft ready for review", {
      articleId: article.id,
      jobId,
    })
  } catch (error) {
    await prisma.aIGenerationJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        errorMessage:
          error instanceof Error ? error.message : "Draft creation failed",
      },
    })
    throw error
  }
}

export async function listAIKnowledgeQueue(limit = 50) {
  if (!isDatabaseConfigured()) return []
  return getPrisma().aIGenerationJob.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      article: { select: { id: true, title: true, slug: true, status: true } },
      duplicates: {
        include: {
          existingArticle: { select: { id: true, title: true, slug: true } },
        },
      },
    },
  })
}
