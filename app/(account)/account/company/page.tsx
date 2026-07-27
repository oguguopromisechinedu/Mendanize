import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { requirePublicUser } from "@/features/authentication/server"
import {
  addOrganizationMemberAction,
  createOrganizationAction,
  submitOrganizationVerificationAction,
  updateOrganizationAction,
} from "@/features/growth"
import {
  getOrganizationForUser,
  listOrganizationMembers,
} from "@/services/organization"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Company",
  robots: { index: false },
}

const TYPE_OPTIONS = [
  { value: "COMPANY", label: "Company" },
  { value: "STARTUP", label: "Startup" },
  { value: "EDUCATION", label: "Educational institution" },
  { value: "NONPROFIT", label: "Non-profit" },
  { value: "OTHER", label: "Other" },
] as const

function statusLabel(status: string) {
  switch (status) {
    case "VERIFIED":
      return "Verified"
    case "PENDING":
      return "Pending review"
    case "REJECTED":
      return "Rejected"
    default:
      return "Unverified"
  }
}

export default async function Page() {
  const session = await requirePublicUser()
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent("/account/company")}`)
  }

  const org = await getOrganizationForUser(session.user.id)
  const members = org ? await listOrganizationMembers(org.id) : []
  const canManage =
    Boolean(org) &&
    members.some(
      (m) =>
        m.publicUserId === session.user.id &&
        (m.role === "OWNER" || m.role === "ADMIN"),
    )

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Company
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Register your organization to hire on Work Marketplace. Company
          accounts stay under <code className="text-xs">/account</code> — they
          never open the Admin dashboard.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/account/hiring">Hiring desk</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/account/work">Browse jobs</Link>
          </Button>
        </div>
      </div>

      {!org ? (
        <form action={createOrganizationAction} className="space-y-3 border-t border-border/60 pt-8">
          <h2 className="text-lg font-medium">Create your company</h2>
          <input
            name="name"
            required
            placeholder="Company name"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          <select
            name="type"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            defaultValue="COMPANY"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <textarea
            name="description"
            rows={4}
            placeholder="Short description"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            name="website"
            placeholder="Website"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              name="industry"
              placeholder="Industry"
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              name="size"
              placeholder="Company size"
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              name="location"
              placeholder="Location"
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <Button type="submit" className="rounded-xl">
            Create company
          </Button>
        </form>
      ) : (
        <>
          <section className="space-y-3 border-t border-border/60 pt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-medium">{org.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {org.type.replaceAll("_", " ")} · {statusLabel(org.verificationStatus)}
                  {org.memberCount != null ? ` · ${org.memberCount} members` : ""}
                </p>
              </div>
              {canManage && org.verificationStatus !== "PENDING" && org.verificationStatus !== "VERIFIED" ? (
                <form action={submitOrganizationVerificationAction}>
                  <input type="hidden" name="organizationId" value={org.id} />
                  <Button type="submit" variant="outline" className="rounded-xl">
                    Submit for verification
                  </Button>
                </form>
              ) : null}
            </div>
            {org.verificationNote ? (
              <p className="text-sm text-muted-foreground">
                Review note: {org.verificationNote}
              </p>
            ) : null}
          </section>

          {canManage ? (
            <form action={updateOrganizationAction} className="space-y-3 border-t border-border/60 pt-8">
              <h2 className="text-lg font-medium">Edit profile</h2>
              <input type="hidden" name="organizationId" value={org.id} />
              <input
                name="name"
                defaultValue={org.name}
                required
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
              <select
                name="type"
                defaultValue={org.type}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <textarea
                name="description"
                rows={4}
                defaultValue={org.description ?? ""}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                name="website"
                defaultValue={org.website ?? ""}
                placeholder="Website"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  name="industry"
                  defaultValue={org.industry ?? ""}
                  placeholder="Industry"
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                />
                <input
                  name="size"
                  defaultValue={org.size ?? ""}
                  placeholder="Company size"
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                />
                <input
                  name="location"
                  defaultValue={org.location ?? ""}
                  placeholder="Location"
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <Button type="submit" className="rounded-xl">
                Save changes
              </Button>
            </form>
          ) : null}

          <section className="space-y-4 border-t border-border/60 pt-8">
            <h2 className="text-lg font-medium">Team members</h2>
            <ul className="space-y-2">
              {members.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2 text-sm"
                >
                  <span>
                    {m.name || m.email || m.publicUserId}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {m.role}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            {canManage ? (
              <form action={addOrganizationMemberAction} className="flex flex-col gap-2 sm:flex-row">
                <input type="hidden" name="organizationId" value={org.id} />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Learner email"
                  className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm"
                />
                <Button type="submit" variant="outline" className="rounded-xl">
                  Add member
                </Button>
              </form>
            ) : null}
          </section>
        </>
      )}
    </div>
  )
}
