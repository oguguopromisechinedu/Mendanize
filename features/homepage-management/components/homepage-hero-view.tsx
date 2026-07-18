"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { HomepageAdminRecord } from "@/services/content/types"
import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard"
import { MediaPicker } from "@/features/media-library"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { updateHomepageAction } from "../actions/actions"
import { HomepageCmsNav } from "./homepage-cms-nav"

export function HomepageHeroView({ record }: { record: HomepageAdminRecord }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState({
    ...record.hero,
    showAskInHero: record.hero.showAskInHero ?? true,
  })

  function save() {
    startTransition(async () => {
      const res = await updateHomepageAction({ hero: form })
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
        title="Hero management"
        description="Headline, CTAs, media, gradient, and Ask placeholder."
        actions={
          <Button size="sm" disabled={pending} onClick={save}>
            Save hero
          </Button>
        }
      />
      <HomepageCmsNav />
      <AdminPanel title="Content">
        <div className="space-y-3">
          {(
            [
              ["eyebrow", "Eyebrow badge"],
              ["headline", "Headline"],
              ["headlineAccent", "Headline accent (gradient)"],
              ["primaryCtaLabel", "Primary CTA label"],
              ["primaryCtaHref", "Primary CTA href"],
              ["secondaryCtaLabel", "Secondary CTA label"],
              ["secondaryCtaHref", "Secondary CTA href"],
              ["trustLine", "Trust indicators"],
              ["backgroundGradient", "Background gradient CSS"],
              ["askPlaceholder", "Ask Mendanize placeholder"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                value={form[key] ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [key]: e.target.value }))
                }
              />
            </div>
          ))}
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="showAskInHero">Show Ask bar in hero</Label>
            <Switch
              id="showAskInHero"
              checked={form.showAskInHero}
              onCheckedChange={(v) =>
                setForm((prev) => ({ ...prev, showAskInHero: Boolean(v) }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={form.brand}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, brand: e.target.value }))
              }
            />
          </div>
          <MediaPicker
            label="Hero image"
            value={form.heroImageUrl}
            onChange={(url) =>
              setForm((prev) => ({ ...prev, heroImageUrl: url }))
            }
          />
          <div className="space-y-1.5">
            <Label htmlFor="heroImageUrl">Hero image URL</Label>
            <Input
              id="heroImageUrl"
              value={form.heroImageUrl ?? ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, heroImageUrl: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="supportingText">Supporting text</Label>
            <Textarea
              id="supportingText"
              rows={4}
              value={form.supportingText}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  supportingText: e.target.value,
                }))
              }
            />
          </div>
        </div>
      </AdminPanel>
    </div>
  )
}
