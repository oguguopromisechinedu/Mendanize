"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { ListResult, NewsletterCampaignRecord } from "@/services/admin/types"
import {
  AdminActionToolbar,
  AdminDataTable,
  AdminEmptyState,
  AdminPageHeader,
  ConfirmationDialog,
  StatusBadge,
} from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  createNewsletterAction,
  deleteNewsletterAction,
  sendNewsletterAction,
} from "../actions/actions"

export function NewsletterListView({
  initial,
}: {
  initial: ListResult<NewsletterCampaignRecord>
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [selected, setSelected] = useState<string[]>([])
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Newsletter"
        description="Compose campaigns and send to active subscribers (delivery is logged)."
      />
      <div className="mb-6 space-y-3 rounded-lg border border-border p-4">
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="HTML or plain body"
          rows={4}
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
        />
        <Button
          size="sm"
          disabled={pending || !subject.trim()}
          onClick={() =>
            start(async () => {
              const res = await createNewsletterAction({
                subject,
                bodyHtml: body || `<p>${subject}</p>`,
                audienceFilter: "active",
              })
              if (!res.ok) toast.error(res.message)
              else {
                toast.success(res.message)
                setSubject("")
                setBody("")
                router.refresh()
              }
            })
          }
        >
          Save draft
        </Button>
      </div>

      <AdminActionToolbar>
        <Button
          size="sm"
          variant="destructive"
          disabled={pending || !selected.length}
          onClick={() => setConfirmOpen(true)}
        >
          Delete selected
        </Button>
      </AdminActionToolbar>

      {!initial.items.length ? (
        <AdminEmptyState
          title="No campaigns"
          description="Create a draft above to get started."
        />
      ) : (
        <AdminDataTable
          headers={["", "Subject", "Status", "Recipients", "Sent", ""]}
        >
          {initial.items.map((c) => (
            <tr key={c.id} className="border-b border-border/60">
              <td className="px-3 py-2">
                <Checkbox
                  checked={selected.includes(c.id)}
                  onCheckedChange={(checked) =>
                    setSelected((prev) =>
                      checked
                        ? [...prev, c.id]
                        : prev.filter((id) => id !== c.id)
                    )
                  }
                />
              </td>
              <td className="px-3 py-2 font-medium">{c.subject}</td>
              <td className="px-3 py-2">
                <StatusBadge status={c.status} />
              </td>
              <td className="px-3 py-2">{c.recipientCount}</td>
              <td className="px-3 py-2 text-xs text-muted-foreground">
                {c.sentAt ? new Date(c.sentAt).toLocaleString() : "—"}
              </td>
              <td className="px-3 py-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending || c.status === "SENT"}
                  onClick={() =>
                    start(async () => {
                      const res = await sendNewsletterAction(c.id)
                      if (!res.ok) toast.error(res.message)
                      else {
                        toast.success(res.message)
                        router.refresh()
                      }
                    })
                  }
                >
                  Send
                </Button>
              </td>
            </tr>
          ))}
        </AdminDataTable>
      )}

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete campaigns?"
        description="Selected newsletter drafts will be removed."
        confirmLabel="Delete"
        onConfirm={() =>
          start(async () => {
            const res = await deleteNewsletterAction({ ids: selected })
            if (!res.ok) toast.error(res.message)
            else {
              toast.success(res.message)
              setSelected([])
              router.refresh()
            }
            setConfirmOpen(false)
          })
        }
      />
    </div>
  )
}
