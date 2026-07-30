"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"

import { AdminPageHeader } from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import { interpolate } from "@/services/ems/interpolate"
import {
  sendTestEmsTemplateAction,
  upsertEmsTemplateAction,
} from "../actions"
import { EmsNav } from "./ems-nav"

type Option = { id: string; label: string }

type VersionRow = {
  id: string
  version: number
  subject: string
  createdAt: Date | string
}

const fieldClass =
  "block h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"

export function EmsTemplateEditor({
  template,
  categories,
  senders,
  versions = [],
  samplePayload = {},
  canPublish,
  canTest,
}: {
  template: {
    id?: string
    key?: string
    name: string
    subject: string
    bodyHtml: string
    bodyText?: string | null
    description?: string | null
    categoryId?: string | null
    senderId?: string | null
    replyTo?: string | null
    status: "DRAFT" | "PUBLISHED"
    enabled: boolean
  } | null
  categories: Option[]
  senders: Option[]
  versions?: VersionRow[]
  samplePayload?: Record<string, unknown>
  canPublish: boolean
  canTest: boolean
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [name, setName] = useState(template?.name ?? "")
  const [key, setKey] = useState(template?.key ?? "")
  const [subject, setSubject] = useState(template?.subject ?? "")
  const [bodyHtml, setBodyHtml] = useState(
    template?.bodyHtml ?? "<p>Hello {{user_name}}</p>",
  )
  const [bodyText, setBodyText] = useState(template?.bodyText ?? "")
  const [description, setDescription] = useState(template?.description ?? "")
  const [categoryId, setCategoryId] = useState(template?.categoryId ?? "")
  const [senderId, setSenderId] = useState(template?.senderId ?? "")
  const [replyTo, setReplyTo] = useState(template?.replyTo ?? "")
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    template?.status ?? "DRAFT",
  )
  const [enabled, setEnabled] = useState(template?.enabled ?? true)
  const [testEmail, setTestEmail] = useState("")
  const [showPreview, setShowPreview] = useState(false)

  const previewSubject = useMemo(
    () => interpolate(subject, samplePayload, { html: false }),
    [subject, samplePayload],
  )
  const previewHtml = useMemo(
    () => interpolate(bodyHtml, samplePayload, { html: true }),
    [bodyHtml, samplePayload],
  )

  const save = (nextStatus?: "DRAFT" | "PUBLISHED") => {
    start(async () => {
      const res = await upsertEmsTemplateAction({
        id: template?.id,
        key: key || undefined,
        name,
        subject,
        bodyHtml,
        bodyText: bodyText || null,
        description: description || null,
        categoryId: categoryId || null,
        senderId: senderId || null,
        replyTo: replyTo || null,
        status: nextStatus ?? status,
        enabled,
      })
      if (!res.ok) toast.error(res.message)
      else {
        toast.success(res.message)
        if (!template?.id && res.data?.id) {
          router.replace(
            `/dashboard/communication/email/templates/${res.data.id}`,
          )
        } else router.refresh()
      }
    })
  }

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader
        title={template?.id ? "Edit template" : "New template"}
        description="Variables use {{key}} syntax. Missing vars fail the queue item."
      />
      <EmsNav />
      <div className="space-y-4">
        <label className="block space-y-1.5 text-sm">
          <span className="text-muted-foreground">Name</span>
          <input className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block space-y-1.5 text-sm">
          <span className="text-muted-foreground">Key</span>
          <input
            className={`${fieldClass} font-mono`}
            value={key}
            disabled={Boolean(template?.id)}
            onChange={(e) => setKey(e.target.value)}
            placeholder="auto from name if empty"
          />
        </label>
        <label className="block space-y-1.5 text-sm">
          <span className="text-muted-foreground">Subject</span>
          <input className={fieldClass} value={subject} onChange={(e) => setSubject(e.target.value)} />
        </label>
        <label className="block space-y-1.5 text-sm">
          <span className="text-muted-foreground">Description (staff)</span>
          <input
            className={fieldClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5 text-sm">
            <span className="text-muted-foreground">Category</span>
            <select
              className={fieldClass}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="text-muted-foreground">Sender</span>
            <select
              className={fieldClass}
              value={senderId}
              onChange={(e) => setSenderId(e.target.value)}
            >
              <option value="">Default from settings</option>
              {senders.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block space-y-1.5 text-sm">
          <span className="text-muted-foreground">Reply-To override</span>
          <input className={fieldClass} value={replyTo} onChange={(e) => setReplyTo(e.target.value)} />
        </label>
        <label className="block space-y-1.5 text-sm">
          <span className="text-muted-foreground">Body HTML</span>
          <textarea
            className="min-h-[200px] w-full rounded-lg border border-input bg-transparent px-3 py-2 font-mono text-xs"
            value={bodyHtml}
            onChange={(e) => setBodyHtml(e.target.value)}
          />
        </label>
        <label className="block space-y-1.5 text-sm">
          <span className="text-muted-foreground">Body text (optional)</span>
          <textarea
            className="min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
          />
        </label>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            Enabled
          </label>
          {canPublish ? (
            <label className="flex items-center gap-2 text-sm">
              Status
              <select
                className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "DRAFT" | "PUBLISHED")
                }
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </label>
          ) : (
            <span className="text-sm text-muted-foreground">Editors: draft only</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={pending || !name.trim() || !subject.trim()}
            onClick={() => save("DRAFT")}
          >
            Save draft
          </Button>
          {canPublish ? (
            <Button
              variant="secondary"
              disabled={pending || !name.trim()}
              onClick={() => save("PUBLISHED")}
            >
              Save & publish
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            disabled={!subject.trim() || !bodyHtml.trim()}
            onClick={() => setShowPreview((v) => !v)}
          >
            {showPreview ? "Hide preview" : "Preview"}
          </Button>
        </div>
        {showPreview ? (
          <div className="rounded-lg border border-border p-4">
            <div className="mb-2 text-xs text-muted-foreground">
              Preview with sample variables
            </div>
            <div className="mb-3 text-sm font-medium">{previewSubject}</div>
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        ) : null}
        {versions.length > 0 ? (
          <div className="rounded-lg border border-border p-4">
            <div className="mb-2 text-sm font-medium">Version history</div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {versions.map((v) => (
                <li key={v.id} className="flex flex-wrap gap-2">
                  <span className="font-mono text-xs">v{v.version}</span>
                  <span className="truncate">{v.subject}</span>
                  <span className="text-xs">
                    {typeof v.createdAt === "string"
                      ? v.createdAt
                      : v.createdAt.toISOString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {canTest && template?.id ? (
          <div className="mt-6 flex flex-wrap items-end gap-2 rounded-lg border border-border p-4">
            <label className="block min-w-[220px] flex-1 space-y-1.5 text-sm">
              <span className="text-muted-foreground">Send test to</span>
              <input
                className={fieldClass}
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <Button
              size="sm"
              disabled={pending || !testEmail.trim()}
              onClick={() =>
                start(async () => {
                  const res = await sendTestEmsTemplateAction({
                    templateId: template.id,
                    toEmail: testEmail,
                  })
                  if (!res.ok) toast.error(res.message)
                  else toast.success(res.message)
                })
              }
            >
              Send test
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
