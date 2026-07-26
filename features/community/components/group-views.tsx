"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import type { StudyGroupDetail, StudyGroupSummary } from "@/services/community"
import {
  createStudyGroupAction,
  joinStudyGroupAction,
} from "../actions/actions"
import { CommunityNav } from "./community-nav"

export function StudyGroupListView({
  items,
  signedIn,
}: {
  items: StudyGroupSummary[]
  signedIn: boolean
}) {
  return (
    <div>
      <CommunityNav currentPath="/community/groups" />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Study groups</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Learn together. Progress tracking is a placeholder until it ships.
          </p>
        </div>
        {signedIn ? (
          <Button asChild>
            <Link href="/community/groups/new">Create group</Link>
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href="/sign-in?callbackUrl=/community/groups/new">
              Sign in to create
            </Link>
          </Button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No public groups yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((g) => (
            <li key={g.id}>
              <Link
                href={`/community/groups/${g.slug}`}
                className="block rounded-xl border border-border p-4 hover:border-primary/40"
              >
                <p className="font-medium">{g.name}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {g.description ?? "No description"}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {g.memberCount} members · {g.visibility}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function NewStudyGroupForm() {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC")

  return (
    <div>
      <CommunityNav currentPath="/community/groups" />
      <h1 className="font-display text-2xl font-bold">Create study group</h1>
      <form
        className="mt-6 max-w-xl space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          start(async () => {
            const res = await createStudyGroupAction({
              name,
              description,
              visibility,
            })
            if (!res.ok) toast.error(res.message)
            else {
              toast.success("Group created")
              router.push(`/community/groups/${res.slug}`)
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
          Visibility
          <select
            value={visibility}
            onChange={(e) =>
              setVisibility(e.target.value as "PUBLIC" | "PRIVATE")
            }
            className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3"
          >
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private (request to join)</option>
          </select>
        </label>
        <Button type="submit" disabled={pending} loading={pending}>
          Create group
        </Button>
      </form>
    </div>
  )
}

export function StudyGroupDetailView({
  group,
  signedIn,
}: {
  group: StudyGroupDetail
  signedIn: boolean
}) {
  const router = useRouter()
  const [pending, start] = useTransition()

  return (
    <div>
      <CommunityNav currentPath="/community/groups" />
      <h1 className="font-display text-3xl font-bold">{group.name}</h1>
      <p className="mt-2 text-muted-foreground">
        {group.description ?? "No description yet."}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Owner: {group.owner.name ?? "Learner"} · {group.memberCount} members ·{" "}
        {group.visibility}
      </p>

      <div className="mt-6">
        {signedIn ? (
          <Button
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await joinStudyGroupAction(group.id)
                if (!res.ok) toast.error(res.message)
                else {
                  toast.success(
                    res.status === "PENDING"
                      ? "Join request sent"
                      : "Joined group",
                  )
                  router.refresh()
                }
              })
            }
          >
            Join group
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href={`/sign-in?callbackUrl=/community/groups/${group.slug}`}>
              Sign in to join
            </Link>
          </Button>
        )}
      </div>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">Members</h2>
        <ul className="mt-3 space-y-1 text-sm">
          {group.members
            .filter((m) => m.status === "ACTIVE")
            .map((m) => (
              <li key={m.publicUserId}>
                {m.name ?? "Learner"} — {m.role}
              </li>
            ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold">Pinned resources</h2>
        {group.pinnedResources.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">None yet.</p>
        ) : (
          <ul className="mt-2 list-disc pl-5 text-sm">
            {group.pinnedResources.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold">Shared notes</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
          {group.sharedNotes ?? "No notes yet."}
        </p>
      </section>

      <p className="mt-8 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
        Learning progress — placeholder until MES-010 progress tracking is real.
        No fabricated numbers shown.
      </p>
    </div>
  )
}
