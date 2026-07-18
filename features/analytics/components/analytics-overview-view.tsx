import {
  AdminPageHeader,
  AdminPanel,
  AdminStatCard,
} from "@/features/admin-dashboard";
import type { AnalyticsOverview } from "@/services/analytics";
import { AnalyticsNav } from "./analytics-nav";

export function AnalyticsOverviewView({ data }: { data: AnalyticsOverview }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Analytics overview"
        description={data.sourceNote}
      />
      <AnalyticsNav />

      {!data.instrumentationEnabled ? (
        <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          Production event instrumentation is disabled. Capture API exists on{" "}
          <code className="text-xs">captureAnalyticsEvent</code>; modules will
          write when wired.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {data.stats.map((s) => (
          <AdminStatCard
            key={s.id}
            label={s.label}
            value={s.value}
            hint={s.hint}
          />
        ))}
      </div>

      <AdminPanel title="Engagement">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {data.engagement.map((s) => (
            <AdminStatCard
              key={s.id}
              label={s.label}
              value={s.value}
              hint={s.delta ?? s.hint}
            />
          ))}
        </div>
      </AdminPanel>

      <AdminPanel title="Period">
        <p className="text-sm text-muted-foreground">
          Rolling window key: <strong>{data.periodKey}</strong>
        </p>
      </AdminPanel>
    </div>
  );
}
