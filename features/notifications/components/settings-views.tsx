"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type {
  DeliverySettingRecord,
  NotificationPreferenceRecord,
} from "@/services/notification";
import {
  saveDeliverySettingsAction,
  saveNotificationPreferencesAction,
} from "../actions/actions";
import { NotificationsNav } from "./notifications-nav";

export function DeliverySettingsView({
  settings,
}: {
  settings: DeliverySettingRecord;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(settings);

  function save() {
    startTransition(async () => {
      const res = await saveDeliverySettingsAction(form);
      if (!res.ok) toast.error(res.message);
      else {
        toast.success(res.message);
        router.refresh();
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Delivery settings"
        description="Channel toggles. Push/SMS/SMTP are placeholders."
        actions={
          <Button size="sm" disabled={pending} onClick={save}>
            Save
          </Button>
        }
      />
      <NotificationsNav />
      <AdminPanel title="Channels">
        {(
          [
            ["inAppEnabled", "In-app"],
            ["emailEnabled", "Email"],
            ["browserPushEnabled", "Browser / push (placeholder)"],
            ["smsEnabled", "SMS (placeholder)"],
          ] as const
        ).map(([key, label]) => (
          <div
            key={key}
            className="flex items-center justify-between gap-2 border-b border-border py-3 last:border-0"
          >
            <Label>{label}</Label>
            <Switch
              checked={form[key]}
              onCheckedChange={(v) =>
                setForm((p) => ({ ...p, [key]: Boolean(v) }))
              }
            />
          </div>
        ))}
        <div className="mt-4 space-y-1.5">
          <Label>SMTP note</Label>
          <Textarea
            rows={3}
            value={form.smtpNote ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, smtpNote: e.target.value }))
            }
          />
        </div>
      </AdminPanel>
    </div>
  );
}

export function NotificationPreferencesView({
  preferences,
}: {
  preferences: NotificationPreferenceRecord;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(preferences);

  function save() {
    startTransition(async () => {
      const res = await saveNotificationPreferencesAction(form);
      if (!res.ok) toast.error(res.message);
      else {
        toast.success(res.message);
        router.refresh();
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Notification preferences"
        description="Per-user toggles also available from My Learning → Preferences (MES-022)."
        actions={
          <Button size="sm" disabled={pending} onClick={save}>
            Save
          </Button>
        }
      />
      <NotificationsNav />
      <AdminPanel title="Preferences">
        {(
          [
            ["learningUpdates", "Learning updates"],
            ["aiUpdates", "AI updates"],
            ["securityAlerts", "Security alerts"],
            ["newsletter", "Newsletter"],
            ["productUpdates", "Product updates"],
            ["announcements", "Announcements"],
          ] as const
        ).map(([key, label]) => (
          <div
            key={key}
            className="flex items-center justify-between gap-2 border-b border-border py-3 last:border-0"
          >
            <Label>{label}</Label>
            <Switch
              checked={form[key]}
              onCheckedChange={(v) =>
                setForm((p) => ({ ...p, [key]: Boolean(v) }))
              }
            />
          </div>
        ))}
      </AdminPanel>
    </div>
  );
}
