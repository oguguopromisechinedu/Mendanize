import Link from "next/link"
import {
  BadgeCheck,
  Briefcase,
  Building2,
  MapPin,
  Search,
  Users,
  Wallet,
} from "lucide-react"

import { applyToJobAction } from "@/features/growth"
import type { JobPostingRecord } from "@/services/marketplace"
import { Button } from "@/components/ui/button"
import { MendanizeRobot3D } from "@/components/brand/MendanizeRobot3D"
import { cn } from "@/lib/utils"

const JOB_CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "AI & Machine Learning",
  "Design & Creative",
  "Writing & Translation",
  "Data Science",
] as const

function money(cents: number | null | undefined) {
  if (cents == null) return "Budget negotiable"
  return `$${(cents / 100).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`
}

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `${Math.max(1, mins)}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 48) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function WorkMarketplaceView({
  jobs,
  talent,
  tab,
  query,
  category,
  stats,
  hasEmployerAccount,
}: {
  jobs: JobPostingRecord[]
  talent: Array<{
    id: string
    name: string | null
    title: string | null
    skills: string[]
    completedJobs: number
  }>
  tab: "jobs" | "talent"
  query?: string
  category?: string
  stats: {
    activeJobs: number
    companiesHiring: number
    freelancers: number
    projectsCompleted: number
  }
  hasEmployerAccount: boolean
}) {
  const featured = jobs.filter((j) => j.featured).slice(0, 5)
  const list = jobs

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
            Work Marketplace
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Find work, hire talent, and build amazing things together — with
            escrow-protected milestones inside Mendanize.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/account/employer">
              {hasEmployerAccount ? "Employer dashboard" : "Enable client posting"}
            </Link>
          </Button>
          <Button asChild className="rounded-xl">
            <Link href={hasEmployerAccount ? "/account/hiring" : "/account/company?intent=employer"}>
              Post a Job
            </Link>
          </Button>
        </div>
      </header>

      <section className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-background to-primary/10">
        <div className="grid items-center gap-6 p-6 lg:grid-cols-[1.25fr_0.75fr] lg:p-10">
          <div className="space-y-5">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight sm:text-3xl">
              Find the right <span className="text-primary">work</span>. Hire the
              right <span className="text-primary">talent</span>.
            </h2>
            <div className="flex gap-4 border-b border-border/50 text-sm">
              <Link
                href="/account/work?tab=jobs"
                className={cn(
                  "border-b-2 pb-2",
                  tab === "jobs"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground",
                )}
              >
                Find Jobs
              </Link>
              <Link
                href="/account/work?tab=talent"
                className={cn(
                  "border-b-2 pb-2",
                  tab === "talent"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground",
                )}
              >
                Find Talent
              </Link>
            </div>
            <form method="get" className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <input type="hidden" name="tab" value={tab} />
              {category ? (
                <input type="hidden" name="category" value={category} />
              ) : null}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="query"
                  defaultValue={query ?? ""}
                  placeholder={
                    tab === "jobs"
                      ? "Search jobs by title, skill, or keyword…"
                      : "Search talent by name or skill…"
                  }
                  className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm outline-none ring-primary/40 focus:ring-2"
                />
              </div>
              <Button type="submit" className="rounded-xl">
                {tab === "jobs" ? "Search Jobs" : "Search Talent"}
              </Button>
            </form>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Active Jobs", value: stats.activeJobs, icon: Briefcase },
                {
                  label: "Companies Hiring",
                  value: stats.companiesHiring,
                  icon: Building2,
                },
                { label: "Freelancers", value: stats.freelancers, icon: Users },
                {
                  label: "Projects Completed",
                  value: stats.projectsCompleted,
                  icon: Wallet,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border/50 bg-background/40 px-3 py-2"
                >
                  <stat.icon className="mb-1 size-3.5 text-primary" />
                  <p className="text-lg font-semibold tabular-nums">
                    {stat.value.toLocaleString()}+
                  </p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative mx-auto hidden h-56 w-full max-w-sm lg:block">
            <MendanizeRobot3D className="h-full w-full" />
          </div>
        </div>
      </section>

      {tab === "jobs" ? (
        <>
          <section className="space-y-3">
            <h2 className="text-lg font-medium">Browse Jobs by Category</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {JOB_CATEGORIES.map((cat) => {
                const active = category === cat
                const params = new URLSearchParams({ tab: "jobs", category: cat })
                if (query) params.set("query", query)
                return (
                  <Link
                    key={cat}
                    href={`/account/work?${params.toString()}`}
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-sm transition",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 bg-card/40 hover:border-primary/30",
                    )}
                  >
                    {cat}
                  </Link>
                )
              })}
            </div>
          </section>

          {featured.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-lg font-medium">Featured Jobs</h2>
              <div className="space-y-3">
                {featured.map((job) => (
                  <JobCard key={job.id} job={job} featured />
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-4">
            <h2 className="text-lg font-medium">Open Jobs</h2>
            {list.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border/60 px-4 py-10 text-center text-sm text-muted-foreground">
                No open jobs yet. Clients post from the hiring dashboard after
                Admin review.
              </p>
            ) : (
              <div className="space-y-3">
                {list.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Find Talent</h2>
          {talent.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border/60 px-4 py-10 text-center text-sm text-muted-foreground">
              Talent profiles appear as freelancers complete career profiles and
              contracts.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {talent.map((person) => (
                <article
                  key={person.id}
                  className="rounded-2xl border border-border/50 bg-card/60 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                      {(person.name ?? "M").slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium">{person.name ?? "Freelancer"}</h3>
                      <p className="text-xs text-muted-foreground">
                        {person.title ?? "Professional"}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {person.completedJobs} completed job
                    {person.completedJobs === 1 ? "" : "s"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {person.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <Button asChild size="sm" className="mt-4 w-full rounded-xl">
                    <Link href="/account/messages">Message</Link>
                  </Button>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

function JobCard({
  job,
  featured,
}: {
  job: JobPostingRecord
  featured?: boolean
}) {
  return (
    <article
      id={`job-${job.id}`}
      className="rounded-2xl border border-border/50 bg-card/60 p-4 transition hover:border-primary/30"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium">{job.title}</h3>
            {featured ? (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] text-primary">
                Featured
              </span>
            ) : null}
            {job.jobType ? (
              <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                {job.jobType}
              </span>
            ) : null}
          </div>
          <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              {job.organizationName ?? job.clientName ?? "Client"}
              {job.organizationName ? (
                <BadgeCheck className="size-3.5 text-sky-400" />
              ) : null}
            </span>
            {job.workplaceType || job.location ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" />
                {job.workplaceType ?? job.location}
              </span>
            ) : null}
            <span>{timeAgo(job.publishedAt ?? job.createdAt)}</span>
            {job.proposalCount != null ? (
              <span>{job.proposalCount} proposals</span>
            ) : null}
          </p>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {job.description}
          </p>
          <div className="flex flex-wrap gap-1">
            {job.skills.slice(0, 6).map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 lg:w-56">
          <p className="text-sm font-semibold tabular-nums">
            {money(job.budgetCents)}
          </p>
          <form action={applyToJobAction} className="space-y-2">
            <input type="hidden" name="jobId" value={job.id} />
            <textarea
              name="coverLetter"
              required
              rows={3}
              placeholder="Cover letter"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
            />
            <input
              name="bidDollars"
              type="number"
              min={0}
              step={1}
              placeholder="Your bid ($)"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
            />
            <input
              name="estimatedDays"
              type="number"
              min={1}
              step={1}
              placeholder="Days to deliver"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
            />
            <Button type="submit" size="sm" className="w-full rounded-xl">
              Submit proposal
            </Button>
          </form>
        </div>
      </div>
    </article>
  )
}
