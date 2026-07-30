import Link from "next/link"

import { CommunityNav } from "@/features/community/components/community-nav"
import type { CommunityEventSummary } from "@/services/community-events"

function formatWhen(iso: string, tz: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: tz === "UTC" ? undefined : tz,
    }).format(new Date(iso))
  } catch {
    return new Date(iso).toLocaleString()
  }
}

export function EventsListView({
  events,
}: {
  events: CommunityEventSummary[]
}) {
  return (
    <div>
      <CommunityNav currentPath="/community/events" />
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Learning events
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Workshops, AMAs, and challenge kickoffs. Join links are external —
          Mendanize does not stream video here.
        </p>
      </div>
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">No upcoming events yet.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((e) => (
            <li key={e.id}>
              <Link
                href={`/community/events/${e.slug}`}
                className="block rounded-2xl border border-border bg-card/80 px-5 py-4 transition hover:border-primary/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-foreground">{e.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatWhen(e.startsAt, e.timezone)} ·{" "}
                      {e.locationType.replaceAll("_", " ")}
                      {e.locationLabel ? ` · ${e.locationLabel}` : ""}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {e.rsvpCount} RSVP{e.rsvpCount === 1 ? "" : "s"}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
