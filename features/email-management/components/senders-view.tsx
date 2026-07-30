"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { AdminPageHeader, StatusBadge } from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import {
  createEmsSenderAction,
  deleteEmsSenderAction,
  updateEmsSenderAction,
} from "../actions"
import { EmsNav } from "./ems-nav"

export function EmsSendersView({
  senders,
  canManage,
}: {
  senders: Array<{
    id: string
    address: string
    displayName: string
    replyTo: string | null
    status: string
    enabled: boolean
  }>
  canManage: boolean
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [address, setAddress] = useState("")
  const [displayName, setDisplayName] = useState("")

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Sender management"
        description="Only verified @mendanize.com addresses. Super Admin only."
      />
      <EmsNav />
      {!canManage ? (
        <p className="mb-4 text-sm text-muted-foreground">
          View only — Super Administrator required to change senders.
        </p>
      ) : (
        <div className="mb-6 flex flex-wrap gap-2">
          <input
            className="h-9 min-w-[180px] flex-1 rounded-lg border border-input bg-transparent px-3 text-sm"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="hello@mendanize.com"
          />
          <input
            className="h-9 min-w-[140px] rounded-lg border border-input bg-transparent px-3 text-sm"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display name"
          />
          <Button
            size="sm"
            disabled={pending || !address.trim()}
            onClick={() =>
              start(async () => {
                const res = await createEmsSenderAction({
                  address,
                  displayName: displayName || address,
                })
                if (!res.ok) toast.error(res.message)
                else {
                  toast.success(res.message)
                  setAddress("")
                  setDisplayName("")
                  router.refresh()
                }
              })
            }
          >
            Add sender
          </Button>
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Address</th>
              <th className="px-3 py-2 font-medium">Display</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Enabled</th>
              {canManage ? (
                <th className="px-3 py-2 font-medium">Actions</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {senders.map((s) => (
              <tr key={s.id} className="border-b border-border/60">
                <td className="px-3 py-2 font-mono text-xs">{s.address}</td>
                <td className="px-3 py-2">{s.displayName}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={s.status.toLowerCase()} />
                </td>
                <td className="px-3 py-2">{s.enabled ? "Yes" : "No"}</td>
                {canManage ? (
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {s.status !== "VERIFIED" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={pending}
                          onClick={() =>
                            start(async () => {
                              const res = await updateEmsSenderAction(s.id, {
                                status: "VERIFIED",
                              })
                              if (!res.ok) toast.error(res.message)
                              else {
                                toast.success(res.message)
                                router.refresh()
                              }
                            })
                          }
                        >
                          Mark verified
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={pending}
                        onClick={() =>
                          start(async () => {
                            const res = await updateEmsSenderAction(s.id, {
                              enabled: !s.enabled,
                            })
                            if (!res.ok) toast.error(res.message)
                            else {
                              toast.success(res.message)
                              router.refresh()
                            }
                          })
                        }
                      >
                        {s.enabled ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={pending}
                        onClick={() =>
                          start(async () => {
                            if (!confirm("Remove this sender?")) return
                            const res = await deleteEmsSenderAction(s.id)
                            if (!res.ok) toast.error(res.message)
                            else {
                              toast.success(res.message)
                              router.refresh()
                            }
                          })
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
