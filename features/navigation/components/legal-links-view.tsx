"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { LegalLinkRecord } from "@/services/navigation/types";
import { saveLegalLinksAction } from "../actions/actions";
import { NavigationCmsNav } from "./navigation-cms-nav";

type Draft = { label: string; href: string; visible: boolean };

export function LegalLinksView({ links }: { links: LegalLinkRecord[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<Draft[]>(() =>
    links.map((l) => ({
      label: l.label,
      href: l.href,
      visible: l.visible,
    })),
  );

  function save() {
    startTransition(async () => {
      const res = await saveLegalLinksAction(draft);
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
        title="Legal links"
        description="Shown as the Legal column in the public footer."
        actions={
          <Button size="sm" disabled={pending} onClick={save}>
            Save legal links
          </Button>
        }
      />
      <NavigationCmsNav />

      <AdminPanel title="Links">
        <div className="space-y-4">
          {draft.map((row, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-3"
            >
              <div className="space-y-1.5">
                <Label>Label</Label>
                <Input
                  value={row.label}
                  onChange={(e) =>
                    setDraft((prev) =>
                      prev.map((r, i) =>
                        i === index ? { ...r, label: e.target.value } : r,
                      ),
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>URL</Label>
                <Input
                  value={row.href}
                  onChange={(e) =>
                    setDraft((prev) =>
                      prev.map((r, i) =>
                        i === index ? { ...r, href: e.target.value } : r,
                      ),
                    )
                  }
                />
              </div>
              <div className="flex items-center justify-between gap-2 pt-6">
                <Label>Visible</Label>
                <Switch
                  checked={row.visible}
                  onCheckedChange={(v) =>
                    setDraft((prev) =>
                      prev.map((r, i) =>
                        i === index ? { ...r, visible: Boolean(v) } : r,
                      ),
                    )
                  }
                />
              </div>
              <div className="flex gap-2 sm:col-span-3">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={index === 0}
                  onClick={() =>
                    setDraft((prev) => {
                      const copy = [...prev];
                      const tmp = copy[index - 1];
                      copy[index - 1] = copy[index];
                      copy[index] = tmp;
                      return copy;
                    })
                  }
                >
                  Up
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={index === draft.length - 1}
                  onClick={() =>
                    setDraft((prev) => {
                      const copy = [...prev];
                      const tmp = copy[index + 1];
                      copy[index + 1] = copy[index];
                      copy[index] = tmp;
                      return copy;
                    })
                  }
                >
                  Down
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setDraft((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-4"
          onClick={() =>
            setDraft((prev) => [
              ...prev,
              { label: "New", href: "/", visible: true },
            ])
          }
        >
          Add link
        </Button>
      </AdminPanel>
    </div>
  );
}
