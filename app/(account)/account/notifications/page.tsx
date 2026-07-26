import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { requirePublicUser } from "@/features/authentication/server";
import { LearnerNotificationsView } from "@/features/user-learning/components/learner-notifications-view";
import { loadCenter } from "@/features/notifications/services/service";

export const metadata: Metadata = {
  title: "Notifications",
  robots: { index: false },
};

export default async function Page() {
  const session = await requirePublicUser();
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/account/notifications");
  }
  const initial = await loadCenter(session.user.id, { pageSize: 40 });
  return <LearnerNotificationsView initial={initial} />;
}
