"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { HomepageAdminRecord } from "@/services/content/types"
import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select } from "@/components/ui/select"
import { updateHomepageAction } from "../actions/actions"
import {
  HOMEPAGE_SECTION_KEYS,
  HOMEPAGE_SECTION_LABELS,
} from "../constants/constants"
import { HomepageCmsNav } from "./homepage-cms-nav"

type SectionDraft = {
  sectionKey: string
  enabled: boolean
  sortOrder: number
  visibilityRules: string
  backgroundStyle: string
  animationEnabled: boolean
  spacing: string
  title: string
  displayLimit: string
}

export function HomepageSectionsView({
  record,
}: {
  record: HomepageAdminRecord
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [sections, setSections] = useState<SectionDraft[]>(() =>
    [...record.sections]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((s) => ({
        sectionKey: s.sectionKey,
        enabled: s.enabled,
        sortOrder: s.sortOrder,
        visibilityRules: s.visibilityRules ?? "",
        backgroundStyle: s.backgroundStyle ?? "",
        animationEnabled: s.animationEnabled,
        spacing: s.spacing,
        title: s.title ?? "",
        displayLimit: s.displayLimit != null ? String(s.displayLimit) : "",
      }))
  )

  const orderedKeys = useMemo(
    () => sections.map((s) => s.sectionKey),
    [sections]
  )

  function move(index: number, dir: -1 | 1) {
    const next = index + dir
    if (next < 0 || next >= sections.length) return
    setSections((prev) => {
      const copy = [...prev]
      const tmp = copy[index]
      copy[index] = copy[next]
      copy[next] = tmp
      return copy.map((s, i) => ({ ...s, sortOrder: i + 1 }))
    })
  }

  function save() {
    startTransition(async () => {
      const res = await updateHomepageAction({
        sections: sections.map((s, i) => ({
          sectionKey: s.sectionKey,
          enabled: s.enabled,
          sortOrder: i + 1,
          visibilityRules: s.visibilityRules || null,
          backgroundStyle: s.backgroundStyle || null,
          animationEnabled: s.animationEnabled,
          spacing: s.spacing || "default",
          title: s.title || null,
          displayLimit: s.displayLimit ? Number(s.displayLimit) : null,
        })),
      })
      if (!res.ok) toast.error(res.message)
      else {
        toast.success(res.message)
        router.refresh()
      }
    })
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Section management"
        description="Enable, reorder (Move up/down), and style homepage sections."
        actions={
          <Button size="sm" disabled={pending} onClick={save}>
            Save sections
          </Button>
        }
      />
      <HomepageCmsNav />

      <div className="space-y-3">
        {sections.map((s, index) => (
          <AdminPanel
            key={s.sectionKey}
            title={
              HOMEPAGE_SECTION_LABELS[
                s.sectionKey as keyof typeof HOMEPAGE_SECTION_LABELS
              ] ?? s.sectionKey
            }
            description={`Order ${orderedKeys.indexOf(s.sectionKey) + 1}`}
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center justify-between gap-2">
                <Label>Enabled</Label>
                <Switch
                  checked={s.enabled}
                  onCheckedChange={(v) =>
                    setSections((prev) =>
                      prev.map((x, i) =>
                        i === index ? { ...x, enabled: Boolean(v) } : x
                      )
                    )
                  }
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <Label>Animation</Label>
                <Switch
                  checked={s.animationEnabled}
                  onCheckedChange={(v) =>
                    setSections((prev) =>
                      prev.map((x, i) =>
                        i === index
                          ? { ...x, animationEnabled: Boolean(v) }
                          : x
                      )
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Spacing</Label>
                <Select
                  value={s.spacing}
                  onChange={(e) =>
                    setSections((prev) =>
                      prev.map((x, i) =>
                        i === index ? { ...x, spacing: e.target.value } : x
                      )
                    )
                  }
                >
                  <option value="default">Default</option>
                  <option value="compact">Compact</option>
                  <option value="spacious">Spacious</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Background style</Label>
                <Input
                  value={s.backgroundStyle}
                  onChange={(e) =>
                    setSections((prev) =>
                      prev.map((x, i) =>
                        i === index
                          ? { ...x, backgroundStyle: e.target.value }
                          : x
                      )
                    )
                  }
                  placeholder="e.g. muted, surface"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Visibility rules</Label>
                <Input
                  value={s.visibilityRules}
                  onChange={(e) =>
                    setSections((prev) =>
                      prev.map((x, i) =>
                        i === index
                          ? { ...x, visibilityRules: e.target.value }
                          : x
                      )
                    )
                  }
                  placeholder="all | signed-in (future)"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Section title override</Label>
                <Input
                  value={s.title}
                  onChange={(e) =>
                    setSections((prev) =>
                      prev.map((x, i) =>
                        i === index ? { ...x, title: e.target.value } : x
                      )
                    )
                  }
                />
              </div>
              {HOMEPAGE_SECTION_KEYS.includes(
                s.sectionKey as (typeof HOMEPAGE_SECTION_KEYS)[number]
              ) &&
              ["categories", "paths", "articles", "tools", "newsletter"].includes(
                s.sectionKey
              ) ? (
                <div className="space-y-1.5">
                  <Label>Display limit</Label>
                  <Input
                    type="number"
                    min={1}
                    max={24}
                    value={s.displayLimit}
                    onChange={(e) =>
                      setSections((prev) =>
                        prev.map((x, i) =>
                          i === index
                            ? { ...x, displayLimit: e.target.value }
                            : x
                        )
                      )
                    }
                  />
                </div>
              ) : null}
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                Move up
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={index === sections.length - 1}
                onClick={() => move(index, 1)}
              >
                Move down
              </Button>
            </div>
          </AdminPanel>
        ))}
      </div>
    </div>
  )
}
