"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { ListResult, SubscriberRecord } from "@/services/admin/types"
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
  createSubscriberAction,
  deleteSubscribersAction,
  updateSubscriberAction,
} from "../actions/actions"

export function SubscribersListView({
  initial,
}: {
  initial: ListResult<SubscriberRecord>
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [selected, setSelected] = useState<string[]>([])
  const [query, setQuery] = useState("")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)

  function search() {
    const params = new URLSearchParams()
    if (query.trim()) params.set("query", query.trim())
    router.push(
      params.toString()
        ? `/dashboard/subscribers?${params}`
        : "/dashboard/subscribers"
    )
  }

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Subscribers"
        description="Audience list for newsletters and announcements."
      />
      <AdminActionToolbar>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Search…"
          className="h-9 w-full max-w-xs rounded-lg border border-input bg-transparent px-3 text-sm"
        />
        <Button size="sm" variant="outline" onClick={search}>
          Search
        </Button>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="h-9 w-full max-w-xs rounded-lg border border-input bg-transparent px-3 text-sm"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (optional)"
          className="h-9 w-full max-w-xs rounded-lg border border-input bg-transparent px-3 text-sm"
        />
        <Button
          size="sm"
          disabled={pending || !email.trim()}
          onClick={() =>
            start(async () => {
              const res = await createSubscriberAction({
                email,
                name: name || null,
              })
              if (!res.ok) toast.error(res.message)
              else {
                toast.success(res.message)
                setEmail("")
                setName("")
                router.refresh()
              }
            })
          }
        >
          Add
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={pending || !selected.length}
          onClick={() => setConfirmOpen(true)}
        >
          Remove
        </Button>
      </AdminActionToolbar>

      {!initial.items.length ? (
        <AdminEmptyState
          title="No subscribers"
          description="Add emails manually or collect them from the public newsletter form."
        />
      ) : (
        <AdminDataTable headers={["", "Email", "Name", "Status", "Categories", ""]}>
          {initial.items.map((sub) => (
            <tr key={sub.id} className="border-b border-border/60">
              <td className="px-3 py-2">
                <Checkbox
                  checked={selected.includes(sub.id)}
                  onCheckedChange={(checked) =>
                    setSelected((prev) =>
                      checked
                        ? [...prev, sub.id]
                        : prev.filter((id) => id !== sub.id)
                    )
                  }
                />
              </td>
              <td className="px-3 py-2 font-medium">{sub.email}</td>
              <td className="px-3 py-2">{sub.name || "—"}</td>
              <td className="px-3 py-2">
                <StatusBadge status={sub.status} />
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                {sub.categories.join(", ") || "—"}
              </td>
              <td className="px-3 py-2">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      const next =
                        sub.status === "active" ? "unsubscribed" : "active"
                      const res = await updateSubscriberAction(sub.id, {
                        status: next,
                      })
                      if (!res.ok) toast.error(res.message)
                      else {
                        toast.success(res.message)
                        router.refresh()
                      }
                    })
                  }
                >
                  {sub.status === "active" ? "Unsubscribe" : "Reactivate"}
                </Button>
              </td>
            </tr>
          ))}
        </AdminDataTable>
      )}

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Remove subscribers?"
        description="Selected emails will be deleted from the audience list."
        confirmLabel="Remove"
        onConfirm={() =>
          start(async () => {
            const res = await deleteSubscribersAction({ ids: selected })
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
