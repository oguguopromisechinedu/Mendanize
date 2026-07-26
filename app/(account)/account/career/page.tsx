import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { requirePublicUser } from "@/features/authentication/server"
import {
  computeReadinessAction,
  saveResumeAction,
  startInterviewAction,
  updateCareerAction,
} from "@/features/growth"
import {
  getLatestCareerReadiness,
  getOrCreateCareerProfile,
  listMentorshipsForUser,
} from "@/services/growth"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Career Hub",
  robots: { index: false },
}

export default async function Page() {
  const session = await requirePublicUser()
  if (!session?.user?.id) redirect(`/sign-in?callbackUrl=${encodeURIComponent("/account/career")}`)

  const [profile, mentorships, readiness] = await Promise.all([
    getOrCreateCareerProfile(session.user.id),
    listMentorshipsForUser(session.user.id),
    getLatestCareerReadiness(session.user.id),
  ])

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Career Hub
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Resume, interview practice via Ask AI, and a rules-based readiness
          score from certificates, assessments, guides, and projects.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Readiness score</h2>
        <p className="text-4xl font-semibold tabular-nums text-[var(--brand-amber,#E8940C)]">
          {readiness.score}
          <span className="ml-2 text-base font-normal text-muted-foreground">
            / 100
          </span>
        </p>
        {"gaps" in readiness && Array.isArray(readiness.gaps) && readiness.gaps.length > 0 ? (
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {readiness.gaps.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        ) : null}
        <form action={computeReadinessAction}>
          <Button type="submit" variant="outline" className="rounded-xl">
            Recalculate
          </Button>
        </form>
      </section>

      <section className="space-y-3 border-t border-border/60 pt-8">
        <h2 className="text-lg font-medium">Career profile</h2>
        <form action={updateCareerAction} className="space-y-3">
          <input
            name="headline"
            defaultValue={profile?.headline ?? ""}
            placeholder="Headline"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            name="targetRole"
            defaultValue={profile?.targetRole ?? ""}
            placeholder="Target role"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            name="location"
            defaultValue={profile?.location ?? ""}
            placeholder="Location"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          <textarea
            name="summary"
            defaultValue={profile?.summary ?? ""}
            rows={4}
            placeholder="Summary"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            name="skills"
            defaultValue={(profile?.skills ?? []).join(", ")}
            placeholder="Skills (comma-separated — reuses topic taxonomy later)"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          <Button type="submit" className="rounded-xl">
            Save profile
          </Button>
        </form>
      </section>

      <section className="space-y-3 border-t border-border/60 pt-8">
        <h2 className="text-lg font-medium">Resume version</h2>
        <form action={saveResumeAction} className="space-y-3">
          <input
            name="label"
            defaultValue="Primary"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          <textarea
            name="contentMarkdown"
            rows={8}
            placeholder="Paste resume markdown"
            defaultValue={profile?.resumeVersions?.[0]?.contentMarkdown ?? ""}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 font-mono text-sm"
          />
          <Button type="submit" className="rounded-xl">
            Save resume version
          </Button>
        </form>
        <p className="text-sm text-muted-foreground">
          Portfolio pulls from{" "}
          <Link href="/community/projects" className="underline-offset-4 hover:underline">
            Community showcase projects
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3 border-t border-border/60 pt-8">
        <h2 className="text-lg font-medium">Interview coach</h2>
        <p className="text-sm text-muted-foreground">
          Opens Ask Mendanize AI with an interview context — text only in this
          phase.
        </p>
        <form action={startInterviewAction} className="flex flex-wrap gap-3">
          <input
            name="targetRole"
            defaultValue={profile?.targetRole ?? ""}
            placeholder="Role to practice"
            className="min-w-[12rem] flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          <Button type="submit" className="rounded-xl">
            Start mock interview
          </Button>
        </form>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/ask?context=INTERVIEW">Open Ask · Interview</Link>
        </Button>
      </section>

      <section className="space-y-2 border-t border-border/60 pt-8">
        <h2 className="text-lg font-medium">Mentorship</h2>
        <p className="text-sm text-muted-foreground">
          {mentorships.asMentee.length} as mentee · {mentorships.asMentor.length}{" "}
          as mentor
        </p>
      </section>
    </div>
  )
}
