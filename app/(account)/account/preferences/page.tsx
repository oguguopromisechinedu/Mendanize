import { loadPreferencesPage } from "@/features/user-learning/server";
import type { Metadata } from "next";

import { requirePublicUser } from "@/features/authentication/server";
import {
  PreferencesView } from "@/features/user-learning";
import { loadPreferences as loadNotificationPreferences } from "@/features/notifications/services/service";

export const metadata: Metadata = {
  title: "Account preferences",
  robots: { index: false },
};

export default async function Page() {
  const session = await requirePublicUser();
  const userId = session!.user.id;
  const [data, notificationPreferences] = await Promise.all([
    loadPreferencesPage(userId),
    loadNotificationPreferences(userId).catch(() => null),
  ]);
  return (
    <PreferencesView
      preferences={data.preferences}
      goals={data.goals}
      taxonomy={data.taxonomy}
      notificationPreferences={notificationPreferences}
    />
  );
}
