/**
 * Admin notification center API — MES-024 / MES-030.
 * Staff use Admin sessions; learner prefs live under /account.
 */
import { handleApiError } from "@/lib/api/errors";
import { ok } from "@/lib/api/response";
import { requireEditor } from "@/features/authentication/server";
import { listNotificationsForAdmin } from "@/services/notification";

export async function GET() {
  try {
    const session = await requireEditor();
    if (!session?.admin?.id) {
      return Response.json(
        {
          data: null,
          error: { code: "UNAUTHORIZED", message: "Staff sign-in required" },
          meta: {},
        },
        { status: 401 },
      );
    }
    return ok(await listNotificationsForAdmin(session.admin.id));
  } catch (error) {
    return handleApiError(error);
  }
}
