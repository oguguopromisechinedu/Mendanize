"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { NavigationSiteSettingsRecord } from "@/services/navigation/types";
import { saveNavigationSettingsAction } from "../actions/actions";
import { NavigationCmsNav } from "./navigation-cms-nav";

export function NavigationSettingsView({
  settings,
}: {
  settings: NavigationSiteSettingsRecord;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState({
    brandName: settings.brandName,
    brandHref: settings.brandHref,
    brandTagline: settings.brandTagline ?? "",
    signInHref: settings.signInHref,
    copyrightText: settings.copyrightText ?? "",
    newsletterEnabled: settings.newsletterEnabled,
    newsletterHeadline: settings.newsletterHeadline ?? "",
    newsletterPlaceholder: settings.newsletterPlaceholder ?? "",
  });

  function save() {
    startTransition(async () => {
      const res = await saveNavigationSettingsAction({
        brandName: draft.brandName,
        brandHref: draft.brandHref,
        brandTagline: draft.brandTagline || null,
        signInHref: draft.signInHref,
        copyrightText: draft.copyrightText || null,
        newsletterEnabled: draft.newsletterEnabled,
        newsletterHeadline: draft.newsletterHeadline || null,
        newsletterPlaceholder: draft.newsletterPlaceholder || null,
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
        title="Navigation settings"
        description="Brand, sign-in, copyright, and newsletter placeholder."
        actions={
          <Button size="sm" disabled={pending} onClick={save}>
            Save settings
          </Button>
        }
      />
      <NavigationCmsNav />

      <AdminPanel title="Brand & utility">
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["brandName", "Brand name"],
              ["brandHref", "Brand href"],
              ["brandTagline", "Tagline"],
              ["signInHref", "Sign-in href"],
              ["copyrightText", "Copyright text"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                value={draft[key]}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, [key]: e.target.value }))
                }
              />
            </div>
          ))}
        </div>
      </AdminPanel>

      <AdminPanel title="Newsletter">
        <div className="mb-4 flex items-center justify-between gap-2">
          <Label htmlFor="newsletterEnabled">Enabled</Label>
          <Switch
            id="newsletterEnabled"
            checked={draft.newsletterEnabled}
            onCheckedChange={(v) =>
              setDraft((prev) => ({ ...prev, newsletterEnabled: Boolean(v) }))
            }
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="newsletterHeadline">Headline</Label>
            <Input
              id="newsletterHeadline"
              value={draft.newsletterHeadline}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  newsletterHeadline: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newsletterPlaceholder">Placeholder</Label>
            <Input
              id="newsletterPlaceholder"
              value={draft.newsletterPlaceholder}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  newsletterPlaceholder: e.target.value,
                }))
              }
            />
          </div>
        </div>
      </AdminPanel>
    </div>
  );
}
