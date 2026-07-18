/**
 * Public Ask Mendanize API — Tier 1 (MES-019).
 */
import { handleApiError } from "@/lib/api/errors";
import { ok } from "@/lib/api/response";
import { clientKeyFromRequest } from "@/lib/observability";
import { enforceRateLimit } from "@/lib/rate-limit";
import { askTier1 } from "@/services/ai/ask";
import { tier1AskSchema } from "@/features/ask-mendanize/validators/schema";

export async function POST(req: Request) {
  try {
    await enforceRateLimit(clientKeyFromRequest(req, "ask-public"), 20);
    const body = await req.json();
    const parsed = tier1AskSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        {
          data: null,
          error: { code: "VALIDATION_ERROR", message: "Invalid ask payload" },
          meta: {},
        },
        { status: 400 },
      );
    }
    const data = await askTier1({
      ...parsed.data,
      // Public API is always learner-facing — never admin CMS surface.
      surface: "public",
    });
    return ok(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  return ok({
    tier: 1,
    message: "POST a question with page context for ephemeral Ask replies.",
  });
}
