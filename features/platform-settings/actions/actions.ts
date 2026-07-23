"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/authentication/server";
import {
  setFeatureFlagEnabled,
  updateAiPlatformSettings,
  updateAuthenticationSettings,
  updateBrandingSettings,
  updateEmailSettings,
  updateGeneralSettings,
  updateLocalizationSettings,
  updateMaintenanceConfiguration,
  updateSearchPlatformSettings,
  updateSecuritySettings,
} from "@/services/settings";
import {
  aiSettingsSchema,
  authSettingsSchema,
  brandingSchema,
  emailSettingsSchema,
  featureFlagSchema,
  generalSchema,
  localizationSchema,
  maintenanceSchema,
  searchSettingsSchema,
  securitySettingsSchema,
} from "../validators/schema";
import type { ActionResult } from "../types/types";

function revalidateSettings() {
  for (const path of [
    "/dashboard/settings",
    "/dashboard/settings/general",
    "/dashboard/settings/branding",
    "/dashboard/settings/localization",
    "/dashboard/settings/authentication",
    "/dashboard/settings/ai",
    "/dashboard/settings/search",
    "/dashboard/settings/email",
    "/dashboard/settings/security",
    "/dashboard/settings/maintenance",
    "/dashboard/settings/feature-flags",
    "/dashboard/settings/backup",
    "/dashboard/settings/billing",
    "/dashboard/search-settings",
    "/ask",
    "/dashboard/ai-studio",
  ]) {
    revalidatePath(path);
  }
}

async function gate(): Promise<ActionResult | null> {
  const session = await requireAdmin();
  if (!session) return { ok: false, message: "Unauthorized" };
  return null;
}

export async function saveGeneralSettingsAction(
  input: unknown,
): Promise<ActionResult> {
  const denied = await gate();
  if (denied) return denied;
  const parsed = generalSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Validation failed" };
  await updateGeneralSettings(parsed.data);
  revalidateSettings();
  return { ok: true, message: "General settings saved" };
}

export async function saveBrandingSettingsAction(
  input: unknown,
): Promise<ActionResult> {
  const denied = await gate();
  if (denied) return denied;
  const parsed = brandingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Validation failed" };
  await updateBrandingSettings(parsed.data);
  revalidateSettings();
  return { ok: true, message: "Branding saved" };
}

export async function saveLocalizationSettingsAction(
  input: unknown,
): Promise<ActionResult> {
  const denied = await gate();
  if (denied) return denied;
  const parsed = localizationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Validation failed" };
  await updateLocalizationSettings(parsed.data);
  revalidateSettings();
  return { ok: true, message: "Localization saved" };
}

export async function saveAuthSettingsAction(
  input: unknown,
): Promise<ActionResult> {
  const denied = await gate();
  if (denied) return denied;
  const parsed = authSettingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Validation failed" };
  await updateAuthenticationSettings(parsed.data);
  revalidateSettings();
  return { ok: true, message: "Authentication settings saved" };
}

export async function saveAiSettingsAction(
  input: unknown,
): Promise<ActionResult> {
  const denied = await gate();
  if (denied) return denied;
  const parsed = aiSettingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Validation failed" };
  await updateAiPlatformSettings(parsed.data);
  revalidateSettings();
  return { ok: true, message: "AI settings saved" };
}

export async function saveSearchPlatformSettingsAction(
  input: unknown,
): Promise<ActionResult> {
  const denied = await gate();
  if (denied) return denied;
  const parsed = searchSettingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Validation failed" };
  await updateSearchPlatformSettings(parsed.data);
  revalidateSettings();
  return { ok: true, message: "Search settings saved" };
}

export async function saveEmailSettingsAction(
  input: unknown,
): Promise<ActionResult> {
  const denied = await gate();
  if (denied) return denied;
  const parsed = emailSettingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Validation failed" };
  await updateEmailSettings(parsed.data);
  revalidateSettings();
  return { ok: true, message: "Email settings saved" };
}

export async function saveSecuritySettingsAction(
  input: unknown,
): Promise<ActionResult> {
  const denied = await gate();
  if (denied) return denied;
  const parsed = securitySettingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Validation failed" };
  await updateSecuritySettings(parsed.data);
  revalidateSettings();
  return { ok: true, message: "Security settings saved" };
}

export async function saveMaintenanceAction(
  input: unknown,
): Promise<ActionResult> {
  const denied = await gate();
  if (denied) return denied;
  const parsed = maintenanceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Validation failed" };
  await updateMaintenanceConfiguration(parsed.data);
  revalidateSettings();
  return { ok: true, message: "Maintenance settings saved" };
}

export async function toggleFeatureFlagAction(
  input: unknown,
): Promise<ActionResult> {
  const denied = await gate();
  if (denied) return denied;
  const parsed = featureFlagSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Validation failed" };
  await setFeatureFlagEnabled(parsed.data.key, parsed.data.enabled);
  revalidateSettings();
  return { ok: true, message: "Feature flag updated" };
}
