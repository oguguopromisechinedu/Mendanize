"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import type { CommunityProfileRecord, CommunitySearchHit } from "@/services/community"
import { updateProfileAction } from "../actions/actions"
import { CommunityNav } from "./community-nav"
import { CommunitySearchForm } from "./community-search-form"

export function CommunityProfileView({
  profile,
  editable,
}: {
  profile: CommunityProfileRecord
  editable: boolean
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [bio, setBio] = useState(profile.bio ?? "")
  const [skills, setSkills] = useState(profile.skills.join(", "))
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "")

  return (
    <div>
      <CommunityNav currentPath="/community/profile" />
      <h1 className="font-display text-2xl font-bold">
        {profile.name ?? "Learner"} — community profile
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Reputation: {profile.reputation} (likes / helpful replies tally)
      </p>
      <p className="mt-4 text-sm">
        Study groups: {profile.studyGroupCount} · Teams: {profile.teamCount} ·
        Projects: {profile.projectCount}
      </p>
      <p className="mt-4 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
        Certificates earned and Learning Guides completed are placeholders until
        those systems are real — no fabricated numbers.
      </p>

      {editable ? (
        <form
          className="mt-8 max-w-xl space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            start(async () => {
              const res = await updateProfileAction({ bio, skills, avatarUrl })
              if (!res.ok) toast.error(res.message)
              else {
                toast.success("Profile updated")
                router.refresh()
              }
            })
          }}
        >
          <label className="block text-sm">
            Bio
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Skills (comma-separated)
            <input
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3"
            />
          </label>
          <label className="block text-sm">
            Avatar URL (Media Library)
            <input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3"
            />
          </label>
          <Button type="submit" disabled={pending} loading={pending}>
            Save profile
          </Button>
        </form>
      ) : (
        <div className="mt-6 space-y-2 text-sm">
          <p>{profile.bio ?? "No bio yet."}</p>
          {profile.skills.length > 0 ? (
            <p className="text-muted-foreground">
              Skills: {profile.skills.join(", ")}
            </p>
          ) : null}
        </div>
      )}
    </div>
  )
}

export function CommunitySearchView({
  query,
  hits,
}: {
  query: string
  hits: CommunitySearchHit[]
}) {
  return (
    <div>
      <CommunityNav currentPath="/community/search" />
      <h1 className="font-display text-2xl font-bold">Community search</h1>
      <div className="mt-4 max-w-xl">
        <CommunitySearchForm initialQuery={query} />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Powered by the Community module search path (extends Search Service
        indexing for discussions, groups, teams, projects).
      </p>
      {query && hits.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No results for “{query}”.</p>
      ) : null}
      <ul className="mt-6 divide-y divide-border rounded-xl border border-border">
        {hits.map((h) => (
          <li key={`${h.type}-${h.id}`}>
            <Link
              href={h.href}
              className="block px-4 py-3 hover:bg-hover"
            >
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {h.type}
              </p>
              <p className="font-medium">{h.title}</p>
              {h.excerpt ? (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {h.excerpt}
                </p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function CommunityGuidelinesView() {
  return (
    <div>
      <CommunityNav currentPath="/community/guidelines" />
      <h1 className="font-display text-2xl font-bold">Community guidelines</h1>
      <div className="prose prose-invert mt-6 max-w-2xl text-sm text-muted-foreground">
        <ul className="list-disc space-y-2 pl-5">
          <li>Be respectful — this is a learning community, not a social network.</li>
          <li>No spam, harassment, or sharing of private personal data.</li>
          <li>Stay on topic in category discussions.</li>
          <li>Report content that breaks these rules; moderators will review.</li>
          <li>
            Community moderators can hide content within /community only — they
            cannot access the Admin Dashboard.
          </li>
        </ul>
      </div>
    </div>
  )
}
