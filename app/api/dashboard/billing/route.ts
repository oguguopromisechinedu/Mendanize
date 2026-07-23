/**
 * PublicUser billing API — MES-021 / MES-030.
 * Kept under /api/dashboard/billing for compatibility; gated by PublicUser session.
 */
import { handleApiError } from "@/lib/api/errors";
import { ok } from "@/lib/api/response";
import { requirePublicUser } from "@/features/authentication/server";
import { getBillingDashboard } from "@/services/billing";

export async function GET() {
  try {
    const session = await requirePublicUser();
    if (!session?.user?.id) {
      return Response.json(
        {
          data: null,
          error: { code: "UNAUTHORIZED", message: "Sign in required" },
          meta: {},
        },
        { status: 401 },
      );
    }
    return ok(await getBillingDashboard(session.user.id));
  } catch (error) {
    return handleApiError(error);
  }
}
