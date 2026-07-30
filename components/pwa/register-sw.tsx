"use client";

import { useEffect } from "react";

/**
 * Registers the service worker on learner/public surfaces only.
 * Must NOT be mounted under /dashboard/*.
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (window.location.pathname.startsWith("/dashboard")) return;

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // SW registration failure is non-fatal; app works without PWA
    });
  }, []);

  return null;
}
