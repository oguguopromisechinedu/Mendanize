"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { UserPlus, ChevronDown } from "lucide-react"
import type { AdminRoleKey } from "@prisma/client"

import type { ListResult, UserAdminRecord } from "@/services/admin/types"
import {
  AdminActionToolbar,
  AdminDataTable,
  AdminEmptyState,
  AdminPageHeader,
  ConfirmationDialog,
  StatusBadge,
} from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { INVITABLE_STAFF_ROLES } from "@/lib/admin/staff-roles"
import {
  cancelStaffInviteAction,
  createAdminAction,
  inviteStaffAction,
  removeAdminUserAction,
  resendStaffInviteAction,
  setAdminActiveAction,
  setAdminPasswordAction,
  updateUserRoleAction,
} from "../actions/actions"

type RoleOption = {
  key: AdminRoleKey
  label: string
  permissions: Array<{ key: string; name: string }>
}

const ALL_ROLES: AdminRoleKey[] = [
  "SUPER_ADMINISTRATOR",
  "ADMINISTRATOR",
  "EDITOR",
  "CONTENT_MANAGER",
  "ANALYTICS_MANAGER",
  "SUPPORT_MANAGER",
]

function formatLastLogin(iso: string | null) {
  if (!iso) return "Never"
  return new Date(iso).toLocaleString()
}

function statusBadge(status: UserAdminRecord["status"]) {
  if (status === "ACTIVE") return <StatusBadge status="ACTIVE" />
  if (status === "INVITED") return <StatusBadge status="PENDING" />
  return <StatusBadge status="INACTIVE" />
}

