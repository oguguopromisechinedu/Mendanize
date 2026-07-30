import { AdminPageHeader } from "@/features/admin-dashboard"
import { EmsNav } from "./ems-nav"

function Metric({
  label,
  value,
}: {
  label: string
  value: number | null | string
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">
        {value === null ? "—" : value}
      </div>
    </div>
  )
}

export function EmsAnalyticsView({
  analytics,
}: {
  analytics: {
    totalSent: number
    delivered: number
    opened: number | null
    clicked: number | null
    bounced: number | null
    failed: number
    unsubscribed: number | null
    spamComplaints: number | null
    openRate: number | null
    clickRate: number | null
    deliveryRate: number | null
    note: string
  }
}) {
  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Email analytics"
        description="Provider-backed metrics. Unavailable values show as — (not fake zeros)."
      />
      <EmsNav />
      <p className="mb-4 text-sm text-muted-foreground">{analytics.note}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Total sent" value={analytics.totalSent} />
        <Metric label="Delivered" value={analytics.delivered} />
        <Metric label="Failed" value={analytics.failed} />
        <Metric
          label="Delivery rate %"
          value={analytics.deliveryRate}
        />
        <Metric label="Opened" value={analytics.opened} />
        <Metric label="Clicked" value={analytics.clicked} />
        <Metric label="Bounced" value={analytics.bounced} />
        <Metric label="Unsubscribed" value={analytics.unsubscribed} />
        <Metric label="Spam complaints" value={analytics.spamComplaints} />
        <Metric label="Open rate %" value={analytics.openRate} />
        <Metric label="Click rate %" value={analytics.clickRate} />
      </div>
    </div>
  )
}
