import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { requirePublicUser } from "@/features/authentication/server";
import { LearnerShell } from "@/features/user-learning/components/learner-shell";
import { loadLearnerShellConfig } from "@/features/user-learning/services/learner-shell-config";
import { loadBillingDashboard } from "@/features/billing";
import { loadDashboard } from "@/features/notifications/services/service";

/**
 * Authenticated PublicUser account area — MES-022 / MES-030.
 * Admin dashboard is the single source of truth for flags, plans, and published content.
 */
export default async function Layout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requirePublicUser();
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent("/account")}`);
  }

  const userId = session.user.id;
  let planName = "Free";
  let unreadCount = 0;

  const [shellConfig, billing, notifDash] = await Promise.all([
    loadLearnerShellConfig(userId),
    loadBillingDashboard(userId).catch(() => null),
    loadDashboard(userId).catch(() => null),
  ]);

  planName = billing?.planName ?? "Free";
  unreadCount = notifDash?.unreadCount ?? 0;

  return (
    <LearnerShell
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
      planName={planName}
      unreadCount={unreadCount}
      navGroups={shellConfig.navGroups}
      spaces={shellConfig.spaces}
    >
      {children}
    </LearnerShell>
  );
}
