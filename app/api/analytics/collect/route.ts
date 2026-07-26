import { NextResponse } from "next/server";
import { z } from "zod";

import {
  captureAnalyticsEvent,
  getAnalyticsConfiguration,
} from "@/services/analytics";

const bodySchema = z.object({
  kind: z.enum([
    "PAGE_VIEW",
    "CONTENT_VIEW",
    "GUIDE_START",
    "TOOL_VIEW",
    "SEARCH_QUERY",
    "ASK_MESSAGE",
    "SESSION_START",
    "SESSION_END",
    "USER_SIGN_IN",
    "OTHER",
  ]),
  path: z.string().max(500).optional(),
  query: z.string().max(500).optional(),
  entityType: z.string().max(40).optional(),
  entityId: z.string().max(80).optional(),
  sessionKey: z.string().max(120).optional(),
});

export async function POST(req: Request) {
  try {
    const config = await getAnalyticsConfiguration();
    if (!config.instrumentationEnabled) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const json = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    await captureAnalyticsEvent({
      ...parsed.data,
      force: true,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
