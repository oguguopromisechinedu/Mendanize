import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { requirePublicUser } from "@/features/authentication/server";
import { LearnerShell } from "@/features/user-learning/components/learner-shell";
import { loadLearnerShellConfig } from "@/features/user-learning/services/learner-shell-config";
import { loadBillingDashboard } from "@/features/billing";
import { loadDashboard } from "@/features/notifications/services/service";
import { isFeatureEnabled } from "@/services/settings/platform";

/** Learner AI Tutor — gated by Admin FeatureFlag `ask_mendanize`. */
export default async function AskLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requirePublicUser();
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent("/ask")}`);
  }

  const askEnabled = await isFeatureEnabled("ask_mendanize");
  if (!askEnabled) {
    redirect("/account?ask=disabled");
  }

  const userId = session.user.id;
  const [shellConfig, billing, notifDash] = await Promise.all([
    loadLearnerShellConfig(userId).catch(() => ({
      flags: {} as Record<string, boolean>,
      navGroups: [],
      quickActions: [],
      spaces: [{ label: "Browse project templates", href: "/account/projects" }],
    })),
    loadBillingDashboard(userId).catch(() => null),
    loadDashboard(userId).catch(() => null),
  ]);

  return (
    <LearnerShell
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
      planName={billing?.planName ?? "Free"}
      unreadCount={notifDash?.unreadCount ?? 0}
      navGroups={shellConfig.navGroups}
      spaces={shellConfig.spaces}
    >
      {children}
    </LearnerShell>
  );
}
