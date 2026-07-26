"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import type { TeamDetail, TeamProgressStatus, TeamSummary } from "@/services/community"
import {
  createTeamAction,
  joinTeamAction,
  updateTeamProgressAction,
} from "../actions/actions"
import { CommunityNav } from "./community-nav"

export function TeamListView({
  items,
  signedIn,
}: {
  items: TeamSummary[]
  signedIn: boolean
}) {
  return (
    <div>
      <CommunityNav currentPath="/community/teams" />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Team projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Roles: Owner / Lead / Member (not platform Admin).
          </p>
        </div>
        {signedIn ? (
          <Button asChild>
            <Link href="/community/teams/new">Create team</Link>
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href="/sign-in?callbackUrl=/community/teams/new">
              Sign in to create
            </Link>
          </Button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No public teams yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((t) => (
            <li key={t.id}>
              <Link
                href={`/community/teams/${t.slug}`}
                className="block rounded-xl border border-border p-4 hover:border-primary/40"
              >
                <p className="font-medium">{t.name}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {t.description ?? "No description"}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {t.progressStatus.replaceAll("_", " ")} · {t.memberCount}{" "}
                  members
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function NewTeamForm() {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [skills, setSkills] = useState("")

  return (
    <div>
      <CommunityNav currentPath="/community/teams" />
      <h1 className="font-display text-2xl font-bold">Create team</h1>
      <form
        className="mt-6 max-w-xl space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          start(async () => {
            const res = await createTeamAction({ name, description, skills })
            if (!res.ok) toast.error(res.message)
            else {
              toast.success("Team created")
              router.push(`/community/teams/${res.slug}`)
            }
          })
        }}
      >
        <label className="block text-sm">
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3"
            required
          />
        </label>
        <label className="block text-sm">
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Skills required (comma-separated)
          <input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3"
          />
        </label>
        <Button type="submit" disabled={pending} loading={pending}>
          Create team
        </Button>
      </form>
    </div>
  )
}

export function TeamDetailView({
  team,
  signedIn,
  canManageProgress,
}: {
  team: TeamDetail
  signedIn: boolean
  canManageProgress: boolean
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [status, setStatus] = useState<TeamProgressStatus>(team.progressStatus)

  return (
    <div>
      <CommunityNav currentPath="/community/teams" />
      <h1 className="font-display text-3xl font-bold">{team.name}</h1>
      <p className="mt-2 text-muted-foreground">
        {team.description ?? "No description yet."}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Status: {team.progressStatus.replaceAll("_", " ")} · Owner:{" "}
        {team.owner.name ?? "Learner"}
      </p>
      {team.skills.length > 0 ? (
        <p className="mt-2 flex flex-wrap gap-2">
          {team.skills.map((s) => (
            <span
              key={s}
              className="rounded-md border border-border px-2 py-0.5 text-xs"
            >
              {s}
            </span>
          ))}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        {signedIn ? (
          <Button
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await joinTeamAction(team.id)
                if (!res.ok) toast.error(res.message)
                else {
                  toast.success("Joined team")
                  router.refresh()
                }
              })
            }
          >
            Join team
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href={`/sign-in?callbackUrl=/community/teams/${team.slug}`}>
              Sign in to join
            </Link>
          </Button>
        )}
      </div>

      <nav className="mt-10 flex flex-wrap gap-3 text-sm" aria-label="Team sections">
        {["Overview", "Members", "Tasks", "Resources", "Discussion", "Files", "Activity"].map(
          (tab) => (
            <span
              key={tab}
              className="rounded-lg border border-border px-3 py-1 text-muted-foreground"
            >
              {tab}
              {(tab === "Tasks" || tab === "Files") && (
                <span className="ml-1 text-xs">(placeholder)</span>
              )}
            </span>
          ),
        )}
      </nav>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold">Members</h2>
        <ul className="mt-3 space-y-1 text-sm">
          {team.members.map((m) => (
            <li key={m.publicUserId}>
              {m.name ?? "Learner"} — {m.role}
            </li>
          ))}
        </ul>
      </section>

      {canManageProgress ? (
        <section className="mt-8 max-w-sm space-y-3">
          <h2 className="font-display text-lg font-semibold">
            Progress status (manual)
          </h2>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TeamProgressStatus)}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETE">Complete</option>
          </select>
          <Button
            size="sm"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await updateTeamProgressAction({
                  teamId: team.id,
                  progressStatus: status,
                })
                if (!res.ok) toast.error(res.message)
                else {
                  toast.success("Progress updated")
                  router.refresh()
                }
              })
            }
          >
            Save status
          </Button>
        </section>
      ) : null}

      <p className="mt-8 text-sm text-muted-foreground">
        Tasks and Files sections are placeholders in Phase 1.
      </p>
    </div>
  )
}
