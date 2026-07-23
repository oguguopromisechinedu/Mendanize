import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { requireEditor } from "@/features/authentication/server";

export const metadata: Metadata = {
  title: "Notification preferences",
  robots: { index: false },
};

/**
 * Learner notification preferences are PublicUser-scoped at /account/preferences.
 * Admin delivery settings live under platform settings.
 */
export default async function Page() {
  const session = await requireEditor();
  if (!session?.admin?.id) {
    redirect("/dashboard/login");
  }
  redirect("/dashboard/settings");
}
