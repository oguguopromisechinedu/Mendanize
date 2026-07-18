"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { NavigationMenuRecord } from "@/services/navigation/types";
import { saveMenuAction } from "../actions/actions";
import {
  draftsToWrite,
  itemsFromRecords,
  MenuBuilder,
  type MenuItemDraft,
} from "./menu-builder";
import { NavigationCmsNav } from "./navigation-cms-nav";

export function MenuLocationBuilderView({
  title,
  description,
  menu,
  emptyHint,
}: {
  title: string;
  description: string;
  menu: NavigationMenuRecord | null;
  emptyHint?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(menu?.name ?? "");
  const [items, setItems] = useState<MenuItemDraft[]>(() =>
    menu ? itemsFromRecords(menu.items) : [],
  );

  if (!menu) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <AdminPageHeader title={title} description={description} />
        <NavigationCmsNav />
        <AdminPanel title="No menu assigned">
          <p className="text-sm text-muted-foreground">
            {emptyHint ??
              "Assign a menu to this location under Locations, then return here to edit."}
          </p>
          <Button asChild size="sm" className="mt-3">
            <a href="/dashboard/navigation/locations">Open locations</a>
          </Button>
        </AdminPanel>
      </div>
    );
  }

  function save() {
    startTransition(async () => {
      const res = await saveMenuAction(menu!.id, {
        name: name.trim() || menu!.name,
        maxDepth: menu!.maxDepth,
        items: draftsToWrite(items),
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
        title={title}
        description={description}
        actions={
          <Button size="sm" disabled={pending} onClick={save}>
            Save menu
          </Button>
        }
      />
      <NavigationCmsNav />

      <AdminPanel title="Menu" description={`Max depth ${menu.maxDepth}`}>
        <div className="mb-4 max-w-md space-y-1.5">
          <Label htmlFor="menu-name">Name</Label>
          <Input
            id="menu-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <MenuBuilder
          items={items}
          maxDepth={menu.maxDepth}
          onChange={setItems}
        />
      </AdminPanel>
    </div>
  );
}
