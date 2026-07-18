"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { ListResult, UserAdminRecord } from "@/services/admin/types"
import {
  AdminActionToolbar,
  AdminDataTable,
  AdminEmptyState,
  AdminPageHeader,
  StatusBadge,
} from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import { updateUserRoleAction } from "../actions/actions"

const ROLES = ["LEARNER", "EDITOR", "ADMIN", "SUPER_ADMIN"] as const

export function UsersListView({
  initial,
}: {
  initial: ListResult<UserAdminRecord>
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [query, setQuery] = useState("")
  const [role, setRole] = useState("")

  function search() {
    const params = new URLSearchParams()
    if (query.trim()) params.set("query", query.trim())
    if (role) params.set("role", role)
    router.push(
      params.toString() ? `/dashboard/users?${params}` : "/dashboard/users"
    )
  }

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Users & Roles"
        description="Staff and learner accounts. Role changes require ADMIN."
      />
      <AdminActionToolbar>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Search name or email…"
          className="h-9 w-full max-w-xs rounded-lg border border-input bg-transparent px-3 text-sm"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <Button size="sm" variant="outline" onClick={search}>
          Search
        </Button>
      </AdminActionToolbar>

      {!initial.items.length ? (
        <AdminEmptyState
          title="No users found"
          description="Seed an admin or wait for sign-ups."
        />
      ) : (
        <AdminDataTable
          headers={["Name", "Email", "Role", "Plan", "Joined", ""]}
        >
          {initial.items.map((user) => (
            <tr key={user.id} className="border-b border-border/60">
              <td className="px-3 py-2 font-medium">{user.name || "—"}</td>
              <td className="px-3 py-2">{user.email}</td>
              <td className="px-3 py-2">
                <StatusBadge status={user.role} />
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                {user.plan || "—"}
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="px-3 py-2">
                <select
                  className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
                  defaultValue={user.role}
                  disabled={pending}
                  onChange={(e) => {
                    const next = e.target.value
                    start(async () => {
                      const res = await updateUserRoleAction({
                        id: user.id,
                        role: next,
                      })
                      if (!res.ok) toast.error(res.message)
                      else {
                        toast.success(res.message)
                        router.refresh()
                      }
                    })
                  }}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </AdminDataTable>
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        {initial.total} user(s). The last SUPER_ADMIN cannot be demoted.
      </p>
    </div>
  )
}
