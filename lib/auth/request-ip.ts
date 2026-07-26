/** Best-effort client IP from Next request headers. */

import { headers } from "next/headers";

export async function getRequestIpAddress(): Promise<string | null> {
  try {
    const h = await headers();
    const forwarded = h.get("x-forwarded-for");
    if (forwarded) {
      const first = forwarded.split(",")[0]?.trim();
      if (first) return first;
    }
    return h.get("x-real-ip")?.trim() || null;
  } catch {
    return null;
  }
}
