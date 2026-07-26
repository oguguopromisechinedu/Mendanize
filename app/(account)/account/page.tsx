import type { Metadata } from "next";

import { requirePublicUser } from "@/features/authentication/server";
import { loadBillingDashboard } from "@/features/billing";
import { loadCenter } from "@/features/notifications/services/service";
import {
  LearningDashboardView,
  loadLearningDashboard,
} from "@/features/user-learning";
import { loadLearnerShellConfig } from "@/features/user-learning/services/learner-shell-config";

export const metadata: Metadata = {
  title: "My Learning",
  robots: { index: false },
};

export default async function Page() {
  const session = await requirePublicUser();
  const userId = session!.user.id;

  const [data, billing, notifications, shell] = await Promise.all([
    loadLearningDashboard(userId, session!.user.name),
    loadBillingDashboard(userId).catch(() => null),
    loadCenter(userId, { pageSize: 5 }).catch(() => null),
    loadLearnerShellConfig(userId),
  ]);

  return (
    <LearningDashboardView
      data={data}
      extras={{
        planName: billing?.planName ?? "Free",
        unreadCount: notifications?.unreadCount ?? 0,
        recentNotifications: (notifications?.items ?? []).map((n) => ({
          id: n.id,
          title: n.title,
          body: n.preview ?? n.body,
          createdAt: n.createdAt,
          link: n.link,
        })),
        quickActions: shell.quickActions,
      }}
    />
  );
}
