"use server";

import { revalidatePath } from "next/cache";
import type { MenuLocationKey } from "@prisma/client";
import { requireEditor } from "@/features/authentication/server";
import {
  assignLocationMenu,
  createMenu,
  deleteMenu,
  saveLegalLinks,
  saveSocialLinks,
  updateMenu,
  updateNavigationSettings,
} from "@/services/navigation";
import type { MenuItemWrite } from "@/services/navigation/types";
import {
  assignLocationSchema,
  legalLinksSchema,
  menuUpdateSchema,
  settingsSchema,
  socialLinksSchema,
} from "../validators/schema";
import type { ActionResult } from "../types/types";

function revalidateNav() {
  revalidatePath("/dashboard/navigation");
  revalidatePath("/dashboard/navigation/main");
  revalidatePath("/dashboard/navigation/mobile");
  revalidatePath("/dashboard/navigation/footer");
  revalidatePath("/dashboard/navigation/quick-links");
  revalidatePath("/dashboard/navigation/utility");
  revalidatePath("/dashboard/navigation/legal");
  revalidatePath("/dashboard/navigation/social");
  revalidatePath("/dashboard/navigation/locations");
  revalidatePath("/dashboard/navigation/settings");
  revalidatePath("/", "layout");
}

export async function saveNavigationSettingsAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireEditor();
  if (!session) return { ok: false, message: "Unauthorized" };
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Validation failed" };
  await updateNavigationSettings(parsed.data);
  revalidateNav();
  return { ok: true, message: "Navigation settings saved" };
}

export async function saveMenuAction(
  menuId: string,
  input: unknown,
): Promise<ActionResult> {
  const session = await requireEditor();
  if (!session) return { ok: false, message: "Unauthorized" };
  const parsed = menuUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Validation failed" };
  try {
    await updateMenu(menuId, {
      ...parsed.data,
      items: parsed.data.items as MenuItemWrite[],
    });
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not save menu",
    };
  }
  revalidateNav();
  return { ok: true, message: "Menu saved" };
}

export async function createMenuAction(input: unknown): Promise<ActionResult> {
  const session = await requireEditor();
  if (!session) return { ok: false, message: "Unauthorized" };
  const parsed = menuUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Validation failed" };
  await createMenu({
    ...parsed.data,
    items: parsed.data.items as MenuItemWrite[],
  });
  revalidateNav();
  return { ok: true, message: "Menu created" };
}

export async function deleteMenuAction(menuId: string): Promise<ActionResult> {
  const session = await requireEditor();
  if (!session) return { ok: false, message: "Unauthorized" };
  try {
    await deleteMenu(menuId);
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not delete menu",
    };
  }
  revalidateNav();
  return { ok: true, message: "Menu deleted" };
}

export async function assignLocationAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireEditor();
  if (!session) return { ok: false, message: "Unauthorized" };
  const parsed = assignLocationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Validation failed" };
  await assignLocationMenu(
    parsed.data.key as MenuLocationKey,
    parsed.data.menuId,
  );
  revalidateNav();
  return { ok: true, message: "Location updated" };
}

export async function saveSocialLinksAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireEditor();
  if (!session) return { ok: false, message: "Unauthorized" };
  const parsed = socialLinksSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Validation failed" };
  await saveSocialLinks(parsed.data);
  revalidateNav();
  return { ok: true, message: "Social links saved" };
}

export async function saveLegalLinksAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireEditor();
  if (!session) return { ok: false, message: "Unauthorized" };
  const parsed = legalLinksSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Validation failed" };
  await saveLegalLinks(parsed.data);
  revalidateNav();
  return { ok: true, message: "Legal links saved" };
}
