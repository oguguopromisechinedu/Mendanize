import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { requirePublicUser } from "@/features/authentication/server"
import {
  OnboardingBanner,
  resolveHiringNotice,
} from "@/features/growth/components/onboarding-banner"
import { WorkMarketplaceView } from "@/features/marketplace/components/work-marketplace-view"
import {
  getWorkMarketplaceLiveStats,
  hasActiveClientFlag,
  listContractsForUser,
  listOpenJobs,
} from "@/services/marketplace"
import { getOrganizationForUser } from "@/services/organization"
import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma"
import { isMissingSchemaError } from "@/lib/db/safe-query"

export const metadata: Metadata = {
  title: "Work Marketplace",
  robots: { index: false },
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Page({ searchParams }: PageProps) {
  const session = await requirePublicUser()
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent("/account/work")}`)
  }

  const params = await searchParams
  const query = typeof params.query === "string" ? params.query : undefined
  const category =
    typeof params.category === "string" ? params.category : undefined
  const tab = params.tab === "talent" ? "talent" : "jobs"

  const [jobs, isClient, org, stats, contracts] = await Promise.all([
    listOpenJobs({ query, category }),
    hasActiveClientFlag(session.user.id),
    getOrganizationForUser(session.user.id),
    getWorkMarketplaceLiveStats(),
    listContractsForUser(session.user.id),
  ])
  const hasEmployerAccount = Boolean(org) || isClient
  const notice = resolveHiringNotice({
    onboarded: params.onboarded,
    error: params.error,
  })

  let talent: Array<{
    id: string
    name: string | null
    title: string | null
    skills: string[]
    completedJobs: number
  }> = []

  if (tab === "talent" && isDatabaseConfigured()) {
    try {
      const rows = await getPrisma().careerProfile.findMany({
        take: 24,
        orderBy: { updatedAt: "desc" },
        include: {
          publicUser: {
            select: {
              id: true,
              name: true,
              _count: {
                select: { contractsAsWorker: true },
              },
            },
          },
        },
      })
      talent = rows
        .filter((row) => {
          if (!query) return true
          const q = query.toLowerCase()
          return (
            row.publicUser.name?.toLowerCase().includes(q) ||
            row.headline?.toLowerCase().includes(q) ||
            row.skills.some((s) => s.toLowerCase().includes(q))
          )
        })
        .map((row) => ({
          id: row.publicUser.id,
          name: row.publicUser.name,
          title: row.headline,
          skills: row.skills,
          completedJobs: row.publicUser._count.contractsAsWorker,
        }))
    } catch (error) {
      if (!isMissingSchemaError(error)) throw error
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-8">
      {notice ? <OnboardingBanner notice={notice} /> : null}
      <WorkMarketplaceView
        jobs={jobs}
        talent={talent}
        tab={tab}
        query={query}
        category={category}
        stats={stats}
        hasEmployerAccount={hasEmployerAccount}
      />

      {contracts.length > 0 ? (
        <section className="space-y-3 border-t border-border/50 pt-8">
          <h2 className="text-lg font-medium">My project workspaces</h2>
          <ul className="space-y-2 text-sm">
            {contracts.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/account/work/contracts/${c.id}`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {c.websiteLabel ?? c.job.title}
                </Link>
                <span className="text-muted-foreground">
                  {" "}
                  · {c.kind === "CONTINUATION" ? "maintenance" : "project"} ·{" "}
                  {c.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
