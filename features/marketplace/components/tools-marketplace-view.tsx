import Link from "next/link"
import {
  BadgeCheck,
  Bot,
  Code2,
  ImageIcon,
  LineChart,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  Video,
  Zap,
} from "lucide-react"

import { purchaseListingAction } from "@/features/growth"
import type { MarketplaceListingRecord } from "@/services/marketplace"
import { Button } from "@/components/ui/button"
import { MendanizeRobot3D } from "@/components/brand/MendanizeRobot3D"
import { cn } from "@/lib/utils"

const TOOL_CATEGORIES = [
  { id: "all", label: "All Categories", icon: Sparkles },
  { id: "AI Chatbots", label: "AI Chatbots", icon: MessageSquare },
  { id: "Productivity", label: "Productivity", icon: Zap },
  { id: "Coding", label: "Code Assistant", icon: Code2 },
  { id: "Image Generation", label: "Image Generation", icon: ImageIcon },
  { id: "Video", label: "Video", icon: Video },
  { id: "Data Analytics", label: "Data & Analytics", icon: LineChart },
] as const

function formatPrice(listing: MarketplaceListingRecord) {
  if (listing.pricingModel === "FREE" || listing.priceCents === 0) return "Free"
  const dollars = (listing.priceCents / 100).toFixed(
    listing.priceCents % 100 === 0 ? 0 : 2,
  )
  if (listing.pricingModel === "SUBSCRIPTION") return `$${dollars}/mo`
  return `$${dollars}`
}

function pricingBadge(listing: MarketplaceListingRecord) {
  if (listing.pricingModel === "FREE" || listing.priceCents === 0) return "Free"
  if (listing.pricingModel === "SUBSCRIPTION") return "Subscription"
  return "Paid"
}

