"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  AdminPageHeader,
  AdminPanel,
  StatusBadge,
} from "@/features/admin-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type {
  AnalyticsConfigRecord,
  AnalyticsReportRecord,
} from "@/services/analytics";
import { placeholderAnalyticsAction } from "../actions/actions";
import { AnalyticsNav } from "./analytics-nav";

export function ReportsView({
  reports,
  config,
}: {
  reports: AnalyticsReportRecord[];
  config: AnalyticsConfigRecord;
}) {
  const [type, setType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (type !== "all" && r.reportType !== type) return false;
      if (dateFrom && r.dateFrom && r.dateFrom < dateFrom) return false;
      if (dateTo && r.dateTo && r.dateTo > dateTo) return false;
      return true;
    });
  }, [reports, type, dateFrom, dateTo]);

  async function onExport() {
    const res = await placeholderAnalyticsAction();
    toast.message(res.message);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Reports"
        description="List, filter, and prepare exports. Export and scheduling are placeholders."
        actions={
          <Button size="sm" variant="outline" onClick={onExport}>
            Export
          </Button>
        }
      />
      <AnalyticsNav />

      <AdminPanel title="Filters">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="all">All</option>
              <option value="content">Content</option>
              <option value="search">Search</option>
              <option value="traffic">Traffic</option>
              <option value="ai">AI</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>From</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>To</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
      </AdminPanel>

      <AdminPanel title={`${filtered.length} reports`}>
        <ul className="divide-y divide-border">
          {filtered.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <div>
                <p className="font-medium text-foreground">{r.name}</p>
                <p className="text-xs text-muted-foreground">
                  {r.reportType}
                  {r.dateFrom
                    ? ` · ${new Date(r.dateFrom).toLocaleDateString()}`
                    : ""}
                  {r.dateTo
                    ? ` – ${new Date(r.dateTo).toLocaleDateString()}`
                    : ""}
                </p>
                {r.exportNote ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r.exportNote}
                  </p>
                ) : null}
                {r.scheduleNote ? (
                  <p className="text-xs text-muted-foreground">
                    {r.scheduleNote}
                  </p>
                ) : null}
              </div>
              <StatusBadge status={r.status} />
            </li>
          ))}
        </ul>
      </AdminPanel>

      <AdminPanel title="Privacy & retention">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase text-muted-foreground">
              Retention
            </dt>
            <dd>{config.retentionDays} days</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-muted-foreground">
              Privacy mode
            </dt>
            <dd>{config.privacyMode ? "On" : "Off"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase text-muted-foreground">
              Allowed roles
            </dt>
            <dd>{config.allowedRoles.join(", ")}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase text-muted-foreground">Audit</dt>
            <dd className="text-muted-foreground">
              {config.auditLoggingNote ?? "—"}
            </dd>
          </div>
        </dl>
      </AdminPanel>
    </div>
  );
}
