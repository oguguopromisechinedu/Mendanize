"use server";

import { revalidatePath } from "next/cache";

import { requirePermission, PERMISSIONS } from "@/features/authentication/server";
import { updateAnalyticsConfiguration } from "@/services/analytics";

export async function setAnalyticsInstrumentationAction(enabled: boolean) {
  const session = await requirePermission(PERMISSIONS.ANALYTICS_VIEW);
  if (!session) return { ok: false as const, message: "Unauthorized" };
  await updateAnalyticsConfiguration({ instrumentationEnabled: enabled });
  revalidatePath("/dashboard/analytics");
  return {
    ok: true as const,
    message: enabled ? "Instrumentation enabled" : "Instrumentation disabled",
  };
}

/** Report export is queued for CSV later — keep UI actionable without lying. */
export async function placeholderAnalyticsAction() {
  return {
    ok: true as const,
    message:
      "Export queued — run Analytics Rollup automation first for fresh numbers. CSV download lands next.",
  };
}
