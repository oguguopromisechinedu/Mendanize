import Link from "next/link"
import {
  Activity,
  BarChart3,
  Bell,
  Cpu,
  CreditCard,
  LineChart,
  Sparkles,
} from "lucide-react"

import type { DashboardHomeData } from "../types/types"
import { AdminPanel } from "./admin-primitives"
import { AdminStatCard } from "./admin-table"
import { DashboardAnalyticsCharts } from "./dashboard-analytics-charts"
import { DashboardRightRail } from "./dashboard-right-rail"

const OPS_ICONS: Record<string, typeof BarChart3> = {
  ops1: BarChart3,
  ops2: Bell,
  ops3: Activity,
  ops4: Activity,
  ops5: Cpu,
  ops6: CreditCard,
  ops7: LineChart,
}

export function DashboardHomeView({ data }: { data: DashboardHomeData }) {
  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Platform operations
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Health, analytics, notifications, and business metrics. Publishing
            lives under{" "}
            <Link
              href="/dashboard/post"
              className="font-medium text-primary hover:underline"
            >
              Post
            </Link>
            .
          </p>
        </div>

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

        <AdminPanel
          title="Ops shortcuts"
          description="Jump to platform operations — not content publishing"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.opsShortcuts.map((item) => {
              const Icon = OPS_ICONS[item.id] ?? Sparkles
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
            {data.activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Platform activity will appear here as admins publish, upload, and
                manage users.
              </p>
            ) : (
              <ul className="space-y-3">
                {data.activity.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start justify-between gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.meta}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {item.time}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </AdminPanel>

          <AdminPanel
            title="Notifications"
            description={
              data.notifications.unreadCount > 0
                ? `${data.notifications.unreadCount} unread`
                : "All caught up"
            }
            action={
              <Link
                href="/dashboard/notifications"
                className="text-xs font-medium text-primary hover:underline"
              >
                Open center
              </Link>
            }
          >
            {data.notifications.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent notifications.
              </p>
            ) : (
              <ul className="space-y-3">
                {data.notifications.items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href || "/dashboard/notifications"}
                      className="flex items-start justify-between gap-3 rounded-lg transition hover:bg-hover"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm text-foreground">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.meta}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {item.time}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </AdminPanel>
        </div>

        <AdminPanel
          title="Analytics Overview"
          description="Last 7 days — full reports in Analytics"
          action={
            <Link
              href="/dashboard/analytics"
              className="text-xs font-medium text-primary hover:underline"
            >
              View Analytics
            </Link>
          }
        >
          <DashboardAnalyticsCharts charts={data.analyticsCharts} />
        </AdminPanel>

        <AdminPanel
          title="Business metrics"
          description="Snapshot KPIs from analytics"
          action={
            <Link
              href="/dashboard/bi"
              className="text-xs font-medium text-primary hover:underline"
            >
              Founder Dashboard
            </Link>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.analytics.map((metric) => (
              <div
                key={metric.id}
                className="rounded-xl border border-border bg-background/40 px-4 py-3"
              >
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {metric.value}
                </p>
                <p className="text-xs text-muted-foreground">{metric.delta}</p>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>

      <DashboardRightRail data={data} />
    </div>
  )
}
