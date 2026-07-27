import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { requirePublicUser } from "@/features/authentication/server"
import { acceptApplicationAction, createJobAction } from "@/features/growth"
import {
  OnboardingBanner,
  resolveHiringNotice,
} from "@/features/growth/components/onboarding-banner"
import {
  ensureClientFlag,
  listApplicationsForJob,
  listJobsForClient,
} from "@/services/marketplace"
import { getOrganizationForUser } from "@/services/organization"
import { Button } from "@/components/ui/button"
import { getPrisma, isDatabaseConfigured } from "@/lib/db/prisma"
import { isMissingSchemaError } from "@/lib/db/safe-query"

export const metadata: Metadata = {
  title: "Hiring",
  robots: { index: false },
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Page({ searchParams }: PageProps) {
  const session = await requirePublicUser()
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent("/account/hiring")}`)
  }

  const params = await searchParams
  const org = await getOrganizationForUser(session.user.id)
  if (!org) {
    redirect("/account/company?intent=employer")
  }

  await ensureClientFlag(session.user.id)

  const jobs = await listJobsForClient(session.user.id)
  const appsByJob: Record<string, Awaited<ReturnType<typeof listApplicationsForJob>>> =
    {}
  for (const job of jobs) {
    appsByJob[job.id] = await listApplicationsForJob(job.id, session.user.id)
  }

  let contracts: Array<{ id: string; status: string; jobId: string }> = []
  if (isDatabaseConfigured()) {
    try {
      contracts = await getPrisma().contract.findMany({
        where: { clientId: session.user.id },
        select: { id: true, status: true, jobId: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      })
    } catch (error) {
      if (!isMissingSchemaError(error)) throw error
    }
  }

  const notice = resolveHiringNotice({
    onboarded: params.onboarded,
    error: params.error,
  })

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-8">
      {notice ? <OnboardingBanner notice={notice} /> : null}
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Employer dashboard
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Post jobs for Admin review before they go live. This stays under{" "}
          <code className="text-xs">/account</code> — Client flag never opens{" "}
          <code className="text-xs">/dashboard</code>.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/account/work">Browse open jobs</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/account/company">
              {org ? org.name : "Company profile"}
            </Link>
          </Button>
        </div>
      </div>

      <form action={createJobAction} className="space-y-3 border-t border-border/60 pt-8">
        <h2 className="text-lg font-medium">Post a job</h2>
        {org ? (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" name="organizationId" value={org.id} defaultChecked />
            Post as {org.name}
            {org.verificationStatus === "VERIFIED" ? " (verified)" : ""}
          </label>
        ) : (
          <p className="text-xs text-muted-foreground">
            Optional: create a{" "}
            <Link href="/account/company" className="underline-offset-4 hover:underline">
              company profile
            </Link>{" "}
            to brand jobs with your organization.
          </p>
        )}
        <input
          name="title"
          required
          placeholder="Title"
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
        />
        <textarea
          name="description"
          required
          rows={5}
          placeholder="Description"
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          name="budgetCents"
          type="number"
          min={0}
          step={100}
          placeholder="Budget (cents)"
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
        />
        <Button type="submit" className="rounded-xl">
          Submit for Admin review
        </Button>
      </form>

      <section className="space-y-6 border-t border-border/60 pt-8">
        <h2 className="text-lg font-medium">Your jobs</h2>
        {jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No jobs yet.</p>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="space-y-3">
              <div>
                <h3 className="font-medium">{job.title}</h3>
                <p className="text-xs text-muted-foreground">
                  Status: {job.status}
                  {job.organizationName ? ` · ${job.organizationName}` : ""}
                  {job.reviewNote ? ` · ${job.reviewNote}` : ""}
                </p>
              </div>
              <ul className="space-y-2 pl-1">
                {(appsByJob[job.id] ?? []).map((app) => (
                  <li
                    key={app.id}
                    className="flex flex-wrap items-start justify-between gap-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        {app.applicantName ?? "Applicant"} · {app.status}
                      </p>
                      <p className="text-muted-foreground">{app.coverLetter}</p>
                    </div>
                    {app.status === "SUBMITTED" || app.status === "SHORTLISTED" ? (
                      <form action={acceptApplicationAction}>
                        <input type="hidden" name="applicationId" value={app.id} />
                        <Button type="submit" size="sm" className="rounded-xl">
                          Accept
                        </Button>
                      </form>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      <section className="border-t border-border/60 pt-8">
        <h2 className="text-lg font-medium">Contracts</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {contracts.length === 0 ? (
            <li>No contracts yet.</li>
          ) : (
            contracts.map((c) => (
              <li key={c.id}>
                {c.id.slice(0, 8)}… · {c.status}
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  )
}
