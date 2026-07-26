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
import {
  setAdminPasswordAction,
  updateUserRoleAction,
} from "../actions/actions"

const ROLES = [
  "SUPER_ADMINISTRATOR",
  "ADMINISTRATOR",
  "EDITOR",
  "CONTENT_MANAGER",
  "ANALYTICS_MANAGER",
  "SUPPORT_MANAGER",
] as const

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

  function resetPassword(user: UserAdminRecord) {
    const password = window.prompt(
      `Set a new password for ${user.email} (min 8 characters):`
    )
    if (password == null) return
    start(async () => {
      const res = await setAdminPasswordAction({ id: user.id, password })
      if (!res.ok) toast.error(res.message)
      else toast.success(res.message)
    })
  }

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Users & Roles"
        description="Staff accounts. Role and password changes require users.manage."
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
          description="Seed an admin or wait for staff provisioning."
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
                <div className="flex items-center gap-2">
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
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-xs"
                    disabled={pending}
                    onClick={() => resetPassword(user)}
                  >
                    Set password
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </AdminDataTable>
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        {initial.total} admin(s). The last SUPER_ADMINISTRATOR cannot be demoted.
        Password resets are staff-provisioned only.
      </p>
    </div>
  )
}
