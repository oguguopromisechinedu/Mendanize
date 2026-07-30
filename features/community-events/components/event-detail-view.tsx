"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

import { CommunityNav } from "@/features/community/components/community-nav"
import { Button } from "@/components/ui/button"
import type { CommunityEventDetail } from "@/services/community-events"
import { cancelRsvpAction, rsvpEventAction } from "../actions"

export function EventDetailView({
  event,
  signedIn,
}: {
  event: CommunityEventDetail
  signedIn: boolean
}) {
  const router = useRouter()
  const [pending, start] = useTransition()

  return (
    <div>
      <CommunityNav currentPath="/community/events" />
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 rounded-xl">
        <Link href="/community/events">← All events</Link>
      </Button>

      {event.coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.coverImageUrl}
          alt=""
          className="mb-6 max-h-64 w-full rounded-2xl object-cover"
        />
      ) : null}

      <h1 className="font-display text-3xl font-bold tracking-tight">
        {event.title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {new Date(event.startsAt).toLocaleString()} –{" "}
        {new Date(event.endsAt).toLocaleString()} ({event.timezone})
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {event.locationType.replaceAll("_", " ")}
        {event.locationLabel ? ` · ${event.locationLabel}` : ""}
        {event.capacity != null
          ? ` · ${event.rsvpCount}/${event.capacity} spots`
          : ` · ${event.rsvpCount} RSVPs`}
      </p>

      <div className="prose prose-sm mt-6 max-w-none dark:prose-invert whitespace-pre-wrap">
        {event.description}
      </div>

      {event.challenge ? (
        <p className="mt-4 text-sm">
          Linked challenge:{" "}
          <Link
            href={`/account/career`}
            className="text-primary underline"
          >
            {event.challenge.title}
          </Link>
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        {event.joinUrl ? (
          <Button asChild className="rounded-xl">
            <a href={event.joinUrl} target="_blank" rel="noreferrer">
              Join / details
            </a>
          </Button>
        ) : null}
        {signedIn ? (
          event.rsvpd ? (
            <Button
              variant="outline"
              className="rounded-xl"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const res = await cancelRsvpAction(event.id)
                  if (!res.ok) toast.error(res.message)
                  else {
                    toast.success(res.message)
                    router.refresh()
                  }
                })
              }
            >
              Cancel RSVP
            </Button>
          ) : (
            <Button
              className="rounded-xl"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const res = await rsvpEventAction(event.id)
                  if (!res.ok) toast.error(res.message)
                  else {
                    toast.success(res.message)
                    router.refresh()
                  }
                })
              }
            >
              RSVP
            </Button>
          )
        ) : (
          <Button asChild variant="outline" className="rounded-xl">
            <Link
              href={`/sign-in?callbackUrl=${encodeURIComponent(`/community/events/${event.slug}`)}`}
            >
              Sign in to RSVP
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
