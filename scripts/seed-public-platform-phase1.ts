/**
 * Seed public platform Phase 1 CMS pages, glossary, and free resources.
 * Safe to re-run (upserts by slug).
 *
 * Usage: npx tsx scripts/seed-public-platform-phase1.ts
 */
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

import { getPrisma, isDatabaseConfigured, resetPrismaClient } from "../lib/db/prisma"
import { ensureCompanyPagesSeeded } from "../services/admin/pages"

function loadEnvFile(fileName: string) {
  const envPath = resolve(process.cwd(), fileName)
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, "utf-8").split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq < 0) continue
    const key = trimmed.slice(0, eq)
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = value
  }
}

async function main() {
  loadEnvFile(".env")
  loadEnvFile(".env.local")
  resetPrismaClient()

  if (!isDatabaseConfigured()) {
    console.error("DATABASE_URL not configured")
    process.exit(1)
  }

  await ensureCompanyPagesSeeded()
  console.log("Company CMS pages ensured")

  const prisma = getPrisma()

  const glossary = [
    {
      term: "Large Language Model",
      slug: "large-language-model",
      definition:
        "A neural network trained on large text corpora to predict and generate language.",
      category: "Foundations",
      seoTitle: "Large Language Model (LLM)",
      seoDescription: "What is a large language model?",
    },
    {
      term: "Prompt Engineering",
      slug: "prompt-engineering",
      definition:
        "The practice of designing inputs that steer AI models toward useful outputs.",
      category: "Prompting",
      seoTitle: "Prompt Engineering",
      seoDescription: "Definition of prompt engineering.",
    },
    {
      term: "Retrieval-Augmented Generation",
      slug: "retrieval-augmented-generation",
      definition:
        "A pattern that retrieves external documents and feeds them to a model as context before generation.",
      category: "Architecture",
      seoTitle: "RAG",
      seoDescription: "What is retrieval-augmented generation?",
    },
    {
      term: "Fine-tuning",
      slug: "fine-tuning",
      definition:
        "Further training a pretrained model on a narrower dataset to specialize its behavior.",
      category: "Training",
      seoTitle: "Fine-tuning",
      seoDescription: "What is model fine-tuning?",
    },
    {
      term: "Token",
      slug: "token",
      definition:
        "A unit of text (often a subword) that models use for input and output counting.",
      category: "Foundations",
      seoTitle: "Token",
      seoDescription: "What is a token in AI?",
    },
  ]

  for (const g of glossary) {
    await prisma.glossaryTerm.upsert({
      where: { slug: g.slug },
      create: {
        ...g,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
      update: {},
    })
  }
  console.log(`Glossary terms ensured (${glossary.length})`)

  const resources = [
    {
      title: "Prompt Engineering Cheat Sheet",
      slug: "prompt-engineering-cheat-sheet",
      type: "CHEATSHEET" as const,
      description: "A one-page reference for clearer prompts.",
      fileUrl: "/resources/prompt-engineering-cheat-sheet.pdf",
      category: "Prompting",
      tags: ["prompts", "beginner"],
      seoTitle: "Prompt Engineering Cheat Sheet",
      seoDescription: "Download a free prompting cheat sheet from Mendanize.",
    },
    {
      title: "AI Learning Checklist",
      slug: "ai-learning-checklist",
      type: "CHECKLIST" as const,
      description: "A practical checklist to start structured AI learning.",
      fileUrl: "/resources/ai-learning-checklist.pdf",
      category: "Learning",
      tags: ["checklist", "beginner"],
      seoTitle: "AI Learning Checklist",
      seoDescription: "Free checklist for starting AI learning on Mendanize.",
    },
  ]

  for (const r of resources) {
    await prisma.freeResource.upsert({
      where: { slug: r.slug },
      create: {
        ...r,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
      update: {},
    })
  }
  console.log(`Free resources ensured (${resources.length})`)
  console.log("Phase 1 public seed complete")
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    try {
      await getPrisma().$disconnect()
    } catch {
      /* ignore */
    }
  })
