"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { AdminPageHeader } from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import { upsertEmsAutomationAction } from "../actions"
import { EmsNav } from "./ems-nav"

const field =
  "h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"

export function EmsAutomationsView({
  rules,
  templateKeys,
  senders,
  canEdit,
}: {
  rules: Array<{
    id: string
    name: string
    eventKey: string
    templateKey: string
    enabled: boolean
    delayMinutes: number
    sender: { address: string } | null
  }>
  templateKeys: string[]
  senders: Array<{ id: string; label: string }>
  canEdit: boolean
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [name, setName] = useState("")
  const [eventKey, setEventKey] = useState("user.registered")
  const [templateKey, setTemplateKey] = useState(templateKeys[0] ?? "")
  const [senderId, setSenderId] = useState("")

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Email automations"
        description="Map platform events to published templates. Modules call emitEmailEvent(eventKey, …)."
      />
      <EmsNav />
      {canEdit ? (
        <div className="mb-6 grid gap-2 rounded-lg border border-border p-4 sm:grid-cols-2">
          <input
            className={field}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Rule name"
          />
          <input
            className={field}
            value={eventKey}
            onChange={(e) => setEventKey(e.target.value)}
            placeholder="event.key"
          />
          <select
            className={field}
            value={templateKey}
            onChange={(e) => setTemplateKey(e.target.value)}
          >
            <option value="">Template key</option>
            {templateKeys.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <select
            className={field}
            value={senderId}
            onChange={(e) => setSenderId(e.target.value)}
          >
            <option value="">Sender override (optional)</option>
            {senders.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            className="sm:col-span-2"
            disabled={pending || !name.trim() || !eventKey.trim() || !templateKey}
            onClick={() =>
              start(async () => {
                const res = await upsertEmsAutomationAction({
                  name,
                  eventKey,
                  templateKey,
                  senderId: senderId || null,
                  enabled: true,
                })
                if (!res.ok) toast.error(res.message)
                else {
                  toast.success(res.message)
                  setName("")
                  router.refresh()
                }
              })
            }
          >
            Add rule
          </Button>
        </div>
      ) : (
        <p className="mb-4 text-sm text-muted-foreground">Read-only for Editors.</p>
      )}
      <ul className="divide-y divide-border rounded-lg border border-border">
        {rules.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
            <div>
              <div className="font-medium">{r.name}</div>
              <div className="text-xs text-muted-foreground">
                {r.eventKey} → {r.templateKey}
                {r.sender ? ` · ${r.sender.address}` : ""}
                {r.delayMinutes ? ` · delay ${r.delayMinutes}m` : ""}
                {!r.enabled ? " · disabled" : ""}
              </div>
            </div>
            {canEdit ? (
              <Button
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const res = await upsertEmsAutomationAction({
                      id: r.id,
                      name: r.name,
                      eventKey: r.eventKey,
                      templateKey: r.templateKey,
                      enabled: !r.enabled,
                      delayMinutes: r.delayMinutes,
                    })
                    if (!res.ok) toast.error(res.message)
                    else {
                      toast.success(res.message)
                      router.refresh()
                    }
                  })
                }
              >
                {r.enabled ? "Disable" : "Enable"}
              </Button>
            ) : null}
          </li>
        ))}
        {rules.length === 0 ? (
          <li className="px-3 py-6 text-center text-sm text-muted-foreground">
            No automation rules yet.
          </li>
        ) : null}
      </ul>
    </div>
  )
}
