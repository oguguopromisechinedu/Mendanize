"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type {
  MenuLocationRecord,
  NavigationMenuRecord,
} from "@/services/navigation/types";
import { assignLocationAction } from "../actions/actions";
import { LOCATION_LABELS } from "../constants/constants";
import { NavigationCmsNav } from "./navigation-cms-nav";

export function LocationsView({
  locations,
  menus,
}: {
  locations: MenuLocationRecord[];
  menus: Array<Pick<NavigationMenuRecord, "id" | "name" | "slug">>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(locations.map((l) => [l.key, l.menuId])),
  );

  function save(key: string) {
    startTransition(async () => {
      const res = await assignLocationAction({
        key,
        menuId: draft[key] || null,
      });
      if (!res.ok) toast.error(res.message);
      else {
        toast.success(res.message);
        router.refresh();
      }
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Menu locations"
        description="Point each surface at a reusable menu without rebuilding."
      />
      <NavigationCmsNav />

      <div className="space-y-3">
        {locations.map((loc) => (
          <AdminPanel
            key={loc.id}
            title={LOCATION_LABELS[loc.key] ?? loc.label}
            description={loc.key}
          >
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[16rem] flex-1 space-y-1.5">
                <Label htmlFor={`loc-${loc.key}`}>Assigned menu</Label>
                <Select
                  id={`loc-${loc.key}`}
                  value={draft[loc.key] ?? ""}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      [loc.key]: e.target.value || null,
                    }))
                  }
                >
                  <option value="">— Unassigned —</option>
                  {menus.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </Select>
              </div>
              <Button
                size="sm"
                disabled={pending}
                onClick={() => save(loc.key)}
              >
                Save
              </Button>
            </div>
          </AdminPanel>
        ))}
      </div>
    </div>
  );
}
