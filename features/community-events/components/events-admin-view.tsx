"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import {
  AdminPageHeader,
  StatusBadge,
} from "@/features/admin-dashboard"
import { Button } from "@/components/ui/button"
import type { CommunityEventSummary } from "@/services/community-events"
import { sendEventRemindersAction, upsertEventAction } from "../actions"

const field =
  "h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"

export function EventsAdminView({
  events,
}: {
  events: CommunityEventSummary[]
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")
  const [joinUrl, setJoinUrl] = useState("")
  const [locationType, setLocationType] = useState<
    "ONLINE" | "IN_PERSON" | "HYBRID"
  >("ONLINE")
  const [capacity, setCapacity] = useState("")
  const [timezone, setTimezone] = useState("UTC")

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <AdminPageHeader
        title="Community events"
        description="Publish workshops and AMAs. Moderators do not get dashboard access — Admin owns create/publish."
      />

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await sendEventRemindersAction()
              if (!res.ok) toast.error(res.message)
              else toast.success(res.message)
            })
          }
        >
          Send 24h reminders
        </Button>
        <Button asChild size="sm" variant="ghost">
          <Link href="/community/events">View public calendar</Link>
        </Button>
      </div>

      <section className="grid gap-3 rounded-xl border border-border p-4 md:grid-cols-2">
        <h2 className="md:col-span-2 text-lg font-semibold">Create event</h2>
        <input
          className={field}
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select
          className={field}
          value={locationType}
          onChange={(e) =>
            setLocationType(e.target.value as "ONLINE" | "IN_PERSON" | "HYBRID")
          }
        >
          <option value="ONLINE">Online</option>
          <option value="IN_PERSON">In person</option>
          <option value="HYBRID">Hybrid</option>
        </select>
        <input
          className={field}
          type="datetime-local"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
        />
        <input
          className={field}
          type="datetime-local"
          value={endsAt}
          onChange={(e) => setEndsAt(e.target.value)}
        />
        <input
          className={field}
          placeholder="Timezone (e.g. UTC, America/New_York)"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
        />
        <input
          className={field}
          placeholder="External join URL"
          value={joinUrl}
          onChange={(e) => setJoinUrl(e.target.value)}
        />
        <input
          className={field}
          placeholder="Capacity (optional)"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />
        <textarea
          className="min-h-[100px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm md:col-span-2"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex flex-wrap gap-2 md:col-span-2">
          <Button
            size="sm"
            disabled={pending || !title.trim() || !startsAt || !endsAt}
            onClick={() =>
              start(async () => {
                const res = await upsertEventAction({
                  title,
                  description: description || title,
                  startsAt: new Date(startsAt).toISOString(),
                  endsAt: new Date(endsAt).toISOString(),
                  timezone,
                  locationType,
                  joinUrl: joinUrl || null,
                  capacity: capacity ? Number(capacity) : null,
                  status: "DRAFT",
                })
                if (!res.ok) toast.error(res.message)
                else {
                  toast.success("Draft saved")
                  setTitle("")
                  setDescription("")
                  router.refresh()
                }
              })
            }
          >
            Save draft
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={pending || !title.trim() || !startsAt || !endsAt}
            onClick={() =>
              start(async () => {
                const res = await upsertEventAction({
                  title,
                  description: description || title,
                  startsAt: new Date(startsAt).toISOString(),
                  endsAt: new Date(endsAt).toISOString(),
                  timezone,
                  locationType,
                  joinUrl: joinUrl || null,
                  capacity: capacity ? Number(capacity) : null,
                  status: "PUBLISHED",
                })
                if (!res.ok) toast.error(res.message)
                else {
                  toast.success("Published")
                  setTitle("")
                  setDescription("")
                  router.refresh()
                }
              })
            }
          >
            Publish
          </Button>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">All events</h2>
        <ul className="divide-y divide-border rounded-xl border border-border">
          {events.map((e) => (
            <li
              key={e.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <div>
                <div className="font-medium">{e.title}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(e.startsAt).toLocaleString()} · {e.rsvpCount} RSVPs
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={e.status.toLowerCase()} />
                {e.status === "DRAFT" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() =>
                      start(async () => {
                        const res = await upsertEventAction({
                          id: e.id,
                          title: e.title,
                          description: e.description,
                          startsAt: e.startsAt,
                          endsAt: e.endsAt,
                          timezone: e.timezone,
                          locationType: e.locationType,
                          joinUrl: e.joinUrl,
                          capacity: e.capacity,
                          status: "PUBLISHED",
                        })
                        if (!res.ok) toast.error(res.message)
                        else {
                          toast.success("Published")
                          router.refresh()
                        }
                      })
                    }
                  >
                    Publish
                  </Button>
                ) : null}
                {e.status === "PUBLISHED" ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={pending}
                    onClick={() =>
                      start(async () => {
                        const res = await upsertEventAction({
                          id: e.id,
                          title: e.title,
                          description: e.description,
                          startsAt: e.startsAt,
                          endsAt: e.endsAt,
                          timezone: e.timezone,
                          locationType: e.locationType,
                          joinUrl: e.joinUrl,
                          capacity: e.capacity,
                          status: "CANCELLED",
                        })
                        if (!res.ok) toast.error(res.message)
                        else {
                          toast.success("Cancelled")
                          router.refresh()
                        }
                      })
                    }
                  >
                    Cancel
                  </Button>
                ) : null}
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/community/events/${e.slug}`}>View</Link>
                </Button>
              </div>
            </li>
          ))}
          {events.length === 0 ? (
            <li className="px-4 py-6 text-center text-muted-foreground">
              No events yet.
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  )
}
