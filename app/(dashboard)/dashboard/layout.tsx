import { redirect } from "next/navigation";

import { requireEditor } from "@/features/authentication/server";
import { DashboardShell } from "@/features/admin-dashboard";
import { getAdminNavigationConfig } from "@/services/settings/admin-navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireEditor();
  if (!session) {
    redirect("/dashboard/login");
  }

  // Adapt AdminSession into the shape DashboardShell historically expected
  const shellSession = {
    user: {
      id: session.admin.id,
      email: session.admin.email,
      name: session.admin.name,
      image: session.admin.image,
      role: session.admin.roleKey,
      roleName: session.admin.roleName,
    },
    expires: session.expires,
  };

  const nav = await getAdminNavigationConfig();

  return (
    <DashboardShell session={shellSession} nav={nav}>
      {children}
    </DashboardShell>
  );
}
