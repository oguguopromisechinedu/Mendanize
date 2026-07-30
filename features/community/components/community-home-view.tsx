import Link from "next/link"

import { Button } from "@/components/ui/button"
import type { CommunityHomePayload } from "@/services/community"
import { CommunityNav } from "./community-nav"
import { CommunitySearchForm } from "./community-search-form"

export function CommunityHomeView({
  data,
  signedIn,
}: {
  data: CommunityHomePayload
  signedIn: boolean
}) {
  return (
    <div>
      <CommunityNav currentPath="/community" />

      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-background px-6 py-10 sm:px-10">
        <p className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Community
        </p>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Discuss ideas, form study groups and project teams, and showcase what
          you&apos;ve built — a learning community, not a social network.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {signedIn ? (
            <>
              <Button asChild>
                <Link href="/community/discussions/new">Start a discussion</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/community/projects/new">Share a project</Link>
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link href="/sign-in?callbackUrl=/community">
                Sign in to participate
              </Link>
            </Button>
          )}
          <Button asChild variant="ghost">
            <Link href="/community/guidelines">Guidelines</Link>
          </Button>
        </div>
        <div className="mt-8 max-w-xl">
          <CommunitySearchForm />
        </div>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <Section
          title="Latest discussions"
          href="/community/discussions"
          empty="No discussions yet — be the first."
        >
          {data.latestDiscussions.map((d) => (
            <ListRow
              key={d.id}
              href={`/community/discussions/${d.id}`}
              title={d.title}
              meta={`${d.category.name} · ${d.replyCount} replies · ${d.likeCount} likes`}
            />
          ))}
        </Section>

        <Section
          title="Trending"
          href="/community/discussions?sort=popular"
          empty="Nothing trending yet."
        >
          {data.trendingDiscussions.map((d) => (
            <ListRow
              key={d.id}
              href={`/community/discussions/${d.id}`}
              title={d.title}
              meta={`${d.viewCount} views · ${d.category.name}`}
            />
          ))}
        </Section>

        <Section
          title="Study groups"
          href="/community/groups"
          empty="No public groups yet."
        >
          {data.recommendedGroups.map((g) => (
            <ListRow
              key={g.id}
              href={`/community/groups/${g.slug}`}
              title={g.name}
              meta={`${g.memberCount} members`}
            />
          ))}
        </Section>

        <Section
          title="Active teams"
          href="/community/teams"
          empty="No public teams yet."
        >
          {data.activeTeams.map((t) => (
            <ListRow
              key={t.id}
              href={`/community/teams/${t.slug}`}
              title={t.name}
              meta={`${t.progressStatus.replaceAll("_", " ")} · ${t.memberCount} members`}
            />
          ))}
        </Section>

        <Section
          title="Upcoming events"
          href="/community/events"
          empty="No upcoming events yet."
        >
          {data.upcomingEvents.map((e) => (
            <ListRow
              key={e.id}
              href={`/community/events/${e.slug}`}
              title={e.title}
              meta={`${new Date(e.startsAt).toLocaleString()} · ${e.locationType.replaceAll("_", " ")} · ${e.rsvpCount} RSVPs`}
            />
          ))}
        </Section>
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="font-display text-xl font-semibold">Featured projects</h2>
          <Link
            href="/community/projects"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        {data.featuredProjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Featured learner projects will appear here.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.featuredProjects.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/community/projects/${p.slug}`}
                  className="block rounded-xl border border-border bg-surface/40 p-4 transition-colors hover:border-primary/40"
                >
                  <p className="font-medium text-foreground">{p.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {p.descriptionPreview}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {p.likeCount} likes · {p.technologies.slice(0, 3).join(", ")}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-xl font-semibold">Categories</h2>
        <ul className="flex flex-wrap gap-2">
          {data.categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/community/discussions?category=${c.slug}`}
                className="inline-flex rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground"
              >
                {c.name}
                {typeof c.discussionCount === "number"
                  ? ` (${c.discussionCount})`
                  : ""}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 rounded-xl border border-border bg-surface/40 p-5">
        <h2 className="font-display text-xl font-semibold">Announcements</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Platform updates and community notices appear in discussions tagged
          announcements. Read the{" "}
          <Link href="/community/guidelines" className="text-primary hover:underline">
            community guidelines
          </Link>{" "}
          before posting.
        </p>
      </section>
    </div>
  )
}

function Section({
  title,
  href,
  empty,
  children,
}: {
  title: string
  href: string
  empty: string
  children: React.ReactNode
}) {
  const items = Array.isArray(children) ? children : [children]
  const has = items.filter(Boolean).length > 0
  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-4">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <Link href={href} className="text-sm text-primary hover:underline">
          View all
        </Link>
      </div>
      {has ? (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {children}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{empty}</p>
      )}
    </section>
  )
}

function ListRow({
  href,
  title,
  meta,
}: {
  href: string
  title: string
  meta: string
}) {
  return (
    <li>
      <Link
        href={href}
        className="block px-4 py-3 transition-colors hover:bg-hover"
      >
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{meta}</p>
      </Link>
    </li>
  )
}
