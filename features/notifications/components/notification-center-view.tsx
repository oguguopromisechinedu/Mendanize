"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  AdminPageHeader,
  AdminPanel,
  StatusBadge,
} from "@/features/admin-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { NotificationListResult } from "@/services/notification";
import { markNotificationAction } from "../actions/actions";
import { STATUS_FILTERS, TYPE_FILTERS } from "../constants/constants";
import { NotificationsNav } from "./notifications-nav";

export function NotificationCenterView({
  initial,
}: {
  initial: NotificationListResult;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const filtered = useMemo(() => {
    let items = initial.items;
    if (type !== "ALL") items = items.filter((i) => i.type === type);
    if (status !== "ALL") items = items.filter((i) => i.status === status);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          (i.preview ?? "").toLowerCase().includes(q),
      );
    }
    items = [...items].sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sort === "newest" ? db - da : da - db;
    });
    return items;
  }, [initial.items, query, type, status, sort]);

  function act(id: string, action: "read" | "unread" | "archive" | "delete") {
    startTransition(async () => {
      const res = await markNotificationAction({ id, action });
      if (!res.ok) toast.error(res.message);
      else {
        toast.success(res.message);
        router.refresh();
      }
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Notification center"
        description={`${initial.unreadCount} unread · search, filter, mark read, archive, delete`}
      />
      <NotificationsNav />

      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
        <Select value={type} onChange={(e) => setType(e.target.value)} className="w-40">
          {TYPE_FILTERS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-36"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="w-32"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </Select>
      </div>

      <AdminPanel title={`${filtered.length} notifications`}>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notifications.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="border-b border-border text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3">Title</th>
                  <th className="py-2 pr-3">Preview</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">Priority</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((n) => (
                  <tr key={n.id}>
                    <td className="py-2.5 pr-3 font-medium">
                      {n.link ? (
                        <Link href={n.link} className="hover:text-primary">
                          {n.title}
                        </Link>
                      ) : (
                        n.title
                      )}
                    </td>
                    <td className="max-w-[14rem] truncate py-2.5 pr-3 text-muted-foreground">
                      {n.preview ?? "—"}
                    </td>
                    <td className="py-2.5 pr-3">
                      <StatusBadge status={n.type.toLowerCase()} />
                    </td>
                    <td className="py-2.5 pr-3">{n.priority}</td>
                    <td className="py-2.5 pr-3">
                      <StatusBadge status={n.status.toLowerCase()} />
                    </td>
                    <td className="py-2.5 pr-3 text-xs text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {!n.read ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={pending}
                            onClick={() => act(n.id, "read")}
                          >
                            Read
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={pending}
                            onClick={() => act(n.id, "unread")}
                          >
                            Unread
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={pending}
                          onClick={() => act(n.id, "archive")}
                        >
                          Archive
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={pending}
                          onClick={() => act(n.id, "delete")}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