export function UsersListView({
  initial,
  isSuperAdmin,
  roles,
}: {
  initial: ListResult<UserAdminRecord>
  isSuperAdmin: boolean
  roles: RoleOption[]
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [inviteOpen, setInviteOpen] = useState(false)
  const [staffDialogMode, setStaffDialogMode] = useState<"invite" | "create">(
    "invite",
  )
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteName, setInviteName] = useState("")
  const [invitePassword, setInvitePassword] = useState("")
  const [inviteRole, setInviteRole] = useState<AdminRoleKey>("EDITOR")
  const [removeTarget, setRemoveTarget] = useState<UserAdminRecord | null>(null)

  const inviteRoleMeta = useMemo(
    () => roles.find((r) => r.key === inviteRole),
    [roles, inviteRole],
  )

  function search() {
    const params = new URLSearchParams()
    if (query.trim()) params.set("query", query.trim())
    if (roleFilter) params.set("role", roleFilter)
    if (statusFilter !== "ALL") params.set("status", statusFilter)
    router.push(
      params.toString() ? `/dashboard/users?${params}` : "/dashboard/users",
    )
  }

  function resetPassword(user: UserAdminRecord) {
    const password = window.prompt(
      `Set a new password for ${user.email} (min 8 characters):`,
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
        description="Staff-only module. Public learners never appear here. Founders invite and manage dashboard access."
        actions={
          isSuperAdmin ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="rounded-xl">
                  <UserPlus className="mr-1.5 size-4" />
                  Invite / Add user
                  <ChevronDown className="ml-1 size-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setStaffDialogMode("invite")
                    setInviteOpen(true)
                  }}
                >
                  Invite by email
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setStaffDialogMode("create")
                    setInviteOpen(true)
                  }}
                >
                  Add user directly
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null
        }
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
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
        >
          <option value="">All roles</option>
          {ALL_ROLES.map((r) => (
            <option key={r} value={r}>
              {roles.find((x) => x.key === r)?.label ?? r}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
        >
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INVITED">Invited</option>
          <option value="DEACTIVATED">Deactivated</option>
        </select>
        <Button size="sm" variant="outline" onClick={search}>
          Search
        </Button>
      </AdminActionToolbar>

      {!initial.items.length ? (
        <AdminEmptyState
          title="No staff found"
          description={
            isSuperAdmin
              ? "Invite your first team member with the button above."
              : "No staff match your filters."
          }
        />
      ) : (
        <AdminDataTable
          headers={[
            "Name",
            "Email",
            "Role",
            "Status",
            "Last login",
            "Permissions",
            "Actions",
          ]}
        >
          {initial.items.map((user) => (
            <tr key={user.id} className="border-b border-border/60 align-top">
              <td className="px-3 py-2 font-medium">{user.name || "—"}</td>
              <td className="px-3 py-2">{user.email}</td>
              <td className="px-3 py-2">
                <StatusBadge status={user.roleLabel} />
              </td>
              <td className="px-3 py-2">{statusBadge(user.status)}</td>
              <td className="px-3 py-2 text-xs text-muted-foreground">
                {user.status === "INVITED"
                  ? "Pending acceptance"
                  : formatLastLogin(user.lastLoginAt)}
              </td>
              <td className="max-w-[12rem] px-3 py-2 text-[11px] text-muted-foreground">
                {user.permissions.length
                  ? user.permissions.slice(0, 3).join(", ") +
                    (user.permissions.length > 3
                      ? ` +${user.permissions.length - 3}`
                      : "")
                  : "—"}
              </td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap items-center gap-2">
                  {user.status === "INVITED" && user.invitationId ? (
                    isSuperAdmin ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 text-xs"
                          disabled={pending}
                          onClick={() =>
                            start(async () => {
                              const res = await resendStaffInviteAction({
                                invitationId: user.invitationId!,
                              })
                              if (!res.ok) toast.error(res.message)
                              else {
                                toast.success(res.message)
                                router.refresh()
                              }
                            })
                          }
                        >
                          Resend
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-xs text-destructive"
                          disabled={pending}
                          onClick={() =>
                            start(async () => {
                              const res = await cancelStaffInviteAction({
                                invitationId: user.invitationId!,
                              })
                              if (!res.ok) toast.error(res.message)
                              else {
                                toast.success(res.message)
                                router.refresh()
                              }
                            })
                          }
                        >
                          Cancel
                        </Button>
                      </>
                    ) : null
                  ) : (
                    <>
                      {isSuperAdmin ? (
                        <select
                          className="h-8 max-w-[9rem] rounded-md border border-input bg-transparent px-2 text-xs"
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
                          {ALL_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {roles.find((x) => x.key === r)?.label ?? r}
                            </option>
                          ))}
                        </select>
                      ) : null}
                      {isSuperAdmin ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 text-xs"
                          disabled={pending}
                          onClick={() =>
                            start(async () => {
                              const res = await setAdminActiveAction({
                                id: user.id,
                                active: user.status !== "ACTIVE",
                              })
                              if (!res.ok) toast.error(res.message)
                              else {
                                toast.success(res.message)
                                router.refresh()
                              }
                            })
                          }
                        >
                          {user.status === "ACTIVE" ? "Deactivate" : "Activate"}
                        </Button>
                      ) : null}
                      {isSuperAdmin ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-xs"
                          disabled={pending}
                          onClick={() => resetPassword(user)}
                        >
                          Set password
                        </Button>
                      ) : null}
                      {isSuperAdmin ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-xs text-destructive"
                          disabled={pending}
                          onClick={() => setRemoveTarget(user)}
                        >
                          Remove
                        </Button>
                      ) : null}
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </AdminDataTable>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        {initial.total} staff record(s). Public user accounts are managed under
        Subscribers — they cannot access this dashboard.
      </p>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {staffDialogMode === "invite"
                ? "Invite staff member"
                : "Add staff member"}
            </DialogTitle>
            <DialogDescription>
              {staffDialogMode === "invite"
                ? "Send an email invitation with a secure link to set a password. Only founders can invite staff."
                : "Create an account with a password immediately. Share credentials securely — no invitation email is sent."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">Email</span>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-3"
                placeholder="colleague@company.com"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">Name (optional)</span>
              <input
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-3"
              />
            </label>
            {staffDialogMode === "create" ? (
              <label className="grid gap-1 text-sm">
                <span className="text-muted-foreground">Password</span>
                <input
                  type="password"
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  minLength={8}
                  className="h-10 rounded-lg border border-input bg-background px-3"
                  placeholder="Min. 8 characters"
                />
              </label>
            ) : null}
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">Role</span>
              <select
                value={inviteRole}
                onChange={(e) =>
                  setInviteRole(e.target.value as AdminRoleKey)
                }
                className="h-10 rounded-lg border border-input bg-background px-3"
              >
                {INVITABLE_STAFF_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {roles.find((x) => x.key === r)?.label ?? r}
                  </option>
                ))}
                {isSuperAdmin ? (
                  <option value="SUPER_ADMINISTRATOR">Founder</option>
                ) : null}
              </select>
            </label>
            {inviteRoleMeta ? (
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Permissions</p>
                <ul className="mt-1 list-disc pl-4">
                  {inviteRoleMeta.permissions.length ? (
                    inviteRoleMeta.permissions.map((p) => (
                      <li key={p.key}>{p.name}</li>
                    ))
                  ) : (
                    <li>Dashboard access only</li>
                  )}
                </ul>
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInviteOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              disabled={
                pending ||
                !inviteEmail.trim() ||
                (staffDialogMode === "create" && invitePassword.length < 8)
              }
              onClick={() =>
                start(async () => {
                  const res =
                    staffDialogMode === "invite"
                      ? await inviteStaffAction({
                          email: inviteEmail.trim(),
                          name: inviteName.trim() || null,
                          role: inviteRole,
                          sendEmail: true,
                        })
                      : await createAdminAction({
                          email: inviteEmail.trim(),
                          name: inviteName.trim() || null,
                          password: invitePassword,
                          role: inviteRole,
                        })
                  if (!res.ok) toast.error(res.message)
                  else {
                    toast.success(res.message)
                    setInviteOpen(false)
                    setInviteEmail("")
                    setInviteName("")
                    setInvitePassword("")
                    setInviteRole("EDITOR")
                    setStaffDialogMode("invite")
                    router.refresh()
                  }
                })
              }
            >
              {staffDialogMode === "invite"
                ? "Send invitation"
                : "Create user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={Boolean(removeTarget)}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Remove staff member?"
        description={
          removeTarget
            ? `Remove ${removeTarget.email}? If they own content, deactivation may be required instead.`
            : ""
        }
        confirmLabel="Remove"
        onConfirm={() => {
          if (!removeTarget) return
          start(async () => {
            const res = await removeAdminUserAction({ id: removeTarget.id })
            if (!res.ok) toast.error(res.message)
            else {
              toast.success(res.message)
              setRemoveTarget(null)
              router.refresh()
            }
          })
        }}
      />
    </div>
  )
}
