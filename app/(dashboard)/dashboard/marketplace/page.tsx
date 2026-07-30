import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { requireEditor } from "@/features/authentication/server"
import {
  adminRecomputeLeaderboardAction,
  adminReviewJobAction,
  adminReviewListingAction,
  adminReviewOrganizationAction,
  adminSetJobFeaturedAction,
  adminSetListingFeaturedAction,
  adminSetListingSourceAction,
} from "@/features/growth"
import {
  getMarketplaceMetrics,
  listApprovedListings,
  listDisputedContracts,
  listPastDueRetainersForAdmin,
  listPendingJobReviews,
  listPendingListingReviews,
} from "@/services/marketplace"
import { listPendingOrganizationReviews } from "@/services/organization"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Marketplace",
  robots: { index: false },
}

export default async function Page() {
  const session = await requireEditor()
  if (!session?.admin?.id) redirect("/dashboard/login")

  const [jobs, listings, disputes, metrics, organizations, approvedListings, pastDueRetainers] =
    await Promise.all([
    listPendingJobReviews(),
    listPendingListingReviews(),
    listDisputedContracts(),
    getMarketplaceMetrics(),
    listPendingOrganizationReviews(),
    listApprovedListings(),
    listPastDueRetainersForAdmin(),
  ])

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Marketplace</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Job posting review, AI tool listing queue, company verification, and
          contract disputes. Listings cannot go live without Admin approval.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild className="rounded-xl">
            <Link href="/dashboard/marketplace/tools">Manage AI Tools catalog</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/dashboard/marketplace/finance">Finance & commissions</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/dashboard/marketplace/disputes">Contract disputes</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/dashboard/marketplace/tools/new">Add AI Tool</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Pending jobs", value: metrics.pendingJobReviews },
          { label: "Pending listings", value: metrics.pendingListingReviews },
          { label: "Pending companies", value: organizations.length },
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
        <h2 className="text-lg font-medium">Company verification</h2>
        {organizations.length === 0 ? (
          <p className="text-sm text-muted-foreground">Queue empty.</p>
        ) : (
          organizations.map((org) => (
            <div
              key={org.id}
              className="space-y-3 border-t border-border/50 pt-4"
            >
              <div>
                <h3 className="font-medium">{org.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {org.type.replaceAll("_", " ")} · {org.industry ?? "No industry"} ·{" "}
                  {org.location ?? "No location"}
                  {org.website ? ` · ${org.website}` : ""}
                </p>
                {org.description ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                    {org.description}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={adminReviewOrganizationAction}>
                  <input type="hidden" name="organizationId" value={org.id} />
                  <input type="hidden" name="approve" value="1" />
                  <Button type="submit" size="sm" className="rounded-xl">
                    Verify
                  </Button>
                </form>
                <form action={adminReviewOrganizationAction} className="flex gap-2">
                  <input type="hidden" name="organizationId" value={org.id} />
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
                  {job.organizationName
                    ? `${job.organizationName} · `
                    : ""}
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
                <form action={adminSetJobFeaturedAction}>
                  <input type="hidden" name="jobId" value={job.id} />
                  <input
                    type="hidden"
                    name="featured"
                    value={job.featured ? "0" : "1"}
                  />
                  <Button type="submit" size="sm" variant="outline" className="rounded-xl">
                    {job.featured ? "Unfeature" : "Feature"}
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
                  {listing.kind} · {listing.source.replaceAll("_", " ")} ·{" "}
                  {listing.creatorName ?? listing.creatorId} · $
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
                <form action={adminSetListingSourceAction} className="flex gap-2">
                  <input type="hidden" name="listingId" value={listing.id} />
                  <select
                    name="source"
                    defaultValue={listing.source}
                    className="rounded-xl border border-border bg-background px-2 py-1 text-sm"
                  >
                    <option value="BUILT_ON_MENDANIZE">Built on Mendanize</option>
                    <option value="THIRD_PARTY">Third-party</option>
                    <option value="OFFICIAL">Official</option>
                  </select>
                  <Button type="submit" size="sm" variant="outline" className="rounded-xl">
                    Set source
                  </Button>
                </form>
                <form action={adminSetListingFeaturedAction}>
                  <input type="hidden" name="listingId" value={listing.id} />
                  <input
                    type="hidden"
                    name="featured"
                    value={listing.featured ? "0" : "1"}
                  />
                  <Button type="submit" size="sm" variant="outline" className="rounded-xl">
                    {listing.featured ? "Unfeature" : "Feature"}
                  </Button>
                </form>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Approved listings — featured</h2>
        {approvedListings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No approved listings yet.</p>
        ) : (
          approvedListings.slice(0, 20).map((listing) => (
            <div
              key={listing.id}
              className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-4"
            >
              <div>
                <p className="font-medium">{listing.title}</p>
                <p className="text-xs text-muted-foreground">
                  {listing.featured ? "Featured" : "Not featured"} ·{" "}
                  {listing.licenseType} · $
                  {(listing.priceCents / 100).toFixed(2)}
                </p>
              </div>
              <form action={adminSetListingFeaturedAction}>
                <input type="hidden" name="listingId" value={listing.id} />
                <input
                  type="hidden"
                  name="featured"
                  value={listing.featured ? "0" : "1"}
                />
                <Button type="submit" size="sm" variant="outline" className="rounded-xl">
                  {listing.featured ? "Unfeature" : "Feature"}
                </Button>
              </form>
            </div>
          ))
        )}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-medium">Contract disputes</h2>
          <Button asChild size="sm" variant="outline" className="rounded-xl">
            <Link href="/dashboard/marketplace/disputes">Open queue</Link>
          </Button>
        </div>
        {disputes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No DISPUTED contracts.</p>
        ) : (
          disputes.map((d) => (
            <p key={d.id} className="text-sm text-muted-foreground">
              {d.id} · {d.disputeNote ?? "No note"}
            </p>
          ))
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Past-due retainers</h2>
        <p className="text-sm text-muted-foreground">
          Read-only health for MES-053 monthly maintenance plans (Connect rail).
        </p>
        {pastDueRetainers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No past-due retainers.</p>
        ) : (
          pastDueRetainers.map((r) => (
            <p key={r.id} className="text-sm text-muted-foreground">
              {r.continuationContract.websiteLabel ?? r.continuationContract.id} ·{" "}
              {r.tier} · client {r.client.name ?? r.client.email} · worker{" "}
              {r.worker.name ?? r.worker.email}
            </p>
          ))
        )}
      </section>
    </div>
  )
}
