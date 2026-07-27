import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { requirePublicUser } from "@/features/authentication/server"
import { purchaseListingAction } from "@/features/growth"
import {
  OnboardingBanner,
  resolveCreatorNotice,
} from "@/features/growth/components/onboarding-banner"
import { TOOL_PRICING_LABELS, TOOL_SOURCE_LABELS } from "@/features/ai-tools/constants/constants"
import {
  hasActiveCreatorFlag,
  isStripeConnectConfigured,
  listApprovedListings,
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

function sourceBadge(source: string) {
  if (source === "OFFICIAL") return "Official Mendanize"
  if (source === "THIRD_PARTY") return "Third-Party"
  return "Built on Mendanize"
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
  const [catalog, listings, isCreator] = await Promise.all([
    listPublishedTools({ query, pageSize: 60, sort: "name", sortDir: "asc" }),
    listApprovedListings(),
    hasActiveCreatorFlag(session.user.id),
  ])
  const connectReady = isStripeConnectConfigured()
  const notice = resolveCreatorNotice({
    onboarded: params.onboarded,
    error: params.error,
  })

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-8">
      {notice ? <OnboardingBanner notice={notice} /> : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
            AI Tools Marketplace
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Published catalog tools plus Admin-approved creator listings. Labels
            show Official Mendanize, Third-Party, or Built on Mendanize.
            {!connectReady
              ? " Connect is not configured — creator purchases stay pending until keys are set."
              : null}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <Button asChild variant="outline" className="w-full rounded-xl sm:w-auto">
            <Link href={isCreator ? "/account/marketplace" : "/account/creator"}>
              {isCreator ? "Open creator dashboard" : "Become a creator"}
            </Link>
          </Button>
        </div>
      </div>

      <form className="flex flex-col gap-2 sm:flex-row" method="get">
        <input
          name="query"
          defaultValue={query ?? ""}
          placeholder="Search published tools…"
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
        />
        <Button type="submit" variant="outline" className="rounded-xl">
          Search
        </Button>
      </form>

      <section className="space-y-6">
        <h2 className="text-lg font-medium">Catalog tools</h2>
        {catalog.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No published tools yet. Admins can add them under Marketplace → AI
            Tools.
          </p>
        ) : (
          <ul className="space-y-6">
            {catalog.items.map((tool) => (
              <li
                key={tool.id}
                className="border-t border-border/40 pt-6 first:border-0 first:pt-0"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 flex-1 gap-3">
                    {tool.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={tool.logoUrl}
                        alt=""
                        className="size-12 shrink-0 rounded-xl border border-border object-contain"
                      />
                    ) : (
                      <span className="size-12 shrink-0 rounded-xl border border-border bg-muted/40" />
                    )}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-medium">{tool.name}</h3>
                        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          {TOOL_SOURCE_LABELS[tool.source] ?? sourceBadge(tool.source)}
                        </span>
                        {tool.verified ? (
                          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                            Verified
                          </span>
                        ) : null}
                        {tool.featured ? (
                          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                            Featured
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {tool.developer ?? "Unknown developer"} ·{" "}
                        {TOOL_PRICING_LABELS[tool.pricing]}
                        {tool.platforms.length
                          ? ` · ${tool.platforms.join(", ")}`
                          : ""}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {tool.shortDescription}
                      </p>
                      {tool.aiCapabilities.length > 0 ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {tool.aiCapabilities.join(" · ")}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:w-auto">
                    <Button asChild className="w-full rounded-xl sm:w-auto">
                      <Link href={`/account/ai-tools/${tool.slug}`}>
                        View details
                      </Link>
                    </Button>
                    {tool.websiteUrl ? (
                      <Button asChild variant="outline" className="w-full rounded-xl sm:w-auto">
                        <a href={tool.websiteUrl} target="_blank" rel="noreferrer">
                          Official site
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-6 border-t border-border/60 pt-8">
        <h2 className="text-lg font-medium">Creator listings</h2>
        <p className="text-sm text-muted-foreground">
          Developer-submitted tools appear here after Admin approval. Purchases
          use Stripe Connect.
        </p>
        {listings.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No approved creator listings yet.
          </p>
        ) : (
          <ul className="space-y-6">
            {listings.map((listing) => (
              <li
                key={listing.id}
                className="border-t border-border/40 pt-6 first:border-0 first:pt-0"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-medium">{listing.title}</h3>
                      <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        {sourceBadge(listing.source)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {listing.kind.replaceAll("_", " ")} ·{" "}
                      {listing.creatorName ?? "Creator"} · $
                      {(listing.priceCents / 100).toFixed(2)}
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                      {listing.description}
                    </p>
                  </div>
                  <form action={purchaseListingAction} className="w-full sm:w-auto">
                    <input type="hidden" name="listingId" value={listing.id} />
                    <Button type="submit" className="w-full rounded-xl sm:w-auto">
                      Buy
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
