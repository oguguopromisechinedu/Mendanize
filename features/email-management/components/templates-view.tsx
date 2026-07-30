"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

import {
  AdminEmptyState,
  AdminPageHeader,
  StatusBadge,
} from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import {
  deleteEmsTemplateAction,
  duplicateEmsTemplateAction,
} from "../actions"
import { EmsNav } from "./ems-nav"

type TemplateRow = {
  id: string
  key: string
  name: string
  subject: string
  status: string
  enabled: boolean
  category: { name: string } | null
  sender: { address: string } | null
  updatedAt: Date | string
}

export function EmsTemplatesView({
  templates,
  canDelete,
}: {
  templates: TemplateRow[]
  canDelete: boolean
}) {
  const router = useRouter()
  const [pending, start] = useTransition()

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Email Management"
        description="Templates, senders, campaigns, and delivery — MES-042 transport."
      />
      <EmsNav />
      <div className="mb-4 flex justify-end">
        <Button asChild size="sm">
          <Link href="/dashboard/communication/email/templates/new">
            New template
          </Link>
        </Button>
      </div>
      {templates.length === 0 ? (
        <AdminEmptyState
          title="No templates yet"
          description="Create a template or wait for notification seeds to appear here."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Key</th>
                <th className="px-3 py-2 font-medium">Category</th>
                <th className="px-3 py-2 font-medium">Sender</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id} className="border-b border-border/60">
                  <td className="px-3 py-2">
                    <Link
                      href={`/dashboard/communication/email/templates/${t.id}`}
                      className="font-medium hover:underline"
                    >
                      {t.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">{t.subject}</div>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{t.key}</td>
                  <td className="px-3 py-2">{t.category?.name ?? "—"}</td>
                  <td className="px-3 py-2 text-xs">
                    {t.sender?.address ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge
                      status={
                        !t.enabled
                          ? "disabled"
                          : t.status === "PUBLISHED"
                            ? "published"
                            : "draft"
                      }
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/dashboard/communication/email/templates/${t.id}`}
                        >
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={pending}
                        onClick={() =>
                          start(async () => {
                            const res = await duplicateEmsTemplateAction(t.id)
                            if (!res.ok) toast.error(res.message)
                            else {
                              toast.success(res.message)
                              if (res.data?.id) {
                                router.push(
                                  `/dashboard/communication/email/templates/${res.data.id}`,
                                )
                              } else router.refresh()
                            }
                          })
                        }
                      >
                        Duplicate
                      </Button>
                      {canDelete ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={pending}
                          onClick={() =>
                            start(async () => {
                              if (!confirm("Soft-delete this template?")) return
                              const res = await deleteEmsTemplateAction(t.id)
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
