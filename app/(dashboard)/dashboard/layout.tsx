import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { requireEditor } from "@/features/authentication/server";
import { DashboardShell } from "@/features/admin-dashboard";
import { getAdminNavigationConfig } from "@/services/settings/admin-navigation";

const PUBLIC_DASHBOARD_PATHS = ["/dashboard/accept-invite"] as const;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  if (
    PUBLIC_DASHBOARD_PATHS.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`),
    )
  ) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    );
  }

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

  const nav = await getAdminNavigationConfig(session.admin.roleKey);

  return (
    <DashboardShell session={shellSession} nav={nav}>
      {children}
    </DashboardShell>
  );
}
