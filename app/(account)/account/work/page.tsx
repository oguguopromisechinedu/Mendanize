import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { requirePublicUser } from "@/features/authentication/server"
import { applyToJobAction } from "@/features/growth"
import {
  OnboardingBanner,
  resolveHiringNotice,
} from "@/features/growth/components/onboarding-banner"
import {
  hasActiveClientFlag,
  isStripeConnectConfigured,
  listOpenJobs,
} from "@/services/marketplace"
import { getOrganizationForUser } from "@/services/organization"
import { Button } from "@/components/ui/button"

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
  const [jobs, isClient, org] = await Promise.all([
    listOpenJobs(),
    hasActiveClientFlag(session.user.id),
    getOrganizationForUser(session.user.id),
  ])
  const connectReady = isStripeConnectConfigured()
  const hasEmployerAccount = Boolean(org) || isClient
  const notice = resolveHiringNotice({
    onboarded: params.onboarded,
    error: params.error,
  })

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      {notice ? <OnboardingBanner notice={notice} /> : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
            Work Marketplace
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Jobs and contracts use Stripe Connect — separate from subscription
            billing.{" "}
            {!connectReady
              ? "Connect keys are not configured yet; funding stays pending."
              : null}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <Button asChild variant="outline" className="w-full rounded-xl sm:w-auto">
            <Link href="/account/employer">
              {hasEmployerAccount
                ? "Open employer dashboard"
                : "Enable client posting"}
            </Link>
          </Button>
          {hasEmployerAccount ? (
            <Button asChild className="w-full rounded-xl sm:w-auto">
              <Link href="/account/hiring">Client dashboard</Link>
            </Button>
          ) : (
            <Button asChild className="w-full rounded-xl sm:w-auto">
              <Link href="/account/company?intent=employer">
                Register company
              </Link>
            </Button>
          )}
        </div>
      </div>

      <ul className="space-y-6">
        {jobs.length === 0 ? (
          <li className="text-sm text-muted-foreground">
            No open jobs yet. Clients post from the hiring dashboard after Admin
            review.
          </li>
        ) : (
          jobs.map((job) => (
            <li
              key={job.id}
              id={`job-${job.id}`}
              className="border-t border-border/40 pt-6 first:border-0 first:pt-0"
            >
              <h2 className="text-lg font-medium">{job.title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {job.organizationName
                  ? `${job.organizationName} · `
                  : null}
                {job.clientName ?? "Client"}
                {job.budgetCents != null
                  ? ` · $${(job.budgetCents / 100).toFixed(0)}`
                  : null}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                {job.description}
              </p>
              {job.skills.length > 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  {job.skills.join(" · ")}
                </p>
              ) : null}
              <form action={applyToJobAction} className="mt-4 space-y-2">
                <input type="hidden" name="jobId" value={job.id} />
                <textarea
                  name="coverLetter"
                  required
                  rows={3}
                  placeholder="Cover letter / proposal"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                />
                <Button type="submit" size="sm" className="rounded-xl">
                  Apply
                </Button>
              </form>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
