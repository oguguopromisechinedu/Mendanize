import type { SeoDashboardStats } from "@/services/seo/types"
import {
  AdminPageHeader,
  AdminPanel,
  AdminStatCard,
} from "@/features/admin-dashboard"
import { SeoCmsNav } from "./seo-cms-nav"

export function SeoDashboardView({ stats }: { stats: SeoDashboardStats }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="SEO Center"
        description="Optimize metadata, redirects, robots, and structured data across all public content."
      />
      <SeoCmsNav />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AdminStatCard
          label="Indexed pages (est.)"
          value={String(stats.indexedPagesEstimate)}
          hint="Published content estimate — not Search Console"
        />
        <AdminStatCard
          label="Missing metadata"
          value={String(stats.missingMetadata)}
        />
        <AdminStatCard
          label="Duplicate titles"
          value={String(stats.duplicateTitles)}
        />
        <AdminStatCard
          label="Missing images"
          value={String(stats.missingImages)}
        />
        <AdminStatCard
          label="Active redirects"
          value={String(stats.activeRedirects)}
          hint={`${stats.disabledRedirects} disabled`}
        />
        <AdminStatCard
          label="Sitemap types"
          value={String(stats.sitemapIncludedTypes)}
          hint={
            stats.lastSitemapHint
              ? `Last regen ${new Date(stats.lastSitemapHint).toLocaleString()}`
              : "Not regenerated yet"
          }
        />
        <AdminStatCard
          label="Structured data"
          value={String(stats.structuredDataEnabled)}
          hint="Enabled schema previews"
        />
      </div>

      <AdminPanel title="Status notes">
        <p className="text-sm text-muted-foreground">
          Widgets are advisory placeholders. Live indexing, scoring, and Search
          Console sync are out of scope for MES-015.
        </p>
      </AdminPanel>
    </div>
  )
}
