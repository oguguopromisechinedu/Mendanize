/**
 * Dashboard learning API — MES-022 overview.
 */
import { handleApiError } from "@/lib/api/errors";
import { ok } from "@/lib/api/response";
import { requireUser } from "@/features/authentication/server";
import { getLearningDashboard } from "@/services/learning";

export async function GET() {
  try {
    const session = await requireUser();
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
    return ok(
      await getLearningDashboard({
        userId: session.user.id,
        userName: session.user.name,
      }),
    );
  } catch (error) {
    return handleApiError(error);
  }
}
