import {
  AdminPageHeader,
  AdminPanel,
  AdminStatCard,
} from "@/features/admin-dashboard";
import type { DomainAnalyticsPayload } from "@/services/analytics";
import { AnalyticsNav } from "./analytics-nav";

export function DomainAnalyticsView({
  data,
}: {
  data: DomainAnalyticsPayload;
}) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader title={data.title} description={data.description} />
      <AnalyticsNav />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.stats.map((s) => (
          <AdminStatCard
            key={s.id}
            label={s.label}
            value={s.value}
            hint={s.hint}
          />
        ))}
      </div>

      <AdminPanel title="Chart">
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
          {data.chartPlaceholder}
        </div>
      </AdminPanel>

      <AdminPanel title="Top rows">
        {data.rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No rows yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {data.rows.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm"
              >
                <div>
                  <p className="font-medium text-foreground">{r.label}</p>
                  {r.meta ? (
                    <p className="text-xs text-muted-foreground">{r.meta}</p>
                  ) : null}
                </div>
                <span className="tabular-nums text-muted-foreground">
                  {r.value}
                </span>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>
    </div>
  );
}
