"use server";

import { revalidatePath } from "next/cache";
import { requireUser, requireEditor } from "@/features/authentication/server";
import {
  markNotification,
  updateDeliverySettings,
  updateNotificationPreferences,
  upsertAnnouncement,
} from "@/services/notification";
import { AppError } from "@/lib/api/errors";
import {
  announcementSchema,
  deliverySchema,
  markSchema,
  preferencesSchema,
} from "../validators/schema";
import type { ActionResult } from "../types/types";
import { NOTIFICATIONS_NAV } from "../constants/constants";

function revalidateAll() {
  for (const item of NOTIFICATIONS_NAV) revalidatePath(item.href);
  revalidatePath("/learning/preferences");
}

export async function markNotificationAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireUser();
  if (!session?.user?.id) return { ok: false, message: "Sign in required" };
  const parsed = markSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid request" };
  try {
    await markNotification(
      session.user.id,
      parsed.data.id,
      parsed.data.action,
    );
    revalidateAll();
    return { ok: true, message: "Updated" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof AppError ? err.message : "Update failed",
    };
  }
}

export async function saveNotificationPreferencesAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireUser();
  if (!session?.user?.id) return { ok: false, message: "Sign in required" };
  const parsed = preferencesSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid preferences" };
  try {
    await updateNotificationPreferences(session.user.id, parsed.data);
    revalidateAll();
    return { ok: true, message: "Preferences saved" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof AppError ? err.message : "Save failed",
    };
  }
}

export async function saveDeliverySettingsAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireEditor();
  if (!session) return { ok: false, message: "Staff required" };
  const parsed = deliverySchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid delivery settings" };
  try {
    await updateDeliverySettings(parsed.data);
    revalidateAll();
    return { ok: true, message: "Delivery settings saved" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof AppError ? err.message : "Save failed",
    };
  }
}

export async function saveAnnouncementAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireEditor();
  if (!session) return { ok: false, message: "Staff required" };
  const parsed = announcementSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid announcement" };
  try {
    await upsertAnnouncement(parsed.data);
    revalidateAll();
    return { ok: true, message: "Announcement saved" };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof AppError ? err.message : "Save failed",
    };
  }
}
