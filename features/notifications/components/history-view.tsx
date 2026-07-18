"use client";

import { useMemo, useState } from "react";

import { AdminPageHeader, AdminPanel, StatusBadge } from "@/features/admin-dashboard";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { CommunicationLogRecord } from "@/services/notification";
import { NotificationsNav } from "./notifications-nav";

export function CommunicationHistoryView({
  items,
  total,
}: {
  items: CommunicationLogRecord[];
  total: number;
}) {
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState("all");

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (channel !== "all" && i.channel !== channel) return false;
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return (
        (i.subject ?? "").toLowerCase().includes(q) ||
        (i.templateKey ?? "").toLowerCase().includes(q)
      );
    });
  }, [items, query, channel]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Communication history"
        description={`Log of dispatches (${total} loaded). Search and filter by channel.`}
      />
      <NotificationsNav />

      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search subject or template…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="w-36"
        >
          <option value="all">All channels</option>
          <option value="in_app">In-app</option>
          <option value="email">Email</option>
        </Select>
      </div>

      <AdminPanel title={`${filtered.length} entries`}>
        <ul className="divide-y divide-border">
          {filtered.map((log) => (
            <li
              key={log.id}
              className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
            >
              <div>
                <p className="font-medium">{log.subject ?? log.templateKey ?? "—"}</p>
                <p className="text-xs text-muted-foreground">
                  {log.channel} · {log.templateKey ?? "—"} ·{" "}
                  {new Date(log.createdAt).toLocaleString()}
                </p>
                {log.detail ? (
                  <p className="mt-1 max-w-xl truncate text-xs text-muted-foreground">
                    {log.detail}
                  </p>
                ) : null}
              </div>
              <StatusBadge status={log.status} />
            </li>
          ))}
        </ul>
      </AdminPanel>
    </div>
  );
}
