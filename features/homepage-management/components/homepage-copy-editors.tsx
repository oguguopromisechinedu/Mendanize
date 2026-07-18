"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { HomepageAdminRecord } from "@/services/content/types"
import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { updateHomepageAction } from "../actions/actions"
import { WHY_ICON_OPTIONS } from "../constants/constants"
import { HomepageCmsNav } from "./homepage-cms-nav"

export function HomepageNewsletterView({
  record,
}: {
  record: HomepageAdminRecord
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState({ ...record.newsletter })

  function save() {
    startTransition(async () => {
      const res = await updateHomepageAction({ newsletter: form })
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
        title="Newsletter section"
        description="Copy for the homepage newsletter block."
        actions={
          <Button size="sm" disabled={pending} onClick={save}>
            Save
          </Button>
        }
      />
      <HomepageCmsNav />
      <AdminPanel title="Content">
        <div className="space-y-3">
          {(
            [
              ["headline", "Headline"],
              ["placeholder", "Email placeholder"],
              ["ctaLabel", "CTA label"],
              ["privacy", "Privacy note"],
              ["socialProof", "Social proof line"],
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
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>
        </div>
      </AdminPanel>
    </div>
  )
}

export function HomepageCtaView({ record }: { record: HomepageAdminRecord }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState({ ...record.cta })

  function save() {
    startTransition(async () => {
      const res = await updateHomepageAction({ cta: form })
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
        title="Final CTA"
        description="Closing conversion section."
        actions={
          <Button size="sm" disabled={pending} onClick={save}>
            Save
          </Button>
        }
      />
      <HomepageCmsNav />
      <AdminPanel title="Content">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Headline</Label>
            <Input
              value={form.headline}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, headline: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>
          {(
            [
              ["primaryCtaLabel", "Primary CTA label"],
              ["primaryCtaHref", "Primary CTA href"],
              ["secondaryCtaLabel", "Secondary CTA label"],
              ["secondaryCtaHref", "Secondary CTA href"],
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
    </div>
  )
}

export function HomepageAskView({ record }: { record: HomepageAdminRecord }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState({
    ...record.ask,
    suggestionsText: record.ask.suggestions.join("\n"),
  })

  function save() {
    startTransition(async () => {
      const res = await updateHomepageAction({
        ask: {
          title: form.title,
          description: form.description,
          placeholder: form.placeholder,
          suggestions: form.suggestionsText
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
        },
        hero: { askPlaceholder: form.placeholder },
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
        title="Ask Mendanize copy"
        description="Homepage Ask widget text (live AI in MES-019)."
        actions={
          <Button size="sm" disabled={pending} onClick={save}>
            Save
          </Button>
        }
      />
      <HomepageCmsNav />
      <AdminPanel title="Content">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Placeholder</Label>
            <Input
              value={form.placeholder}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, placeholder: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Suggestions (one per line)</Label>
            <Textarea
              rows={4}
              value={form.suggestionsText}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  suggestionsText: e.target.value,
                }))
              }
            />
          </div>
        </div>
      </AdminPanel>
    </div>
  )
}

export function HomepageWhyView({ record }: { record: HomepageAdminRecord }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [items, setItems] = useState(record.why)

  function save() {
    startTransition(async () => {
      const res = await updateHomepageAction({
        why: items.map((w, i) => ({
          id: w.id || `why_${i}`,
          title: w.title,
          description: w.description,
          icon: w.icon ?? null,
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
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Why Mendanize"
        description="Differentiation points on the homepage."
        actions={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setItems((prev) => [
                  ...prev,
                  {
                    id: `why_${Date.now()}`,
                    title: "",
                    description: "",
                    icon: "insights",
                  },
                ])
              }
            >
              Add
            </Button>
            <Button size="sm" disabled={pending} onClick={save}>
              Save
            </Button>
          </div>
        }
      />
      <HomepageCmsNav />
      <div className="space-y-4">
        {items.map((item, index) => (
          <AdminPanel key={item.id} title={`Point ${index + 1}`}>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input
                  value={item.title}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x, i) =>
                        i === index ? { ...x, title: e.target.value } : x
                      )
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Icon</Label>
                <Select
                  value={item.icon ?? "insights"}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x, i) =>
                        i === index ? { ...x, icon: e.target.value } : x
                      )
                    )
                  }
                >
                  {WHY_ICON_OPTIONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  rows={2}
                  value={item.description}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x, i) =>
                        i === index
                          ? { ...x, description: e.target.value }
                          : x
                      )
                    )
                  }
                />
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() =>
                  setItems((prev) => prev.filter((_, i) => i !== index))
                }
              >
                Remove
              </Button>
            </div>
          </AdminPanel>
        ))}
      </div>
    </div>
  )
}