export function ToolsMarketplaceView({
  listings,
  catalogCount,
  query,
  category,
  pricing,
  isCreator,
  connectReady,
}: {
  listings: MarketplaceListingRecord[]
  catalogCount: number
  query?: string
  category?: string
  pricing?: string
  isCreator: boolean
  connectReady: boolean
}) {
  const featured = listings.filter((l) => l.featured).slice(0, 6)
  const grid = listings
  const activeCategory = category || "all"

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
            AI Tools Marketplace
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Discover, buy and use powerful AI tools built by companies, startups
            and developers around the world.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="#browse">Browse Tools</Link>
          </Button>
          <Button asChild className="rounded-xl">
            <Link href={isCreator ? "/account/marketplace" : "/account/creator"}>
              Sell Your AI Tool
            </Link>
          </Button>
        </div>
      </header>

      <section className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-background to-primary/10">
        <div className="grid items-center gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
          <div className="space-y-5">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Build · List · Sell
            </p>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight sm:text-3xl">
              Turn your AI innovation into income.
            </h2>
            <p className="max-w-lg text-sm text-muted-foreground">
              Verified tools, secure payments, and instant access after purchase.
              {!connectReady
                ? " Stripe Connect is not configured yet — purchases stay pending until keys are set."
                : null}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild className="rounded-xl">
                <Link
                  href={isCreator ? "/account/marketplace" : "/account/creator"}
                >
                  List Your Tool
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/account/marketplace">Creator dashboard</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-3 pt-2 text-xs text-muted-foreground">
              {[
                { icon: ShieldCheck, label: "Verified Tools" },
                { icon: BadgeCheck, label: "Secure Payments" },
                { icon: Zap, label: "Instant Access" },
                { icon: Bot, label: "Top Developers" },
              ].map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/40 px-3 py-1"
                >
                  <item.icon className="size-3.5 text-primary" />
                  {item.label}
                </span>
              ))}
            </div>
          </div>
          <div className="relative mx-auto hidden h-56 w-full max-w-sm lg:block">
            <MendanizeRobot3D className="h-full w-full" />
          </div>
        </div>
      </section>

      <form
        method="get"
        className="flex flex-col gap-2 rounded-2xl border border-border/50 bg-card/40 p-3 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="query"
            defaultValue={query ?? ""}
            placeholder="Search for AI tools, categories, or creators…"
            className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm outline-none ring-primary/40 focus:ring-2"
          />
        </div>
        {category ? <input type="hidden" name="category" value={category} /> : null}
        {pricing ? <input type="hidden" name="pricing" value={pricing} /> : null}
        <Button type="submit" className="rounded-xl">
          Search
        </Button>
      </form>

      <div className="flex gap-2 overflow-x-auto pb-1" id="browse">
        {TOOL_CATEGORIES.map((cat) => {
          const href =
            cat.id === "all"
              ? `/account/tools-marketplace${query ? `?query=${encodeURIComponent(query)}` : ""}`
              : `/account/tools-marketplace?category=${encodeURIComponent(cat.id)}${query ? `&query=${encodeURIComponent(query)}` : ""}`
          const active = activeCategory === cat.id
          return (
            <Link
              key={cat.id}
              href={href}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/60 bg-card/50 text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              <cat.icon className="size-3.5" />
              {cat.label}
            </Link>
          )
        })}
      </div>

      {featured.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Featured AI Tools</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {featured.map((listing) => (
              <ToolCard key={listing.id} listing={listing} featured />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-medium">All AI Tools</h2>
            <p className="text-xs text-muted-foreground">
              {grid.length} marketplace listing
              {grid.length === 1 ? "" : "s"}
              {catalogCount > 0
                ? ` · ${catalogCount} catalog tools also available`
                : null}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {(["ALL", "FREE", "PAID"] as const).map((p) => {
              const params = new URLSearchParams()
              if (query) params.set("query", query)
              if (category) params.set("category", category)
              if (p !== "ALL") params.set("pricing", p)
              const qs = params.toString()
              const active = (pricing || "ALL") === p
              return (
                <Link
                  key={p}
                  href={`/account/tools-marketplace${qs ? `?${qs}` : ""}`}
                  className={cn(
                    "rounded-full border px-3 py-1",
                    active
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border/60 text-muted-foreground",
                  )}
                >
                  {p === "ALL" ? "All" : p === "FREE" ? "Free" : "Paid"}
                </Link>
              )
            })}
          </div>
        </div>

        {grid.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border/60 px-4 py-10 text-center text-sm text-muted-foreground">
            No approved listings yet. Creators submit tools from the creator
            dashboard; Admins approve them before they appear here.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {grid.map((listing) => (
              <ToolCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function ToolCard({
  listing,
  featured,
}: {
  listing: MarketplaceListingRecord
  featured?: boolean
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-border/50 bg-card/60 p-4 shadow-sm backdrop-blur-sm transition hover:border-primary/30">
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-sm font-semibold text-primary">
          {listing.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.logoUrl}
              alt=""
              className="size-11 rounded-xl object-cover"
            />
          ) : (
            listing.title.slice(0, 2).toUpperCase()
          )}
        </div>
        <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
          {pricingBadge(listing)}
        </span>
      </div>
      <div className="mt-3 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-medium leading-snug">{listing.title}</h3>
          {featured ? (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] text-primary">
              Featured
            </span>
          ) : null}
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {listing.description}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {listing.creatorName ?? "Creator"} · {listing.licenseType.replaceAll("_", " ")}
          {listing.averageRating != null
            ? ` · ★ ${listing.averageRating.toFixed(1)} (${listing.reviewCount ?? 0})`
            : null}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/40 pt-3">
        <p className="text-sm font-semibold tabular-nums">{formatPrice(listing)}</p>
        <form action={purchaseListingAction}>
          <input type="hidden" name="listingId" value={listing.id} />
          <Button type="submit" size="sm" className="rounded-xl">
            {listing.priceCents === 0 ? "Get" : "Buy"}
          </Button>
        </form>
      </div>
    </article>
  )
}
