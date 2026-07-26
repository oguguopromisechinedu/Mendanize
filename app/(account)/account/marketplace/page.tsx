import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { requirePublicUser } from "@/features/authentication/server"
import {
  connectOnboardingAction,
  createListingAction,
} from "@/features/growth"
import { listListingsForCreator } from "@/services/marketplace"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Creator marketplace",
  robots: { index: false },
}

export default async function Page() {
  const session = await requirePublicUser()
  if (!session?.user?.id) redirect(`/sign-in?callbackUrl=${encodeURIComponent("/account/marketplace")}`)

  const listings = await listListingsForCreator(session.user.id)

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Creator dashboard
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Listings require Admin approval before they are purchasable. Creator
          flag never grants Admin access.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/account/tools-marketplace">Browse marketplace</Link>
          </Button>
          <form action={connectOnboardingAction}>
            <Button type="submit" variant="outline" className="rounded-xl">
              Stripe Connect onboarding
            </Button>
          </form>
        </div>
      </div>

      <form action={createListingAction} className="space-y-3 border-t border-border/60 pt-8">
        <h2 className="text-lg font-medium">Submit a listing</h2>
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
        <select
          name="kind"
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          defaultValue="PROMPT_PACK"
        >
          <option value="AI_APP">AI App</option>
          <option value="AGENT">Agent</option>
          <option value="PROMPT_PACK">Prompt Pack</option>
          <option value="TEMPLATE">Template</option>
          <option value="AUTOMATION">Automation</option>
        </select>
        <input
          name="priceCents"
          type="number"
          required
          min={0}
          step={100}
          placeholder="Price (cents)"
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
        />
        <Button type="submit" className="rounded-xl">
          Submit for Admin review
        </Button>
      </form>

      <section className="space-y-4 border-t border-border/60 pt-8">
        <h2 className="text-lg font-medium">Your listings</h2>
        {listings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No listings yet.</p>
        ) : (
          listings.map((listing) => (
            <div key={listing.id}>
              <h3 className="font-medium">{listing.title}</h3>
              <p className="text-xs text-muted-foreground">
                {listing.status}
                {listing.reviewNote ? ` · ${listing.reviewNote}` : ""} · $
                {(listing.priceCents / 100).toFixed(2)}
              </p>
            </div>
          ))
        )}
      </section>
    </div>
  )
}
