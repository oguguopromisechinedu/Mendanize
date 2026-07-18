import Link from "next/link";

import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard";
import { Button } from "@/components/ui/button";
import type { SettingsDashboardOverview } from "@/services/settings/platform-types";
import { SettingsCmsNav } from "./settings-cms-nav";

export function SettingsDashboardView({
  overview,
}: {
  overview: SettingsDashboardOverview;
}) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Platform settings"
        description="Single control plane for branding, auth, AI, search, email, security, and feature flags."
      />
      <SettingsCmsNav />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminPanel title="Platform">
          <p className="text-lg font-semibold">{overview.general.platformName}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            v{overview.version}
          </p>
        </AdminPanel>
        <AdminPanel title="Active features">
          <p className="text-2xl font-semibold">{overview.activeFeatureCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            of {overview.flags.length} flags
          </p>
        </AdminPanel>
        <AdminPanel title="Maintenance">
          <p className="text-lg font-semibold">
            {overview.maintenance.enabled ? "On" : "Off"}
          </p>
        </AdminPanel>
        <AdminPanel title="Last updated">
          <p className="text-sm">
            {new Date(overview.lastUpdated).toLocaleString()}
          </p>
        </AdminPanel>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(
          [
            ["Auth", overview.auth.registrationEnabled ? "Registration on" : "Registration off", "/dashboard/settings/authentication"],
            ["AI", `${overview.ai.defaultTextProvider} / ${overview.ai.defaultImageProvider}`, "/dashboard/settings/ai"],
            ["Search", overview.search.enabled ? `Limit ${overview.search.resultLimit}` : "Disabled", "/dashboard/settings/search"],
            ["Email", overview.email.senderEmail, "/dashboard/settings/email"],
            ["Maintenance", overview.maintenance.enabled ? "Banner active" : "Normal ops", "/dashboard/settings/maintenance"],
            ["Search CMS", "Advanced search config", "/dashboard/search-settings"],
          ] as const
        ).map(([title, body, href]) => (
          <AdminPanel key={href} title={title}>
            <p className="text-sm text-muted-foreground">{body}</p>
            <Button asChild size="sm" variant="outline" className="mt-3">
              <Link href={href}>Open</Link>
            </Button>
          </AdminPanel>
        ))}
      </div>
    </div>
  );
}
