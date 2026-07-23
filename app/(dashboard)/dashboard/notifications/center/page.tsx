import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { requireEditor } from "@/features/authentication/server";
import {
  NotificationCenterView,
  loadAdminCenter,
} from "@/features/notifications";

export const metadata: Metadata = {
  title: "Notification center",
  robots: { index: false },
};

/** Admin notification inbox — Admin session (MES-030). */
export default async function Page() {
  const session = await requireEditor();
  if (!session?.admin?.id) {
    redirect("/dashboard/login");
  }
  const initial = await loadAdminCenter(session.admin.id);
  return <NotificationCenterView initial={initial} />;
}
