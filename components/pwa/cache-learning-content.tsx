"use client";

import { useEffect } from "react";
import { saveOfflineLearningContent } from "@/lib/pwa/offline-storage";

/**
 * Caches learning content HTML to IndexedDB when the user views it.
 * Enables offline re-reading via /account/offline.
 */
export function CacheLearningContent({
  kind,
  title,
  slug,
  lessonSlug,
  href,
  contentSelector = "[data-offline-content]",
}: {
  kind: "article" | "guide_lesson";
  title: string;
  slug: string;
  lessonSlug?: string;
  href: string;
  /** CSS selector for the main content element to snapshot. */
  contentSelector?: string;
}) {
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.onLine) return;

    const timer = window.setTimeout(() => {
      const el = document.querySelector(contentSelector);
      if (!el) return;
      const html = el.innerHTML;
      if (!html.trim()) return;

      saveOfflineLearningContent({
        kind,
        title,
        slug,
        lessonSlug,
        href,
        html,
      }).catch(() => {
        // Quota or privacy mode — non-fatal
      });
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [kind, title, slug, lessonSlug, href, contentSelector]);

  return null;
}
