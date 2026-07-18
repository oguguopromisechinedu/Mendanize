import Link from "next/link";

import {
  AdminPageHeader,
  AdminPanel,
  AdminStatCard,
} from "@/features/admin-dashboard";
import { Button } from "@/components/ui/button";
import type { NotificationsDashboard } from "@/services/notification";
import { NotificationsNav } from "./notifications-nav";

export function NotificationsDashboardView({
  data,
}: {
  data: NotificationsDashboard;
}) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Notifications"
        description="Canonical communication hub — in-app, email templates, announcements, and delivery settings."
        actions={
          <Button asChild size="sm">
            <Link href="/dashboard/notifications/center">Open center</Link>
          </Button>
        }
      />
      <NotificationsNav />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Unread" value={String(data.unreadCount)} />
        <AdminStatCard label="Total" value={String(data.totalCount)} />
        <AdminStatCard label="Archived" value={String(data.archivedCount)} />
        <AdminStatCard
          label="Email queued today"
          value={String(data.emailQueuedToday)}
          hint="SMTP placeholder"
        />
      </div>

      <AdminPanel title="Notification types">
        <div className="flex flex-wrap gap-2">
          {data.types.map((t) => (
            <span
              key={t.type}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs"
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: t.color }}
              />
              {t.label}
            </span>
          ))}
        </div>
      </AdminPanel>

      <AdminPanel title="Quick links">
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/notifications/announcements">
              Announcements ({data.announcementCount})
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/notifications/email-templates">
              Email templates
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/notifications/delivery">Delivery</Link>
          </Button>
        </div>
      </AdminPanel>
    </div>
  );
}
