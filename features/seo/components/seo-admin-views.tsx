"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type {
  MetadataTemplateRecord,
  RedirectRecord,
  RobotsRuleRecord,
  SeoEntityTypeValue,
  SitemapConfigRecord,
  StructuredDataRecord,
} from "@/services/seo/types"
import { AdminPageHeader, AdminPanel } from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  deleteRedirectAction,
  deleteTemplateAction,
  regenerateSitemapAction,
  saveRedirectAction,
  saveRobotsAction,
  saveTemplateAction,
  toggleStructuredDataAction,
  updateSitemapAction,
} from "../actions/actions"
import {
  REDIRECT_STATUSES,
  REDIRECT_TYPES,
  SEO_ENTITY_LABELS,
  SEO_ENTITY_TYPES,
} from "../constants/constants"
import { SeoCmsNav } from "./seo-cms-nav"

export function SeoTemplatesView({
  templates,
}: {
  templates: MetadataTemplateRecord[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [entityType, setEntityType] = useState<SeoEntityTypeValue>("ARTICLE")
  const [name, setName] = useState("Custom")
  const [titleTemplate, setTitleTemplate] = useState("{title} | {brand}")
  const [descriptionTemplate, setDescriptionTemplate] = useState(
    "{title} on {brand}."
  )

  function create() {
    startTransition(async () => {
      const res = await saveTemplateAction({
        entityType,
        name,
        titleTemplate,
        descriptionTemplate,
        isDefault: false,
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
        title="Metadata templates"
        description="Placeholders: {title}, {category}, {topic}, {brand}, {year}."
      />
      <SeoCmsNav />
      <AdminPanel title="Add template">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Entity type</Label>
            <Select
              value={entityType}
              onChange={(e) =>
                setEntityType(e.target.value as SeoEntityTypeValue)
              }
            >
              {SEO_ENTITY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {SEO_ENTITY_LABELS[t]}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Title template</Label>
            <Input
              value={titleTemplate}
              onChange={(e) => setTitleTemplate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Description template</Label>
            <Textarea
              rows={2}
              value={descriptionTemplate}
              onChange={(e) => setDescriptionTemplate(e.target.value)}
            />
          </div>
        </div>
        <Button className="mt-3" size="sm" disabled={pending} onClick={create}>
          Create
        </Button>
      </AdminPanel>
      <AdminPanel title="Templates">
        <ul className="divide-y divide-border">
          {templates.map((t) => (
            <li
              key={t.id}
              className="flex flex-wrap items-start justify-between gap-3 py-3 text-sm"
            >
              <div>
                <p className="font-medium">
                  {SEO_ENTITY_LABELS[t.entityType]} · {t.name}
                  {t.isDefault ? " (default)" : ""}
                </p>
                <p className="text-muted-foreground">{t.titleTemplate}</p>
                <p className="text-xs text-muted-foreground">
                  {t.descriptionTemplate}
                </p>
              </div>
              {!t.isDefault ? (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await deleteTemplateAction(t.id)
                      if (!res.ok) toast.error(res.message)
                      else {
                        toast.success(res.message)
                        router.refresh()
                      }
                    })
                  }
                >
                  Delete
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      </AdminPanel>
    </div>
  )
}

export function SeoRedirectsView({
  redirects,
}: {
  redirects: RedirectRecord[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [sourcePath, setSourcePath] = useState("")
  const [destination, setDestination] = useState("")
  const [type, setType] = useState<(typeof REDIRECT_TYPES)[number]>(
    "PERMANENT_301"
  )

  function create() {
    startTransition(async () => {
      const res = await saveRedirectAction({
        sourcePath,
        destination,
        type,
        status: "ACTIVE",
      })
      if (!res.ok) toast.error(res.message)
      else {
        toast.success(res.message)
        setSourcePath("")
        setDestination("")
        router.refresh()
      }
    })
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <AdminPageHeader
        title="Redirect management"
        description="Source → destination. Runtime redirect middleware is deferred."
      />
      <SeoCmsNav />
      <AdminPanel title="Add redirect">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Source path</Label>
            <Input
              value={sourcePath}
              onChange={(e) => setSourcePath(e.target.value)}
              placeholder="/old-path"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Destination</Label>
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="/new-path"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select
              value={type}
              onChange={(e) =>
                setType(e.target.value as (typeof REDIRECT_TYPES)[number])
              }
            >
              {REDIRECT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <Button className="mt-3" size="sm" disabled={pending} onClick={create}>
          Add
        </Button>
      </AdminPanel>
      <AdminPanel title="Redirects">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-2 py-2">Source</th>
                <th className="px-2 py-2">Destination</th>
                <th className="px-2 py-2">Type</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {redirects.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-2 py-2 font-mono text-xs">{r.sourcePath}</td>
                  <td className="px-2 py-2 font-mono text-xs">
                    {r.destination}
                  </td>
                  <td className="px-2 py-2">{r.type}</td>
                  <td className="px-2 py-2">
                    <Select
                      value={r.status}
                      onChange={(e) =>
                        startTransition(async () => {
                          const res = await saveRedirectAction(
                            {
                              sourcePath: r.sourcePath,
                              destination: r.destination,
                              type: r.type,
                              status: e.target
                                .value as (typeof REDIRECT_STATUSES)[number],
                              notes: r.notes,
                            },
                            r.id
                          )
                          if (!res.ok) toast.error(res.message)
                          else router.refresh()
                        })
                      }
                    >
                      {REDIRECT_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-2 py-2 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          const res = await deleteRedirectAction(r.id)
                          if (!res.ok) toast.error(res.message)
                          else {
                            toast.success(res.message)
                            router.refresh()
                          }
                        })
                      }
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>
  )
}

export function SeoRobotsView({
  rules,
  preview,
}: {
  rules: RobotsRuleRecord[]
  preview: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [items, setItems] = useState(rules)

  function save() {
    startTransition(async () => {
      const res = await saveRobotsAction(
        items.map((r, i) => ({
          userAgent: r.userAgent,
          allowPath: r.allowPath,
          disallowPath: r.disallowPath,
          sortOrder: i,
          enabled: r.enabled,
        }))
      )
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
        title="Robots.txt"
        description="Manage Allow/Disallow rules. Serving public robots.txt is deferred."
        actions={
          <Button size="sm" disabled={pending} onClick={save}>
            Save rules
          </Button>
        }
      />
      <SeoCmsNav />
      <AdminPanel title="Rules">
        <ul className="space-y-3">
          {items.map((r, index) => (
            <li
              key={r.id}
              className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-4"
            >
              <Input
                value={r.userAgent}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((x, i) =>
                      i === index ? { ...x, userAgent: e.target.value } : x
                    )
                  )
                }
                placeholder="User-agent"
              />
              <Input
                value={r.allowPath ?? ""}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((x, i) =>
                      i === index
                        ? { ...x, allowPath: e.target.value || null }
                        : x
                    )
                  )
                }
                placeholder="Allow"
              />
              <Input
                value={r.disallowPath ?? ""}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((x, i) =>
                      i === index
                        ? { ...x, disallowPath: e.target.value || null }
                        : x
                    )
                  )
                }
                placeholder="Disallow"
              />
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={r.enabled}
                    onCheckedChange={(v) =>
                      setItems((prev) =>
                        prev.map((x, i) =>
                          i === index ? { ...x, enabled: Boolean(v) } : x
                        )
                      )
                    }
                  />
                  Enabled
                </label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setItems((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
        <Button
          className="mt-3"
          size="sm"
          variant="outline"
          onClick={() =>
            setItems((prev) => [
              ...prev,
              {
                id: `new_${Date.now()}`,
                userAgent: "*",
                allowPath: null,
                disallowPath: "/",
                sortOrder: prev.length,
                enabled: true,
              },
            ])
          }
        >
          Add rule
        </Button>
      </AdminPanel>
      <AdminPanel title="Preview">
        <pre className="overflow-x-auto rounded-lg bg-muted/40 p-3 text-xs">
          {preview}
        </pre>
      </AdminPanel>
    </div>
  )
}

export function SeoSitemapView({
  configs,
}: {
  configs: SitemapConfigRecord[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <AdminPageHeader
        title="Sitemap management"
        description="Include/exclude content types. Real XML generation is deferred."
        actions={
          <Button
            size="sm"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const res = await regenerateSitemapAction()
                if (!res.ok) toast.error(res.message)
                else {
                  toast.success(res.message)
                  router.refresh()
                }
              })
            }
          >
            Regenerate (placeholder)
          </Button>
        }
      />
      <SeoCmsNav />
      <AdminPanel title="Content types">
        <ul className="divide-y divide-border">
          {configs.map((c) => (
            <li
              key={c.id}
              className="grid gap-3 py-3 sm:grid-cols-[1fr_8rem_6rem_auto] sm:items-center"
            >
              <div>
                <p className="text-sm font-medium">
                  {SEO_ENTITY_LABELS[c.entityType]}
                </p>
                <p className="text-xs text-muted-foreground">
                  Last regenerated:{" "}
                  {c.lastRegeneratedAt
                    ? new Date(c.lastRegeneratedAt).toLocaleString()
                    : "—"}
                </p>
              </div>
              <Input
                value={c.changefreq}
                onChange={(e) =>
                  startTransition(async () => {
                    await updateSitemapAction({
                      entityType: c.entityType,
                      changefreq: e.target.value,
                    })
                    router.refresh()
                  })
                }
                aria-label="Changefreq"
              />
              <Input
                type="number"
                step="0.1"
                min={0}
                max={1}
                value={c.priority}
                onChange={(e) =>
                  startTransition(async () => {
                    await updateSitemapAction({
                      entityType: c.entityType,
                      priority: Number(e.target.value),
                    })
                    router.refresh()
                  })
                }
                aria-label="Priority"
              />
              <div className="flex items-center gap-2">
                <Switch
                  checked={c.included}
                  onCheckedChange={(v) =>
                    startTransition(async () => {
                      await updateSitemapAction({
                        entityType: c.entityType,
                        included: Boolean(v),
                      })
                      router.refresh()
                    })
                  }
                />
                <span className="text-sm text-muted-foreground">Included</span>
              </div>
            </li>
          ))}
        </ul>
      </AdminPanel>
    </div>
  )
}

export function SeoStructuredDataView({
  items,
}: {
  items: StructuredDataRecord[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [selected, setSelected] = useState(items[0]?.id ?? "")

  const current = items.find((i) => i.id === selected) ?? items[0]

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <AdminPageHeader
        title="Structured data"
        description="Schema previews for Organization, Website, Article, Guide, AI Tool, Breadcrumb."
      />
      <SeoCmsNav />
      <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
        <AdminPanel title="Schemas">
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                    current?.id === item.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                  onClick={() => setSelected(item.id)}
                >
                  {item.label}
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {item.enabled ? "Enabled" : "Disabled"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </AdminPanel>
        {current ? (
          <AdminPanel
            title={current.label}
            description={current.schemaType}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {current.entityType
                  ? SEO_ENTITY_LABELS[current.entityType]
                  : "Global"}
              </span>
              <div className="flex items-center gap-2">
                <Label>Enabled</Label>
                <Switch
                  checked={current.enabled}
                  disabled={pending}
                  onCheckedChange={(v) =>
                    startTransition(async () => {
                      const res = await toggleStructuredDataAction(
                        current.id,
                        Boolean(v)
                      )
                      if (!res.ok) toast.error(res.message)
                      else router.refresh()
                    })
                  }
                />
              </div>
            </div>
            <pre className="overflow-x-auto rounded-lg bg-muted/40 p-3 text-xs">
              {JSON.stringify(current.jsonPreview, null, 2)}
            </pre>
          </AdminPanel>
        ) : null}
      </div>
    </div>
  )
}
