/**
 * MES-045 Community Events & Learning Calendar
 */
import "server-only"

import {
  assertDatabaseForProductionWrites,
  getPrisma,
  isDatabaseConfigured,
} from "@/lib/db/prisma"
import { recordAudit } from "@/services/admin/audit"

export type CommunityEventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED"
export type CommunityEventLocationType = "ONLINE" | "IN_PERSON" | "HYBRID"

export type CommunityEventSummary = {
  id: string
  title: string
  slug: string
  description: string
  coverImageUrl: string | null
  startsAt: string
  endsAt: string
  timezone: string
  locationType: CommunityEventLocationType
  locationLabel: string | null
  joinUrl: string | null
  capacity: number | null
  status: CommunityEventStatus
  rsvpCount: number
  challengeId: string | null
}

export type CommunityEventDetail = CommunityEventSummary & {
  rsvpd: boolean
  challenge: { id: string; title: string; slug: string } | null
}

function db() {
  return getPrisma()
}

function slugify(input: string) {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || `event-${Date.now()}`
  )
}

function mapSummary(row: {
  id: string
  title: string
  slug: string
  description: string
  coverImageUrl: string | null
  startsAt: Date
  endsAt: Date
  timezone: string
  locationType: CommunityEventLocationType
  locationLabel: string | null
  joinUrl: string | null
  capacity: number | null
  status: CommunityEventStatus
  challengeId: string | null
  _count?: { rsvps: number }
}): CommunityEventSummary {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    coverImageUrl: row.coverImageUrl,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    timezone: row.timezone,
    locationType: row.locationType,
    locationLabel: row.locationLabel,
    joinUrl: row.joinUrl,
    capacity: row.capacity,
    status: row.status,
    rsvpCount: row._count?.rsvps ?? 0,
    challengeId: row.challengeId,
  }
}

export async function listPublishedEvents(params?: {
  from?: Date
  take?: number
}): Promise<CommunityEventSummary[]> {
  if (!isDatabaseConfigured()) return []
  const from = params?.from ?? new Date()
  const rows = await db().communityEvent.findMany({
    where: {
      status: "PUBLISHED",
      endsAt: { gte: from },
    },
    orderBy: { startsAt: "asc" },
    take: params?.take ?? 50,
    include: { _count: { select: { rsvps: true } } },
  })
  return rows.map(mapSummary)
}

export async function listEventsAdmin(status?: CommunityEventStatus) {
  if (!isDatabaseConfigured()) return []
  const rows = await db().communityEvent.findMany({
    where: status ? { status } : undefined,
    orderBy: { startsAt: "desc" },
    take: 100,
    include: { _count: { select: { rsvps: true } } },
  })
  return rows.map(mapSummary)
}

export async function getEventBySlug(
  slug: string,
  publicUserId?: string | null,
): Promise<CommunityEventDetail | null> {
  if (!isDatabaseConfigured()) return null
  const row = await db().communityEvent.findUnique({
    where: { slug },
    include: {
      _count: { select: { rsvps: true } },
      challenge: { select: { id: true, title: true, slug: true } },
    },
  })
  if (!row) return null
  if (row.status !== "PUBLISHED" && !publicUserId) {
    // draft/cancelled not public without admin — learners only see published
  }
  let rsvpd = false
  if (publicUserId && row.status === "PUBLISHED") {
    const r = await db().eventRsvp.findUnique({
      where: {
        eventId_publicUserId: { eventId: row.id, publicUserId },
      },
    })
    rsvpd = Boolean(r)
  }
  return {
    ...mapSummary(row),
    rsvpd,
    challenge: row.challenge,
  }
}

export async function getPublishedEventBySlug(
  slug: string,
  publicUserId?: string | null,
) {
  const event = await getEventBySlug(slug, publicUserId)
  if (!event || event.status !== "PUBLISHED") return null
  return event
}

export async function upsertCommunityEvent(input: {
  id?: string
  title: string
  slug?: string
  description: string
  coverImageUrl?: string | null
  startsAt: string
  endsAt: string
  timezone?: string
  locationType?: CommunityEventLocationType
  locationLabel?: string | null
  joinUrl?: string | null
  capacity?: number | null
  status?: CommunityEventStatus
  challengeId?: string | null
  adminId?: string | null
}) {
  assertDatabaseForProductionWrites("services/community-events")
  const title = input.title.trim()
  if (!title) throw new Error("Title required")
  const startsAt = new Date(input.startsAt)
  const endsAt = new Date(input.endsAt)
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    throw new Error("Invalid start/end")
  }
  if (endsAt <= startsAt) throw new Error("End must be after start")

  let slug = (input.slug?.trim() || slugify(title)).toLowerCase()
  const status = input.status ?? "DRAFT"
  const data = {
    title,
    slug,
    description: input.description.trim() || title,
    coverImageUrl: input.coverImageUrl?.trim() || null,
    startsAt,
    endsAt,
    timezone: input.timezone?.trim() || "UTC",
    locationType: input.locationType ?? "ONLINE",
    locationLabel: input.locationLabel?.trim() || null,
    joinUrl: input.joinUrl?.trim() || null,
    capacity: input.capacity ?? null,
    status,
    challengeId: input.challengeId || null,
    publishedAt: status === "PUBLISHED" ? new Date() : null,
    createdByAdminId: input.adminId ?? null,
  }

  if (input.id) {
    const existing = await db().communityEvent.findUnique({
      where: { id: input.id },
    })
    if (!existing) throw new Error("Event not found")
    if (slug !== existing.slug) {
      const clash = await db().communityEvent.findUnique({ where: { slug } })
      if (clash) slug = `${slug}-${Date.now().toString(36)}`
      data.slug = slug
    }
    const row = await db().communityEvent.update({
      where: { id: input.id },
      data: {
        ...data,
        publishedAt:
          status === "PUBLISHED"
            ? existing.publishedAt ?? new Date()
            : existing.publishedAt,
        createdByAdminId: existing.createdByAdminId ?? input.adminId ?? null,
      },
      include: { _count: { select: { rsvps: true } } },
    })
    await recordAudit({
      actorId: input.adminId,
      action: "update",
      entityType: "community_event",
      entityId: row.id,
      summary: `Updated event “${row.title}” (${row.status})`,
    })
    return mapSummary(row)
  }

  const clash = await db().communityEvent.findUnique({ where: { slug } })
  if (clash) slug = `${slug}-${Date.now().toString(36)}`
  data.slug = slug

  const row = await db().communityEvent.create({
    data,
    include: { _count: { select: { rsvps: true } } },
  })
  await recordAudit({
    actorId: input.adminId,
    action: "create",
    entityType: "community_event",
    entityId: row.id,
    summary: `Created event “${row.title}”`,
  })
  return mapSummary(row)
}

