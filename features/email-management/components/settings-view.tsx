"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { AdminPageHeader } from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import type { EmailSettingRecord } from "@/services/settings/platform-types"
import { updateEmsSettingsAction } from "../actions"
import { EmsNav } from "./ems-nav"

const field =
  "h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"

export function EmsSettingsView({
  settings,
  canEdit,
}: {
  settings: EmailSettingRecord
  canEdit: boolean
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [form, setForm] = useState({
    senderName: settings.senderName,
    senderEmail: settings.senderEmail,
    smtpHost: settings.smtpHost ?? "",
    smtpPort: settings.smtpPort,
    smtpUser: settings.smtpUser ?? "",
    smtpPassword: settings.smtpPassword ?? "",
    smtpSecure: settings.smtpSecure,
    defaultReplyTo: settings.defaultReplyTo ?? "",
    brandLogoUrl: settings.brandLogoUrl ?? "",
    footerHtml: settings.footerHtml ?? "",
    companyAddress: settings.companyAddress ?? "",
    socialLinksJson: settings.socialLinksJson ?? "",
    unsubscribeFooterHtml: settings.unsubscribeFooterHtml ?? "",
    trackingOpens: settings.trackingOpens,
    trackingClicks: settings.trackingClicks,
    templatesNote: settings.templatesNote ?? "",
  })

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        title="Email settings"
        description="SMTP / provider defaults, brand chrome, and tracking flags. Super Admin only."
      />
      <EmsNav />
      {!canEdit ? (
        <p className="text-sm text-muted-foreground">
          View only. Ask a Super Administrator to change transport or branding.
        </p>
      ) : null}
      <fieldset disabled={!canEdit || pending} className="space-y-4">
        <label className="block space-y-1 text-sm">
          <span className="text-muted-foreground">Default sender name</span>
          <input
            className={field}
            value={form.senderName}
            onChange={(e) => set("senderName", e.target.value)}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-muted-foreground">Default sender email</span>
          <input
            className={field}
            value={form.senderEmail}
            onChange={(e) => set("senderEmail", e.target.value)}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-muted-foreground">Default reply-to</span>
          <input
            className={field}
            value={form.defaultReplyTo}
            onChange={(e) => set("defaultReplyTo", e.target.value)}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span className="text-muted-foreground">SMTP host</span>
            <input
              className={field}
              value={form.smtpHost}
              onChange={(e) => set("smtpHost", e.target.value)}
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-muted-foreground">SMTP port</span>
            <input
              className={field}
              type="number"
              value={form.smtpPort}
              onChange={(e) => set("smtpPort", Number(e.target.value) || 587)}
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-muted-foreground">SMTP user</span>
            <input
              className={field}
              value={form.smtpUser}
              onChange={(e) => set("smtpUser", e.target.value)}
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-muted-foreground">SMTP password</span>
            <input
              className={field}
              type="password"
              value={form.smtpPassword}
              onChange={(e) => set("smtpPassword", e.target.value)}
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.smtpSecure}
            onChange={(e) => set("smtpSecure", e.target.checked)}
          />
          SMTP secure
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-muted-foreground">Brand logo URL</span>
          <input
            className={field}
            value={form.brandLogoUrl}
            onChange={(e) => set("brandLogoUrl", e.target.value)}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-muted-foreground">Company address</span>
          <input
            className={field}
            value={form.companyAddress}
            onChange={(e) => set("companyAddress", e.target.value)}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-muted-foreground">Footer HTML</span>
          <textarea
            className="min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
            value={form.footerHtml}
            onChange={(e) => set("footerHtml", e.target.value)}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-muted-foreground">Unsubscribe footer HTML</span>
          <textarea
            className="min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
            value={form.unsubscribeFooterHtml}
            onChange={(e) => set("unsubscribeFooterHtml", e.target.value)}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-muted-foreground">Social links JSON</span>
          <textarea
            className="min-h-[60px] w-full rounded-lg border border-input bg-transparent px-3 py-2 font-mono text-xs"
            value={form.socialLinksJson}
            onChange={(e) => set("socialLinksJson", e.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.trackingOpens}
              onChange={(e) => set("trackingOpens", e.target.checked)}
            />
            Track opens (requires provider/webhook)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.trackingClicks}
              onChange={(e) => set("trackingClicks", e.target.checked)}
            />
            Track clicks
          </label>
        </div>
        {canEdit ? (
          <Button
            onClick={() =>
              start(async () => {
                const res = await updateEmsSettingsAction({
                  ...form,
                  smtpHost: form.smtpHost || null,
                  smtpUser: form.smtpUser || null,
                  smtpPassword: form.smtpPassword || null,
                  defaultReplyTo: form.defaultReplyTo || null,
                  brandLogoUrl: form.brandLogoUrl || null,
                  footerHtml: form.footerHtml || null,
                  companyAddress: form.companyAddress || null,
                  socialLinksJson: form.socialLinksJson || null,
                  unsubscribeFooterHtml: form.unsubscribeFooterHtml || null,
                  templatesNote: form.templatesNote || null,
                })
                if (!res.ok) toast.error(res.message)
                else {
                  toast.success(res.message)
                  router.refresh()
                }
              })
            }
          >
            Save settings
          </Button>
        ) : null}
      </fieldset>
    </div>
  )
}
