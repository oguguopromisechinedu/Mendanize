/**
 * Dashboard analytics API — MES-023 overview.
 */
import { handleApiError } from "@/lib/api/errors";
import { ok } from "@/lib/api/response";
import { requireEditor } from "@/features/authentication/server";
import { getAnalyticsOverview } from "@/services/analytics";

export async function GET() {
  try {
    const session = await requireEditor();
    if (!session) {
      return Response.json(
        {
          data: null,
          error: { code: "UNAUTHORIZED", message: "Staff required" },
          meta: {},
        },
        { status: 401 },
      );
    }
    return ok(await getAnalyticsOverview());
  } catch (error) {
    return handleApiError(error);
  }
}
