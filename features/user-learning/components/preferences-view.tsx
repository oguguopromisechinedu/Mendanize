"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type {
  InterestOption,
  LearningGoalRecord,
  UserPreferenceRecord,
} from "@/services/learning";
import type { NotificationPreferenceRecord } from "@/services/notification";
import {
  deleteGoalAction,
  saveGoalAction,
  savePreferencesAction,
} from "../actions/actions";
import { saveNotificationPreferencesAction } from "@/features/notifications/actions/actions";
import { DIFFICULTY_OPTIONS, THEME_OPTIONS } from "../constants/constants";
import { LearningNav } from "./learning-nav";

export function PreferencesView({
  preferences,
  goals,
  taxonomy,
  notificationPreferences,
}: {
  preferences: UserPreferenceRecord;
  goals: LearningGoalRecord[];
  taxonomy: { categories: InterestOption[]; topics: InterestOption[] };
  notificationPreferences?: NotificationPreferenceRecord | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(preferences);
  const [goalTitle, setGoalTitle] = useState("");
  const [notifForm, setNotifForm] = useState(notificationPreferences ?? null);

  function savePrefs() {
    startTransition(async () => {
      const res = await savePreferencesAction({
        preferredDifficulty: form.preferredDifficulty as
          | "BEGINNER"
          | "INTERMEDIATE"
          | "ADVANCED",
        dailyReminderEnabled: form.dailyReminderEnabled,
        preferredCategoryIds: form.preferredCategoryIds,
        preferredTopicIds: form.preferredTopicIds,
        themePreference: form.themePreference as "system" | "light" | "dark",
      });
      if (!res.ok) toast.error(res.message);
      else {
        toast.success(res.message);
        router.refresh();
      }
    });
  }

  function addGoal() {
    if (!goalTitle.trim()) return;
    startTransition(async () => {
      const res = await saveGoalAction({ title: goalTitle.trim() });
      if (!res.ok) toast.error(res.message);
      else {
        toast.success(res.message);
        setGoalTitle("");
        router.refresh();
      }
    });
  }

  function removeGoal(id: string) {
    startTransition(async () => {
      const res = await deleteGoalAction(id);
      if (!res.ok) toast.error(res.message);
      else {
        toast.success(res.message);
        router.refresh();
      }
    });
  }

  function toggleId(
    field: "preferredCategoryIds" | "preferredTopicIds",
    id: string,
  ) {
    setForm((p) => {
      const set = new Set(p[field]);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return { ...p, [field]: Array.from(set) };
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Account preferences"
        description="Difficulty, goals, reminders (placeholder), preferred taxonomy, and theme."
        actions={
          <Button size="sm" disabled={pending} onClick={savePrefs}>
            Save preferences
          </Button>
        }
      />
      <LearningNav />

      <AdminPanel title="Learning preferences">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Preferred difficulty</Label>
            <Select
              value={form.preferredDifficulty}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  preferredDifficulty: e.target.value,
                }))
              }
            >
              {DIFFICULTY_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Theme</Label>
            <Select
              value={form.themePreference}
              onChange={(e) =>
                setForm((p) => ({ ...p, themePreference: e.target.value }))
              }
            >
              {THEME_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            <p className="text-xs text-muted-foreground">
              Reads Design Customization tokens; preference stored on your
              account.
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2">
          <div>
            <Label>Daily reminder</Label>
            <p className="text-xs text-muted-foreground">
              Placeholder — email/push reminders are out of scope.
            </p>
          </div>
          <Switch
            checked={form.dailyReminderEnabled}
            onCheckedChange={(v) =>
              setForm((p) => ({ ...p, dailyReminderEnabled: Boolean(v) }))
            }
          />
        </div>
      </AdminPanel>

      <AdminPanel title="Preferred categories">
        <div className="flex flex-wrap gap-2">
          {taxonomy.categories.map((c) => {
            const on = form.preferredCategoryIds.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleId("preferredCategoryIds", c.id)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  on
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </AdminPanel>

      <AdminPanel title="Preferred topics">
        <div className="flex flex-wrap gap-2">
          {taxonomy.topics.map((t) => {
            const on = form.preferredTopicIds.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleId("preferredTopicIds", t.id)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  on
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      </AdminPanel>

      <AdminPanel title="Learning goals">
        <div className="flex gap-2">
          <Input
            placeholder="Add a goal…"
            value={goalTitle}
            onChange={(e) => setGoalTitle(e.target.value)}
          />
          <Button size="sm" disabled={pending} onClick={addGoal}>
            Add
          </Button>
        </div>
        <ul className="mt-4 divide-y divide-border">
          {goals.map((g) => (
            <li
              key={g.id}
              className="flex items-center justify-between gap-2 py-2 text-sm"
            >
              <span>{g.title}</span>
              <Button
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() => removeGoal(g.id)}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </AdminPanel>

      <AdminPanel title="Notification preferences">
        <p className="mb-3 text-sm text-muted-foreground">
          Administrators publish announcements and system messages. These toggles
          control what reaches your learner inbox — not the admin dashboard.
        </p>
        {notifForm ? (
          <>
            {(
              [
                ["learningUpdates", "Learning updates"],
                ["aiUpdates", "AI Tutor updates"],
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
                  checked={notifForm[key]}
                  onCheckedChange={(v) =>
                    setNotifForm((p) => (p ? { ...p, [key]: Boolean(v) } : p))
                  }
                />
              </div>
            ))}
            <Button
              size="sm"
              className="mt-4"
              disabled={pending}
              onClick={() => {
                if (!notifForm) return;
                startTransition(async () => {
                  const res = await saveNotificationPreferencesAction({
                    learningUpdates: notifForm.learningUpdates,
                    aiUpdates: notifForm.aiUpdates,
                    securityAlerts: notifForm.securityAlerts,
                    newsletter: notifForm.newsletter,
                    productUpdates: notifForm.productUpdates,
                    announcements: notifForm.announcements,
                  });
                  if (!res.ok) toast.error(res.message);
                  else {
                    toast.success(res.message);
                    router.refresh();
                  }
                });
              }}
            >
              Save notification preferences
            </Button>
          </>
        ) : (
          <Button asChild size="sm" variant="outline" className="mt-1">
            <Link href="/account/notifications">Open notifications</Link>
          </Button>
        )}
      </AdminPanel>
    </div>
  );
}
