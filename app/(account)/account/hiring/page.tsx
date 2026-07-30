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

  let contracts: Array<{
    id: string
    status: string
    jobId: string
    kind: string
    websiteLabel: string | null
    jobTitle: string
  }> = []
  if (isDatabaseConfigured()) {
    try {
      const rows = await getPrisma().contract.findMany({
        where: { clientId: session.user.id },
        select: {
          id: true,
          status: true,
          jobId: true,
          kind: true,
          websiteLabel: true,
          job: { select: { title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      })
      contracts = rows.map((c) => ({
        id: c.id,
        status: c.status,
        jobId: c.jobId,
        kind: c.kind,
        websiteLabel: c.websiteLabel,
        jobTitle: c.job.title,
      }))
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
            <Link href="/account/hiring/disputes">Disputes</Link>
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
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            name="category"
            placeholder="Category (e.g. Web Development)"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          <select
            name="jobType"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            defaultValue=""
          >
            <option value="">Job type</option>
            <option value="Fixed Price">Fixed Price</option>
            <option value="Hourly">Hourly</option>
            <option value="Contract">Contract</option>
            <option value="Full-time">Full-time</option>
          </select>
          <select
            name="workplaceType"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            defaultValue=""
          >
            <option value="">Workplace</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Onsite">Onsite</option>
          </select>
          <select
            name="experienceLevel"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            defaultValue=""
          >
            <option value="">Experience</option>
            <option value="Entry">Entry</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Expert">Expert</option>
          </select>
          <input
            name="location"
            placeholder="Location"
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
        </div>
        <input
          name="skills"
          placeholder="Skills (comma-separated, e.g. React, Node.js)"
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
                      <p className="mt-1 text-xs text-muted-foreground">
                        {app.bidCents != null
                          ? `Bid $${(app.bidCents / 100).toFixed(2)}`
                          : "No bid"}
                        {app.estimatedDays != null
                          ? ` · ${app.estimatedDays} day${app.estimatedDays === 1 ? "" : "s"}`
                          : ""}
                      </p>
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
        <ul className="mt-3 space-y-2 text-sm">
          {contracts.length === 0 ? (
            <li className="text-muted-foreground">No contracts yet.</li>
          ) : (
            contracts.map((c) => (
              <li key={c.id} className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <Link
                  href={`/account/work/contracts/${c.id}`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {c.websiteLabel ?? c.jobTitle}
                </Link>
                <span className="text-muted-foreground">
                  · {c.kind === "CONTINUATION" ? "maintenance" : "project"} ·{" "}
                  {c.status}
                </span>
                {c.status === "COMPLETED" ? (
                  <Link
                    href={`/account/work/contracts/${c.id}`}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Hire again
                  </Link>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  )
}
