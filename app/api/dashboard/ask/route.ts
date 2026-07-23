/**
 * Ask Tier 2 API — PublicUser gated (MES-019 / MES-030).
 */
import { handleApiError } from "@/lib/api/errors";
import { ok } from "@/lib/api/response";
import { requirePublicUser } from "@/features/authentication/server";
import { clientKeyFromRequest } from "@/lib/observability";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getAskDashboard } from "@/services/ai/ask";

export async function GET(req: Request) {
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
    await enforceRateLimit(
      `ask-dashboard:${session.user.id}:${clientKeyFromRequest(req, "ip")}`,
      40,
    );
    const url = new URL(req.url);
    const data = await getAskDashboard({
      userId: session.user.id,
      conversationId: url.searchParams.get("c"),
      handoffId: url.searchParams.get("handoff"),
    });
    return ok(data);
  } catch (error) {
    return handleApiError(error);
  }
}
