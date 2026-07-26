"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const SESSION_KEY = "mz_analytics_session";

function getSessionKey() {
  try {
    let key = sessionStorage.getItem(SESSION_KEY);
    if (!key) {
      key = `s_${Math.random().toString(36).slice(2)}_${Date.now()}`;
      sessionStorage.setItem(SESSION_KEY, key);
      void fetch("/api/analytics/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "SESSION_START", sessionKey: key }),
        keepalive: true,
      });
    }
    return key;
  } catch {
    return undefined;
  }
}

/** Client page-view beacon — no-ops server-side when instrumentation is off. */
export function AnalyticsBeacon() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    const qs = searchParams?.toString();
    const full = qs ? `${pathname}?${qs}` : pathname;
    if (lastPath.current === full) return;
    lastPath.current = full;

    const sessionKey = getSessionKey();
    void fetch("/api/analytics/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "PAGE_VIEW",
        path: pathname,
        query: qs || undefined,
        sessionKey,
      }),
      keepalive: true,
    });
  }, [pathname, searchParams]);

  return null;
}
