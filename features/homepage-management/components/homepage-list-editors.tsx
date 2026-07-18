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
import { STAT_ICON_OPTIONS } from "../constants/constants"
import { HomepageCmsNav } from "./homepage-cms-nav"

export function HomepageStatisticsView({
  record,
}: {
  record: HomepageAdminRecord
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [items, setItems] = useState(record.statistics)

  function save() {
    startTransition(async () => {
      const res = await updateHomepageAction({
        statistics: items.map((s, i) => ({
          key: s.key,
          label: s.label,
          value: s.value,
          sortOrder: i,
          icon: s.icon,
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
        title="Statistics"
        description="Manual values for now — auto calculation waits on Analytics (MES-023)."
        actions={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setItems((prev) => [
                  ...prev,
                  {
                    id: `stat_${Date.now()}`,
                    key: `stat_${prev.length + 1}`,
                    label: "New stat",
                    value: "0",
                    sortOrder: prev.length,
                    icon: "sparkles",
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
      <AdminPanel title="Values">
        <ul className="space-y-4">
          {items.map((item, index) => (
            <li key={item.id} className="grid gap-2 sm:grid-cols-4">
              <div className="space-y-1.5">
                <Label>Key</Label>
                <Input
                  value={item.key}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x, i) =>
                        i === index ? { ...x, key: e.target.value } : x
                      )
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Label</Label>
                <Input
                  value={item.label}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x, i) =>
                        i === index ? { ...x, label: e.target.value } : x
                      )
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Value</Label>
                <Input
                  value={item.value}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x, i) =>
                        i === index ? { ...x, value: e.target.value } : x
                      )
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Icon</Label>
                <Select
                  value={item.icon ?? "sparkles"}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x, i) =>
                        i === index ? { ...x, icon: e.target.value } : x
                      )
                    )
                  }
                >
                  {STAT_ICON_OPTIONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </Select>
              </div>
            </li>
          ))}
        </ul>
      </AdminPanel>
    </div>
  )
}

export function HomepageTestimonialsView({
  record,
}: {
  record: HomepageAdminRecord
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [items, setItems] = useState(record.testimonials)

  function save() {
    startTransition(async () => {
      const res = await updateHomepageAction({
        testimonials: items.map((t, i) => ({
          quote: t.quote,
          name: t.name,
          role: t.role,
          sortOrder: i,
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
        title="Testimonials"
        description="Quotes shown on the public homepage."
        actions={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setItems((prev) => [
                  ...prev,
                  {
                    id: `tm_${Date.now()}`,
                    quote: "",
                    name: "",
                    role: "",
                    sortOrder: prev.length,
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
          <AdminPanel key={item.id} title={`Testimonial ${index + 1}`}>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Quote</Label>
                <Textarea
                  rows={3}
                  value={item.quote}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x, i) =>
                        i === index ? { ...x, quote: e.target.value } : x
                      )
                    )
                  }
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input
                    value={item.name}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((x, i) =>
                          i === index ? { ...x, name: e.target.value } : x
                        )
                      )
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Input
                    value={item.role}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((x, i) =>
                          i === index ? { ...x, role: e.target.value } : x
                        )
                      )
                    }
                  />
                </div>
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

export function HomepageFaqView({ record }: { record: HomepageAdminRecord }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [items, setItems] = useState(record.faqs)

  function save() {
    startTransition(async () => {
      const res = await updateHomepageAction({
        faqs: items.map((f, i) => ({
          question: f.question,
          answer: f.answer,
          sortOrder: i,
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
        title="FAQ"
        description="Accessible accordion content on the homepage."
        actions={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setItems((prev) => [
                  ...prev,
                  {
                    id: `faq_${Date.now()}`,
                    question: "",
                    answer: "",
                    sortOrder: prev.length,
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
          <AdminPanel key={item.id} title={`FAQ ${index + 1}`}>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Question</Label>
                <Input
                  value={item.question}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x, i) =>
                        i === index ? { ...x, question: e.target.value } : x
                      )
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Answer</Label>
                <Textarea
                  rows={3}
                  value={item.answer}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x, i) =>
                        i === index ? { ...x, answer: e.target.value } : x
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
