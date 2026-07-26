import {
  AdminPageHeader,
  AdminPanel,
  AdminStatCard,
} from "@/features/admin-dashboard";
import type { AnalyticsOverview } from "@/services/analytics";
import { AnalyticsNav } from "./analytics-nav";
import { InstrumentationToggle } from "./instrumentation-toggle";

export function AnalyticsOverviewView({ data }: { data: AnalyticsOverview }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Analytics overview"
        description={data.sourceNote}
        actions={<InstrumentationToggle enabled={data.instrumentationEnabled} />}
      />
      <AnalyticsNav />

      {!data.instrumentationEnabled ? (
        <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          Event instrumentation is off. Enable it to record page views, then run
          the analytics rollup automation job to refresh domain widgets.
        </p>
      ) : (
        <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          Instrumentation is on — page views are collected via{" "}
          <code className="text-xs">/api/analytics/collect</code>.
        </p>
      )}

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
