import { loadLearningDashboard, loadLearnerEcosystemExtras } from "@/features/user-learning/server";
import { loadBillingDashboard } from "@/features/billing/server";
import type { Metadata } from "next";

import { requirePublicUser } from "@/features/authentication/server";
import { loadCenter } from "@/features/notifications/services/service";
import {
  LearningDashboardView } from "@/features/user-learning";
import { loadLearnerShellConfig } from "@/features/user-learning/services/learner-shell-config";

export const metadata: Metadata = {
  title: "Creators Hub",
  robots: { index: false },
};

export default async function Page() {
  const session = await requirePublicUser();
  const userId = session!.user.id;

  const [data, billing, notifications, shell, ecosystem] = await Promise.all([
    loadLearningDashboard(userId, session!.user.name),
    loadBillingDashboard(userId).catch(() => null),
    loadCenter(userId, { pageSize: 5 }).catch(() => null),
    loadLearnerShellConfig(userId).catch(() => ({
      flags: {} as Record<string, boolean>,
      navGroups: [],
      quickActions: [],
      spaces: [{ label: "Browse project templates", href: "/account/projects" }],
    })),
    loadLearnerEcosystemExtras(userId).catch(() => ({
      openJobs: [],
      recentProjects: [],
      marketplaceListings: [],
      marketplaceOverview: {
        activeProjects: 0,
        activeProjectsTrend: "No active contracts yet",
        openJobs: 0,
        openJobsTrend: "Check back soon",
        totalEarnedCents: 0,
        totalEarnedTrend: "Complete projects to earn",
        proposalCount: 0,
        shortlistedCount: 0,
      },
      careerReadiness: { score: 0, gaps: [] },
    })),
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
        ecosystem,
      }}
    />
  );
}
