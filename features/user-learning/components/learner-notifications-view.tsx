"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { MendanizeRobot } from "@/components/brand/MendanizeRobot";
import { Button } from "@/components/ui/button";
import type { NotificationListResult } from "@/services/notification";
import { markNotificationAction } from "@/features/notifications/actions/actions";

export function LearnerNotificationsView({
  initial,
}: {
  initial: NotificationListResult;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function act(id: string, action: "read" | "archive") {
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
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground">
          Notifications
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {initial.unreadCount} unread · learning updates, AI tips, and billing
        </p>
      </div>

      {initial.items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border px-6 py-12 text-center">
          <MendanizeRobot variant="empty" className="h-24 w-20" />
          <p className="text-sm text-muted-foreground">
            You’re all caught up. I’ll nudge you here when there’s something worth
            celebrating.
          </p>
          <Button asChild className="rounded-xl">
            <Link href="/account">Back to home</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {initial.items.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-border bg-card/70 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{item.title}</p>
                  {item.preview || item.body ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.preview ?? item.body}
                    </p>
                  ) : null}
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString()}
                    {!item.read ? " · Unread" : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!item.read ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() => act(item.id, "read")}
                    >
                      Mark read
                    </Button>
                  ) : null}
                  {item.link ? (
                    <Button asChild size="sm" className="rounded-lg">
                      <Link href={item.link}>Open</Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
