import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { requireEditor } from "@/features/authentication/server";
import {
  NotificationsDashboardView,
  loadDashboard,
} from "@/features/notifications";

export const metadata: Metadata = {
  title: "Notifications",
  robots: { index: false },
};

/** Admin ops notification overview — uses Admin session (MES-030). */
export default async function Page() {
  const session = await requireEditor();
  if (!session?.admin?.id) {
    redirect("/dashboard/login");
  }
  const data = await loadDashboard(session.admin.id);
  return <NotificationsDashboardView data={data} />;
}
