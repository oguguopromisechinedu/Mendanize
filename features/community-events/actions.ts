"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import {
  getPublicSession,
  requireEditor,
} from "@/features/authentication/server"
import {
  cancelRsvp,
  rsvpToEvent,
  sendUpcomingEventReminders,
  upsertCommunityEvent,
} from "@/services/community-events"

type ActionResult<T = undefined> = {
  ok: boolean
  message: string
  data?: T
}

function revalidateEvents(slug?: string) {
  revalidatePath("/community")
  revalidatePath("/community/events")
  revalidatePath("/dashboard/community/events")
  if (slug) revalidatePath(`/community/events/${slug}`)
}

export async function rsvpEventAction(eventId: string): Promise<ActionResult> {
  const session = await getPublicSession()
  if (!session?.user?.id) {
    return { ok: false, message: "Sign in to RSVP" }
  }
  try {
    const event = await rsvpToEvent({
      eventId,
      publicUserId: session.user.id,
    })
    revalidateEvents(event?.slug)
    return { ok: true, message: "RSVP confirmed" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function cancelRsvpAction(eventId: string): Promise<ActionResult> {
  const session = await getPublicSession()
  if (!session?.user?.id) {
    return { ok: false, message: "Sign in required" }
  }
  try {
    await cancelRsvp({ eventId, publicUserId: session.user.id })
    revalidateEvents()
    return { ok: true, message: "RSVP cancelled" }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function upsertEventAction(
  input: unknown,
): Promise<ActionResult<{ id: string; slug: string }>> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  const parsed = z
    .object({
      id: z.string().optional(),
      title: z.string().min(1).max(200),
      slug: z.string().optional(),
      description: z.string().min(1).max(20_000),
      coverImageUrl: z.string().optional().nullable(),
      startsAt: z.string().min(1),
      endsAt: z.string().min(1),
      timezone: z.string().optional(),
      locationType: z.enum(["ONLINE", "IN_PERSON", "HYBRID"]).optional(),
      locationLabel: z.string().optional().nullable(),
      joinUrl: z.string().optional().nullable(),
      capacity: z.number().int().positive().optional().nullable(),
      status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED"]).optional(),
      challengeId: z.string().optional().nullable(),
    })
    .safeParse(input)
  if (!parsed.success) return { ok: false, message: "Validation failed" }
  try {
    const row = await upsertCommunityEvent({
      ...parsed.data,
      adminId: session.admin.id,
    })
    revalidateEvents(row.slug)
    return {
      ok: true,
      message: "Event saved",
      data: { id: row.id, slug: row.slug },
    }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}

export async function sendEventRemindersAction(): Promise<ActionResult> {
  const session = await requireEditor()
  if (!session) return { ok: false, message: "Unauthorized" }
  try {
    const { reminded } = await sendUpcomingEventReminders()
    return { ok: true, message: `Sent ${reminded} reminder(s)` }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Failed" }
  }
}
