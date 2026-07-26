"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { BrokenLinkRecord, ListResult } from "@/services/admin/types"
import {
  AdminActionToolbar,
  AdminDataTable,
  AdminEmptyState,
  AdminPageHeader,
  StatusBadge,
} from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  redirectBrokenLinkAction,
  scanBrokenLinksAction,
  updateBrokenLinkStatusAction,
} from "../actions/actions"

export function BrokenLinksView({
  initial,
}: {
  initial: ListResult<BrokenLinkRecord>
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [selected, setSelected] = useState<string[]>([])

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Broken Links"
        description="HTTP-checks outbound links in published articles, guides, tools, and pages. Only unreachable URLs stay open."
      />
      <AdminActionToolbar>
        <Button
          size="sm"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await scanBrokenLinksAction()
              if (!res.ok) toast.error(res.message)
              else {
                toast.success(res.message)
                router.refresh()
              }
            })
          }
        >
          Run scan
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={pending || !selected.length}
          onClick={() =>
            start(async () => {
              const res = await updateBrokenLinkStatusAction({
                ids: selected,
                status: "IGNORED",
              })
              if (!res.ok) toast.error(res.message)
              else {
                toast.success(res.message)
                setSelected([])
                router.refresh()
              }
            })
          }
        >
          Ignore
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={pending || !selected.length}
          onClick={() =>
            start(async () => {
              const res = await updateBrokenLinkStatusAction({
                ids: selected,
                status: "FIXED",
              })
              if (!res.ok) toast.error(res.message)
              else {
                toast.success(res.message)
                setSelected([])
                router.refresh()
              }
            })
          }
        >
          Mark fixed
        </Button>
      </AdminActionToolbar>

      {!initial.items.length ? (
        <AdminEmptyState
          title="No broken links"
          description="Run a scan to HTTP-check outbound URLs in published content. Healthy links are not listed."
        />
      ) : (
        <AdminDataTable
          headers={["", "URL", "Found on", "Code", "Status", ""]}
        >
          {initial.items.map((link) => (
            <tr key={link.id} className="border-b border-border/60">
              <td className="px-3 py-2">
                <Checkbox
                  checked={selected.includes(link.id)}
                  onCheckedChange={(checked) =>
                    setSelected((prev) =>
                      checked
                        ? [...prev, link.id]
                        : prev.filter((id) => id !== link.id)
                    )
                  }
                />
              </td>
              <td className="max-w-xs truncate px-3 py-2 text-sm">{link.url}</td>
              <td className="px-3 py-2 text-xs text-muted-foreground">
                {link.foundOnPath}
              </td>
              <td className="px-3 py-2">{link.statusCode ?? "—"}</td>
              <td className="px-3 py-2">
                <StatusBadge status={link.status} />
              </td>
              <td className="px-3 py-2">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() => {
                    const destination = window.prompt(
                      "Redirect destination path or URL",
                      "/"
                    )
                    if (!destination?.trim()) return
                    start(async () => {
                      const res = await redirectBrokenLinkAction({
                        id: link.id,
                        destination,
                      })
                      if (!res.ok) toast.error(res.message)
                      else {
                        toast.success(res.message)
                        router.refresh()
                      }
                    })
                  }}
                >
                  Create redirect
                </Button>
              </td>
            </tr>
          ))}
        </AdminDataTable>
      )}
    </div>
  )
}
