import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { requirePublicUser } from "@/features/authentication/server"
import {
  OnboardingBanner,
  resolveCreatorNotice,
} from "@/features/growth/components/onboarding-banner"
import { ToolsMarketplaceView } from "@/features/marketplace/components/tools-marketplace-view"
import { transferLicenseAction } from "@/features/growth"
import {
  hasActiveCreatorFlag,
  isStripeConnectConfigured,
  listApprovedListings,
  listLicensesForOwner,
} from "@/services/marketplace"
import { listPublishedTools } from "@/services/content"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "AI Tools Marketplace",
  robots: { index: false },
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Page({ searchParams }: PageProps) {
  const session = await requirePublicUser()
  if (!session?.user?.id) {
    redirect(
      `/sign-in?callbackUrl=${encodeURIComponent("/account/tools-marketplace")}`,
    )
  }

  const params = await searchParams
  const query = typeof params.query === "string" ? params.query : undefined
  const category =
    typeof params.category === "string" ? params.category : undefined
  const pricingRaw =
    typeof params.pricing === "string" ? params.pricing.toUpperCase() : "ALL"
  const pricing =
    pricingRaw === "FREE" || pricingRaw === "PAID" ? pricingRaw : "ALL"

  const [catalog, listings, isCreator, licenses] = await Promise.all([
    listPublishedTools({ query, pageSize: 60, sort: "name", sortDir: "asc" }),
    listApprovedListings({
      query,
      category: category && category !== "all" ? category : undefined,
      pricing,
    }),
    hasActiveCreatorFlag(session.user.id),
    listLicensesForOwner(session.user.id),
  ])
  const connectReady = isStripeConnectConfigured()
  const notice = resolveCreatorNotice({
    onboarded: params.onboarded,
    error: params.error,
  })

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-8">
      {notice ? <OnboardingBanner notice={notice} /> : null}
      <ToolsMarketplaceView
        listings={listings}
        catalogCount={catalog.items.length}
        query={query}
        category={category}
        pricing={pricing}
        isCreator={isCreator}
        connectReady={connectReady}
      />

      <section className="space-y-4 border-t border-border/50 pt-8">
        <h2 className="text-lg font-medium">My licenses</h2>
        {licenses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Purchased tool licenses will appear here.
          </p>
        ) : (
          <ul className="space-y-4">
            {licenses.map((license) => (
              <li
                key={license.id}
                className="rounded-2xl border border-border/50 bg-card/50 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{license.listingTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {license.licenseType.replaceAll("_", " ")} · {license.status}
                    </p>
                  </div>
                  {license.licenseType !== "STANDARD" ? (
                    <form
                      action={transferLicenseAction}
                      className="flex flex-wrap gap-2"
                    >
                      <input type="hidden" name="licenseId" value={license.id} />
                      <input
                        name="recipientEmail"
                        type="email"
                        required
                        placeholder="Transfer to email"
                        className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      />
                      <Button type="submit" size="sm" variant="outline" className="rounded-xl">
                        Transfer
                      </Button>
                    </form>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
