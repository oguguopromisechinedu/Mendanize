import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { requirePublicUser } from "@/features/authentication/server"
import {
  applyToJobAction,
  enableClientFlagAction,
} from "@/features/growth"
import {
  hasActiveClientFlag,
  listOpenJobs,
} from "@/services/marketplace"
import { Button } from "@/components/ui/button"
import { isStripeConnectConfigured } from "@/services/marketplace"

export const metadata: Metadata = {
  title: "Work Marketplace",
  robots: { index: false },
}

export default async function Page() {
  const session = await requirePublicUser()
  if (!session?.user?.id) redirect(`/sign-in?callbackUrl=${encodeURIComponent("/account/work")}`)

  const [jobs, isClient] = await Promise.all([
    listOpenJobs(),
    hasActiveClientFlag(session.user.id),
  ])
  const connectReady = isStripeConnectConfigured()

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
            Work Marketplace
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Jobs and contracts use Stripe Connect — separate from subscription
            billing. {!connectReady ? "Connect keys are not configured yet; funding stays pending." : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isClient ? (
            <form action={enableClientFlagAction}>
              <Button type="submit" variant="outline" className="rounded-xl">
                Enable client posting
              </Button>
            </form>
          ) : null}
          <Button asChild className="rounded-xl">
            <Link href="/account/hiring">Client dashboard</Link>
          </Button>
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
            <li key={job.id} className="border-t border-border/40 pt-6 first:border-0 first:pt-0">
              <h2 className="text-lg font-medium">{job.title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
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
