import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { requireEditor } from "@/features/authentication/server"
import {
  adminRecomputeLeaderboardAction,
  adminReviewJobAction,
  adminReviewListingAction,
} from "@/features/growth"
import {
  getMarketplaceMetrics,
  listDisputedContracts,
  listPendingJobReviews,
  listPendingListingReviews,
} from "@/services/marketplace"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Marketplace",
  robots: { index: false },
}

export default async function Page() {
  const session = await requireEditor()
  if (!session?.admin?.id) redirect("/dashboard/login")

  const [jobs, listings, disputes, metrics] = await Promise.all([
    listPendingJobReviews(),
    listPendingListingReviews(),
    listDisputedContracts(),
    getMarketplaceMetrics(),
  ])

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Marketplace</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Job posting review, AI tool listing queue, and contract disputes.
          Listings cannot go live without Admin approval.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Pending jobs", value: metrics.pendingJobReviews },
          { label: "Pending listings", value: metrics.pendingListingReviews },
          { label: "Open jobs", value: metrics.openJobs },
          { label: "Approved listings", value: metrics.approvedListings },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border/60 px-4 py-3"
          >
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{card.value}</p>
          </div>
        ))}
      </div>

      <form action={adminRecomputeLeaderboardAction}>
        <Button type="submit" variant="outline" className="rounded-xl">
          Recompute reputation leaderboard
        </Button>
      </form>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Job posting review</h2>
        {jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Queue empty.</p>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="space-y-3 border-t border-border/50 pt-4"
            >
              <div>
                <h3 className="font-medium">{job.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {job.clientName ?? job.clientId}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                  {job.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={adminReviewJobAction}>
                  <input type="hidden" name="jobId" value={job.id} />
                  <input type="hidden" name="approve" value="1" />
                  <Button type="submit" size="sm" className="rounded-xl">
                    Approve
                  </Button>
                </form>
                <form action={adminReviewJobAction} className="flex gap-2">
                  <input type="hidden" name="jobId" value={job.id} />
                  <input type="hidden" name="approve" value="0" />
                  <input
                    name="note"
                    placeholder="Rejection note"
                    className="rounded-xl border border-border bg-background px-2 py-1 text-sm"
                  />
                  <Button type="submit" size="sm" variant="outline" className="rounded-xl">
                    Reject
                  </Button>
                </form>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">AI tool listing review</h2>
        {listings.length === 0 ? (
          <p className="text-sm text-muted-foreground">Queue empty.</p>
        ) : (
          listings.map((listing) => (
            <div
              key={listing.id}
              className="space-y-3 border-t border-border/50 pt-4"
            >
              <div>
                <h3 className="font-medium">{listing.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {listing.kind} · {listing.creatorName ?? listing.creatorId} · $
                  {(listing.priceCents / 100).toFixed(2)}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                  {listing.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={adminReviewListingAction}>
                  <input type="hidden" name="listingId" value={listing.id} />
                  <input type="hidden" name="approve" value="1" />
                  <Button type="submit" size="sm" className="rounded-xl">
                    Approve
                  </Button>
                </form>
                <form action={adminReviewListingAction} className="flex gap-2">
                  <input type="hidden" name="listingId" value={listing.id} />
                  <input type="hidden" name="approve" value="0" />
                  <input
                    name="note"
                    placeholder="Rejection note"
                    className="rounded-xl border border-border bg-background px-2 py-1 text-sm"
                  />
                  <Button type="submit" size="sm" variant="outline" className="rounded-xl">
                    Reject
                  </Button>
                </form>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Contract disputes</h2>
        {disputes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No open disputes.</p>
        ) : (
          disputes.map((d) => (
            <p key={d.id} className="text-sm text-muted-foreground">
              {d.id} · {d.disputeNote ?? "No note"}
            </p>
          ))
        )}
      </section>
    </div>
  )
}
