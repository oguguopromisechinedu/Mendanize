"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type {
  HomepageAdminRecord,
  HomepageFeaturedKindValue,
} from "@/services/content/types"
import type { FeaturedPickerOptions } from "../types/types"
import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { updateHomepageAction } from "../actions/actions"
import {
  FEATURED_KIND_LABELS,
  FEATURED_KINDS,
  CATEGORY_ICON_OPTIONS,
} from "../constants/constants"
import { HomepageCmsNav } from "./homepage-cms-nav"

type FeatDraft = {
  kind: HomepageFeaturedKindValue
  entityId: string
  sortOrder: number
  selectionMode: "MANUAL" | "AUTOMATIC"
  titleOverride: string
  icon: string
  iconColor: string
}

export function HomepageFeaturedView({
  record,
  options,
}: {
  record: HomepageAdminRecord
  options: FeaturedPickerOptions
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [kind, setKind] = useState<HomepageFeaturedKindValue>("ARTICLE")
  const [items, setItems] = useState<FeatDraft[]>(() =>
    record.featured.map((f) => ({
      kind: f.kind,
      entityId: f.entityId,
      sortOrder: f.sortOrder,
      selectionMode: f.selectionMode,
      titleOverride: f.titleOverride ?? "",
      icon: f.icon ?? "",
      iconColor: f.iconColor ?? "",
    }))
  )

  const filtered = items
    .filter((i) => i.kind === kind)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  const picker =
    kind === "CATEGORY"
      ? options.categories.map((c) => ({ id: c.id, label: c.name }))
      : kind === "ARTICLE"
        ? options.articles.map((a) => ({ id: a.id, label: a.title }))
        : kind === "GUIDE"
          ? options.guides.map((g) => ({ id: g.id, label: g.title }))
          : options.tools.map((t) => ({ id: t.id, label: t.name }))

  function addEntity(entityId: string) {
    if (!entityId) return
    if (items.some((i) => i.kind === kind && i.entityId === entityId)) {
      toast.error("Already selected")
      return
    }
    const label = picker.find((p) => p.id === entityId)?.label ?? ""
    setItems((prev) => [
      ...prev,
      {
        kind,
        entityId,
        sortOrder: prev.filter((i) => i.kind === kind).length,
        selectionMode: "MANUAL",
        titleOverride: label,
        icon: "",
        iconColor: "",
      },
    ])
  }

  function save() {
    startTransition(async () => {
      const res = await updateHomepageAction({
        featured: items.map((f, i) => ({
          kind: f.kind,
          entityId: f.entityId,
          sortOrder: f.sortOrder ?? i,
          selectionMode: f.selectionMode,
          titleOverride: f.titleOverride || null,
          icon: f.icon || null,
          iconColor: f.iconColor || null,
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
    <div className="mx-auto max-w-4xl space-y-6">
      <AdminPageHeader
        title="Featured content"
        description="Manual picks from Content Service. Automatic selection is a placeholder for later."
        actions={
          <Button size="sm" disabled={pending} onClick={save}>
            Save featured
          </Button>
        }
      />
      <HomepageCmsNav />

      <div className="flex flex-wrap gap-2">
        {FEATURED_KINDS.map((k) => (
          <Button
            key={k}
            type="button"
            size="sm"
            variant={kind === k ? "secondary" : "outline"}
            onClick={() => setKind(k)}
          >
            {FEATURED_KIND_LABELS[k]}
          </Button>
        ))}
      </div>

      <AdminPanel title={`Select ${FEATURED_KIND_LABELS[kind]}`}>
        <div className="flex flex-wrap gap-2">
          <Select
            className="max-w-md flex-1"
            defaultValue=""
            onChange={(e) => {
              addEntity(e.target.value)
              e.target.value = ""
            }}
          >
            <option value="">Add from library…</option>
            {picker.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
          <p className="w-full text-xs text-muted-foreground">
            Automatic mode reserved for recommendations / analytics — keep MANUAL
            for now.
          </p>
        </div>
      </AdminPanel>

      <AdminPanel title="Current selection">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items for this kind.</p>
        ) : (
          <ul className="space-y-3">
            {filtered.map((item) => (
              <li
                key={`${item.kind}-${item.entityId}`}
                className="grid gap-2 rounded-lg border border-border px-3 py-3 sm:grid-cols-[1fr_8rem_auto] lg:grid-cols-[1fr_6rem_6rem_8rem_auto]"
              >
                <div className="space-y-1.5">
                  <Label>Title override</Label>
                  <Input
                    value={item.titleOverride}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((x) =>
                          x.kind === item.kind && x.entityId === item.entityId
                            ? { ...x, titleOverride: e.target.value }
                            : x
                        )
                      )
                    }
                  />
                  <p className="font-mono text-xs text-muted-foreground">
                    {item.entityId}
                  </p>
                </div>
                {item.kind === "CATEGORY" ? (
                  <>
                    <div className="space-y-1.5">
                      <Label>Icon</Label>
                      <Select
                        value={item.icon || "sparkles"}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((x) =>
                              x.kind === item.kind &&
                              x.entityId === item.entityId
                                ? { ...x, icon: e.target.value }
                                : x
                            )
                          )
                        }
                      >
                        {CATEGORY_ICON_OPTIONS.map((icon) => (
                          <option key={icon} value={icon}>
                            {icon}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Color</Label>
                      <Input
                        value={item.iconColor}
                        placeholder="#8B5CF6"
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((x) =>
                              x.kind === item.kind &&
                              x.entityId === item.entityId
                                ? { ...x, iconColor: e.target.value }
                                : x
                            )
                          )
                        }
                      />
                    </div>
                  </>
                ) : null}
                <div className="space-y-1.5">
                  <Label>Mode</Label>
                  <Select
                    value={item.selectionMode}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((x) =>
                          x.kind === item.kind && x.entityId === item.entityId
                            ? {
                                ...x,
                                selectionMode: e.target
                                  .value as FeatDraft["selectionMode"],
                              }
                            : x
                        )
                      )
                    }
                  >
                    <option value="MANUAL">Manual</option>
                    <option value="AUTOMATIC">Automatic (soon)</option>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setItems((prev) =>
                        prev.filter(
                          (x) =>
                            !(
                              x.kind === item.kind &&
                              x.entityId === item.entityId
                            )
                        )
                      )
                    }
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>
    </div>
  )
}
