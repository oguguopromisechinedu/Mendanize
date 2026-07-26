import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { requirePublicUser } from "@/features/authentication/server"
import {
  enableCreatorFlagAction,
  purchaseListingAction,
} from "@/features/growth"
import {
  hasActiveCreatorFlag,
  isStripeConnectConfigured,
  listApprovedListings,
} from "@/services/marketplace"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "AI Tools Marketplace",
  robots: { index: false },
}

export default async function Page() {
  const session = await requirePublicUser()
  if (!session?.user?.id) redirect(`/sign-in?callbackUrl=${encodeURIComponent("/account/tools-marketplace")}`)

  const [listings, isCreator] = await Promise.all([
    listApprovedListings(),
    hasActiveCreatorFlag(session.user.id),
  ])
  const connectReady = isStripeConnectConfigured()

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
            AI Tools Marketplace
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Only Admin-approved listings appear here. Purchases use Stripe
            Connect, not MES-021 subscription Checkout.
            {!connectReady
              ? " Connect is not configured — purchases stay pending until keys are set."
              : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isCreator ? (
            <form action={enableCreatorFlagAction}>
              <Button type="submit" variant="outline" className="rounded-xl">
                Become a creator
              </Button>
            </form>
          ) : null}
          <Button asChild className="rounded-xl">
            <Link href="/account/marketplace">Creator dashboard</Link>
          </Button>
        </div>
      </div>

      <ul className="space-y-6">
        {listings.length === 0 ? (
          <li className="text-sm text-muted-foreground">
            No approved listings yet. Explore Admin-published tools in{" "}
            <Link href="/account/ai-tools" className="underline-offset-4 hover:underline">
              AI Tools
            </Link>
            .
          </li>
        ) : (
          listings.map((listing) => (
            <li
              key={listing.id}
              className="border-t border-border/40 pt-6 first:border-0 first:pt-0"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-medium">{listing.title}</h2>
                  <p className="text-xs text-muted-foreground">
                    {listing.kind.replaceAll("_", " ")} ·{" "}
                    {listing.creatorName ?? "Creator"} · $
                    {(listing.priceCents / 100).toFixed(2)}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                    {listing.description}
                  </p>
                </div>
                <form action={purchaseListingAction}>
                  <input type="hidden" name="listingId" value={listing.id} />
                  <Button type="submit" className="rounded-xl">
                    Buy
                  </Button>
                </form>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
