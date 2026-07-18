/**
 * Dashboard settings API — MES-020 overview payload.
 */
import { handleApiError } from "@/lib/api/errors";
import { ok } from "@/lib/api/response";
import { requireAdmin } from "@/features/authentication/server";
import { getSettingsDashboard } from "@/services/settings";

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) {
      return Response.json(
        {
          data: null,
          error: { code: "UNAUTHORIZED", message: "Admin required" },
          meta: {},
        },
        { status: 401 },
      );
    }
    return ok(await getSettingsDashboard());
  } catch (error) {
    return handleApiError(error);
  }
}
