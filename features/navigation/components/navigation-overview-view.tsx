"use client";

import Link from "next/link";

import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard";
import { Button } from "@/components/ui/button";
import type { NavigationOverview } from "@/services/navigation/types";
import { LOCATION_LABELS } from "../constants/constants";
import { NavigationCmsNav } from "./navigation-cms-nav";

export function NavigationOverviewView({
  overview,
}: {
  overview: NavigationOverview;
}) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Navbar Manager"
        description="Manage main, mobile, footer, utility, legal, and social navigation."
      />
      <NavigationCmsNav />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminPanel title="Brand">
          <p className="text-sm font-medium text-foreground">
            {overview.settings.brandName}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {overview.settings.brandHref}
          </p>
        </AdminPanel>
        <AdminPanel title="Menus">
          <p className="text-2xl font-semibold text-foreground">
            {overview.menus.length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Reusable structures</p>
        </AdminPanel>
        <AdminPanel title="Social">
          <p className="text-2xl font-semibold text-foreground">
            {overview.socialCount}
          </p>
        </AdminPanel>
        <AdminPanel title="Legal">
          <p className="text-2xl font-semibold text-foreground">
            {overview.legalCount}
          </p>
        </AdminPanel>
      </div>

      <AdminPanel title="Menu locations" description="Which menu powers each surface">
        <ul className="divide-y divide-border">
          {overview.locations.map((loc) => (
            <li
              key={loc.id}
              className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
            >
              <span className="font-medium text-foreground">
                {LOCATION_LABELS[loc.key] ?? loc.label}
              </span>
              <span className="text-muted-foreground">
                {loc.menuName ?? "Unassigned"}
              </span>
            </li>
          ))}
        </ul>
        <Button asChild size="sm" variant="outline" className="mt-3">
          <Link href="/dashboard/navigation/locations">Manage locations</Link>
        </Button>
      </AdminPanel>

      <AdminPanel title="Menus">
        <ul className="divide-y divide-border">
          {overview.menus.map((menu) => (
            <li
              key={menu.id}
              className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-foreground">{menu.name}</p>
                <p className="text-xs text-muted-foreground">
                  {menu.itemCount} items · {menu.slug}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </AdminPanel>
    </div>
  );
}