export async function rsvpToEvent(input: {
  eventId: string
  publicUserId: string
}) {
  assertDatabaseForProductionWrites("services/community-events")
  const event = await db().communityEvent.findUnique({
    where: { id: input.eventId },
    include: { _count: { select: { rsvps: true } } },
  })
  if (!event || event.status !== "PUBLISHED") {
    throw new Error("Event not available")
  }
  if (event.endsAt < new Date()) throw new Error("Event has ended")
  if (event.capacity != null && event._count.rsvps >= event.capacity) {
    throw new Error("Event is at capacity")
  }

  await db().eventRsvp.upsert({
    where: {
      eventId_publicUserId: {
        eventId: input.eventId,
        publicUserId: input.publicUserId,
      },
    },
    create: {
      eventId: input.eventId,
      publicUserId: input.publicUserId,
    },
    update: {},
  })

  // In-app confirmation (MES-024 prefs respected inside dispatch)
  try {
    const { dispatch } = await import("@/services/notification")
    await dispatch({
      userId: input.publicUserId,
      channel: "in_app",
      template: "system.info",
      type: "ANNOUNCEMENT",
      title: "RSVP confirmed",
      body: `You’re going to ${event.title}`,
      link: `/community/events/${event.slug}`,
      payload: { eventId: event.id },
    })
  } catch {
    // non-fatal
  }

  return getPublishedEventBySlug(event.slug, input.publicUserId)
}

export async function cancelRsvp(input: {
  eventId: string
  publicUserId: string
}) {
  assertDatabaseForProductionWrites("services/community-events")
  await db().eventRsvp.deleteMany({
    where: { eventId: input.eventId, publicUserId: input.publicUserId },
  })
}

export async function listEventRsvps(eventId: string) {
  if (!isDatabaseConfigured()) return []
  const rows = await db().eventRsvp.findMany({
    where: { eventId },
    include: {
      publicUser: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  })
  return rows.map((r) => ({
    id: r.id,
    createdAt: r.createdAt.toISOString(),
    remindedAt: r.remindedAt?.toISOString() ?? null,
    user: r.publicUser,
  }))
}

/** Remind RSVPs for published events starting within the next 24 hours. */
export async function sendUpcomingEventReminders() {
  assertDatabaseForProductionWrites("services/community-events")
  if (!isDatabaseConfigured()) return { reminded: 0 }
  const now = new Date()
  const windowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const events = await db().communityEvent.findMany({
    where: {
      status: "PUBLISHED",
      startsAt: { gt: now, lte: windowEnd },
    },
    include: {
      rsvps: {
        where: { remindedAt: null },
        include: {
          publicUser: { select: { id: true, email: true } },
        },
      },
    },
  })

  const { dispatch } = await import("@/services/notification")
  let reminded = 0
  for (const event of events) {
    for (const rsvp of event.rsvps) {
      try {
        await dispatch({
          userId: rsvp.publicUserId,
          channel: "in_app",
          template: "system.info",
          type: "ANNOUNCEMENT",
          title: "Event reminder",
          body: `${event.title} starts soon (${event.timezone})`,
          link: `/community/events/${event.slug}`,
          payload: { eventId: event.id },
        })
        // Optional email — respects prefs via marketing/announcement gates
        if (rsvp.publicUser.email) {
          await dispatch({
            userId: rsvp.publicUserId,
            email: rsvp.publicUser.email,
            channel: "email",
            template: "generic_notification",
            title: `Reminder: ${event.title}`,
            body: `Your RSVP’d event starts soon. Details: /community/events/${event.slug}`,
            payload: {
              title: `Reminder: ${event.title}`,
              body: `Starts ${event.startsAt.toISOString()} (${event.timezone})`,
            },
          }).catch(() => undefined)
        }
        await db().eventRsvp.update({
          where: { id: rsvp.id },
          data: { remindedAt: new Date() },
        })
        reminded += 1
      } catch {
        // continue
      }
    }
  }
  return { reminded }
}

export async function searchPublishedEvents(query: string) {
  if (!isDatabaseConfigured() || !query.trim()) return []
  const q = query.trim()
  const rows = await db().communityEvent.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { locationLabel: { contains: q, mode: "insensitive" } },
      ],
    },
    take: 8,
    orderBy: { startsAt: "asc" },
  })
  return rows.map((e) => ({
    type: "event" as const,
    id: e.id,
    title: e.title,
    href: `/community/events/${e.slug}`,
    excerpt: e.description.slice(0, 140),
  }))
}
