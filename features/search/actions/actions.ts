"use server";

import { revalidatePath } from "next/cache";
import { requireEditor } from "@/features/authentication/server";
import {
  setSearchFilterEnabled,
  updateSearchConfiguration,
} from "@/services/search";
import {
  searchFilterToggleSchema,
  searchSettingsSchema,
} from "../validators/schema";
import type { ActionResult } from "../types/types";

function revalidateSearch() {
  revalidatePath("/dashboard/search-settings");
  revalidatePath("/search");
  revalidatePath("/", "layout");
}

export async function saveSearchSettingsAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireEditor();
  if (!session) return { ok: false, message: "Unauthorized" };
  const parsed = searchSettingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Validation failed" };
  try {
    await updateSearchConfiguration(parsed.data);
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not save settings",
    };
  }
  revalidateSearch();
  return { ok: true, message: "Search settings saved" };
}

export async function toggleSearchFilterAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireEditor();
  if (!session) return { ok: false, message: "Unauthorized" };
  const parsed = searchFilterToggleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Validation failed" };
  try {
    await setSearchFilterEnabled(parsed.data.key, parsed.data.enabled);
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not update filter",
    };
  }
  revalidateSearch();
  return { ok: true, message: "Filter updated" };
}
