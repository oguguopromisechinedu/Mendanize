"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard";
import { Switch } from "@/components/ui/switch";
import type {
  InterestOption,
  UserInterestRecord,
} from "@/services/learning";
import { setInterestAction } from "../actions/actions";
import { LearningNav } from "./learning-nav";

function isSelected(
  interests: UserInterestRecord[],
  kind: "category" | "topic",
  id: string,
) {
  return interests.some((i) =>
    kind === "category" ? i.categoryId === id && !i.topicId : i.topicId === id,
  );
}

export function InterestsView({
  interests,
  taxonomy,
}: {
  interests: UserInterestRecord[];
  taxonomy: { categories: InterestOption[]; topics: InterestOption[] };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle(
    kind: "category" | "topic",
    id: string,
    enabled: boolean,
  ) {
    startTransition(async () => {
      const res = await setInterestAction({
        categoryId: kind === "category" ? id : null,
        topicId: kind === "topic" ? id : null,
        enabled,
      });
      if (!res.ok) toast.error(res.message);
      else {
        toast.success(res.message);
        router.refresh();
      }
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AdminPageHeader
        title="My interests"
        description="Select categories and topics from the platform taxonomy. These feed Recommendations."
      />
      <LearningNav />

      <AdminPanel title="Categories">
        <ul className="grid gap-3 sm:grid-cols-2">
          {taxonomy.categories.map((c) => {
            const on = isSelected(interests, "category", c.id);
            return (
              <li
                key={c.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
              >
                <span className="text-sm">{c.name}</span>
                <Switch
                  checked={on}
                  disabled={pending}
                  onCheckedChange={(v) => toggle("category", c.id, Boolean(v))}
                />
              </li>
            );
          })}
        </ul>
      </AdminPanel>

      <AdminPanel title="Topics">
        <ul className="grid gap-3 sm:grid-cols-2">
          {taxonomy.topics.map((t) => {
            const on = isSelected(interests, "topic", t.id);
            return (
              <li
                key={t.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
              >
                <span className="text-sm">{t.name}</span>
                <Switch
                  checked={on}
                  disabled={pending}
                  onCheckedChange={(v) => toggle("topic", t.id, Boolean(v))}
                />
              </li>
            );
          })}
        </ul>
      </AdminPanel>
    </div>
  );
}
