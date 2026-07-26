/**
 * Dashboard settings API — MES-020 overview payload.
 */
import { handleApiError } from "@/lib/api/errors";
import { ok, unauthorized } from "@/lib/api/response";
import {
  PERMISSIONS,
  requirePermission,
} from "@/features/authentication/server";
import { getSettingsDashboard } from "@/services/settings";

export async function GET() {
  try {
    const session = await requirePermission(PERMISSIONS.SETTINGS_MANAGE);
    if (!session) {
      return unauthorized("Permission required: settings.manage");
    }
    return ok(await getSettingsDashboard());
  } catch (error) {
    return handleApiError(error);
  }
}
