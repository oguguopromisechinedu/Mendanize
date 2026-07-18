/**
 * Dashboard notifications API — MES-024 center payload.
 */
import { handleApiError } from "@/lib/api/errors";
import { ok } from "@/lib/api/response";
import { requireUser } from "@/features/authentication/server";
import { listForUser, getNotificationsDashboard } from "@/services/notification";

export async function GET(request: Request) {
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
    const url = new URL(request.url);
    if (url.searchParams.get("view") === "dashboard") {
      return ok(await getNotificationsDashboard(session.user.id));
    }
    return ok(
      await listForUser(session.user.id, {
        query: url.searchParams.get("q") ?? undefined,
        page: Number(url.searchParams.get("page") ?? 1),
      }),
    );
  } catch (error) {
    return handleApiError(error);
  }
}
