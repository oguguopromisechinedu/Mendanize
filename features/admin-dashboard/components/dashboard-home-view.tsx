import Link from "next/link"
import {
  BarChart3,
  BookOpen,
  FileText,
  FolderPlus,
  Hash,
  Home,
  ImageIcon,
  Menu,
  Sparkles,
  Upload,
  Video,
} from "lucide-react"

import type { DashboardHomeData } from "../types/types"
import { AdminPanel } from "./admin-primitives"
import { AdminDataTable, AdminStatCard } from "./admin-table"
import { DashboardAnalyticsCharts } from "./dashboard-analytics-charts"
import { DashboardRightRail } from "./dashboard-right-rail"
import { StatusBadge } from "./status-badge"

const QUICK_ICONS: Record<string, typeof FileText> = {
  qa1: FileText,
  qa2: BookOpen,
  qa3: FolderPlus,
  qa4: Hash,
  qa5: Upload,
  qa6: FileText,
  qa7: Menu,
  qa8: Home,
  qa9: ImageIcon,
  qa10: Video,
  qa11: Sparkles,
  qa12: BarChart3,
}

function DonutOverview({
  slices,
}: {
  slices: DashboardHomeData["contentOverview"]
}) {
  const total = slices.reduce((sum, s) => sum + s.value, 0) || 1
  const ends = slices.reduce<number[]>((acc, s) => {
    const prev = acc.length > 0 ? acc[acc.length - 1]! : 0
    return [...acc, prev + (s.value / total) * 100]
  }, [])
  const gradient = slices
    .map((s, i) => {
      const start = i === 0 ? 0 : ends[i - 1]!
      return `${s.color} ${start}% ${ends[i]}%`
    })
    .join(", ")

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div
        className="size-32 shrink-0 rounded-full"
        style={{
          background: `conic-gradient(${gradient})`,
          mask: "radial-gradient(circle, transparent 48%, #000 50%)",
          WebkitMask: "radial-gradient(circle, transparent 48%, #000 50%)",
        }}
        aria-hidden
      />
      <ul className="w-full space-y-2">
        {slices.map((s) => (
          <li key={s.id} className="flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              {s.label}
            </span>
            <span className="font-medium text-foreground">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SeoScoreRing({ score }: { score: number }) {
  const tone =
    score >= 80
      ? "border-emerald-500/50 text-emerald-500"
      : score >= 60
        ? "border-amber-500/50 text-amber-500"
        : "border-red-400/50 text-red-400"
  return (
    <span
      className={`inline-flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold ${tone}`}
    >
      {score}
    </span>
  )
}

export function DashboardHomeView({ data }: { data: DashboardHomeData }) {
  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          {data.stats.map((stat) => (
            <AdminStatCard
              key={stat.id}
              label={stat.label}
              value={stat.value}
              hint={stat.hint}
              trend={stat.trend}
            />
          ))}
        </div>

        <AdminPanel title="Quick Access" description="Jump to common tasks">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.quickAccess.map((item) => {
              const Icon = QUICK_ICONS[item.id] ?? Sparkles
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group flex items-start gap-3 rounded-xl border border-border bg-background/40 px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-hover hover:shadow-sm"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary transition-colors group-hover:bg-primary/25">
                    <Icon className="size-4" />
                  </span>
                  <span>
                    <p className="text-sm font-medium text-foreground">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </span>
                </Link>
              )
            })}
          </div>
        </AdminPanel>

        <div className="grid gap-6 lg:grid-cols-2">
          <AdminPanel title="Recent Activity">
            <ul className="space-y-3">
              {data.activity.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.meta}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {item.time}
                  </span>
                </li>
              ))}
            </ul>
          </AdminPanel>

          <AdminPanel title="Content Overview">
            <DonutOverview slices={data.contentOverview} />
          </AdminPanel>
        </div>

        <AdminPanel title="Recent Articles">
          <AdminDataTable
            headers={["Title", "Status", "Author", "SEO", "Views", "Date"]}
          >
            {data.recentArticles.map((row) => (
              <tr key={row.id} className="hover:bg-hover/50">
                <td className="px-3 py-2.5 font-medium text-foreground">
                  {row.href ? (
                    <Link
                      href={row.href}
                      className="hover:text-primary hover:underline"
                    >
                      {row.title}
                    </Link>
                  ) : (
                    row.title
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {row.author}
                </td>
                <td className="px-3 py-2.5">
                  <SeoScoreRing score={row.seoScore} />
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {row.views}
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {row.date}
                </td>
              </tr>
            ))}
          </AdminDataTable>
        </AdminPanel>

        <div className="grid gap-6 lg:grid-cols-2">
          <AdminPanel title="Top Categories">
            <ol className="space-y-2">
              {data.topCategories.map((cat, i) => {
                const max = data.topCategories[0]?.count ?? 1
                const pct = Math.round((cat.count / max) * 100)
                return (
                  <li key={cat.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        <span className="mr-2 font-medium text-primary">
                          {i + 1}.
                        </span>
                        {cat.name}
                      </span>
                      <span className="font-medium text-foreground">
                        {cat.count}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary/60"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                )
              })}
            </ol>
          </AdminPanel>

          <AdminPanel
            title="Analytics Overview"
            description="Last 7 days — full reports in Analytics"
          >
            <DashboardAnalyticsCharts charts={data.analyticsCharts} />
          </AdminPanel>
        </div>
      </div>

      <DashboardRightRail data={data} />
    </div>
  )
}
