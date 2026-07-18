"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { GlobalSEOSettingsRecord } from "@/services/seo/types"
import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { saveGlobalSeoAction } from "../actions/actions"
import { SeoCmsNav } from "./seo-cms-nav"

export function SeoSettingsView({
  settings,
}: {
  settings: GlobalSEOSettingsRecord
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState({ ...settings })

  function save() {
    startTransition(async () => {
      const res = await saveGlobalSeoAction({
        websiteTitle: form.websiteTitle,
        defaultMetaTitle: form.defaultMetaTitle,
        defaultMetaDescription: form.defaultMetaDescription,
        defaultOgImageUrl: form.defaultOgImageUrl,
        defaultTwitterImageUrl: form.defaultTwitterImageUrl,
        brandName: form.brandName,
        siteLanguage: form.siteLanguage,
        canonicalDomain: form.canonicalDomain,
        defaultRobotsIndex: form.defaultRobotsIndex,
        defaultRobotsFollow: form.defaultRobotsFollow,
        faviconUrl: form.faviconUrl,
        appleTouchIconUrl: form.appleTouchIconUrl,
      })
      if (!res.ok) toast.error(res.message)
      else {
        toast.success(res.message)
        router.refresh()
      }
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Global SEO settings"
        description="Defaults applied when content-level metadata is empty."
        actions={
          <Button size="sm" disabled={pending} onClick={save}>
            Save
          </Button>
        }
      />
      <SeoCmsNav />
      <AdminPanel title="Site identity">
        <div className="space-y-3">
          {(
            [
              ["websiteTitle", "Website title"],
              ["brandName", "Brand name"],
              ["siteLanguage", "Site language"],
              ["canonicalDomain", "Canonical domain"],
              ["faviconUrl", "Favicon URL"],
              ["appleTouchIconUrl", "Apple touch icon URL"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-1.5">
              <Label>{label}</Label>
              <Input
                value={form[key] ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [key]: e.target.value }))
                }
              />
            </div>
          ))}
        </div>
      </AdminPanel>
      <AdminPanel title="Default metadata">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Default meta title</Label>
            <Input
              value={form.defaultMetaTitle ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  defaultMetaTitle: e.target.value,
                }))
              }
              maxLength={70}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Default meta description</Label>
            <Textarea
              rows={3}
              value={form.defaultMetaDescription ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  defaultMetaDescription: e.target.value,
                }))
              }
              maxLength={160}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Default OG image</Label>
            <Input
              value={form.defaultOgImageUrl ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  defaultOgImageUrl: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Default Twitter image</Label>
            <Input
              value={form.defaultTwitterImageUrl ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  defaultTwitterImageUrl: e.target.value,
                }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Default robots index</Label>
            <Switch
              checked={form.defaultRobotsIndex}
              onCheckedChange={(v) =>
                setForm((prev) => ({
                  ...prev,
                  defaultRobotsIndex: Boolean(v),
                }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Default robots follow</Label>
            <Switch
              checked={form.defaultRobotsFollow}
              onCheckedChange={(v) =>
                setForm((prev) => ({
                  ...prev,
                  defaultRobotsFollow: Boolean(v),
                }))
              }
            />
          </div>
        </div>
      </AdminPanel>
    </div>
  )
}
