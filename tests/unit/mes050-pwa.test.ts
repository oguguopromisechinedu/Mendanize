/**
 * MES-050 PWA — unit tests.
 */

import { describe, it, expect } from "vitest";
import {
  PWA_EXCLUDED_PREFIXES,
  PWA_LEARNING_PATH_PATTERNS,
  PWA_MAX_OFFLINE_ITEMS,
} from "@/lib/pwa/constants";
import { isLearningPath } from "@/lib/pwa/offline-storage";

describe("MES-050 PWA", () => {
  it("excludes admin dashboard from PWA caching", () => {
    expect(PWA_EXCLUDED_PREFIXES).toContain("/dashboard");
    expect(PWA_EXCLUDED_PREFIXES).toContain("/api/auth");
  });

  it("recognizes learning paths for offline cache", () => {
    expect(isLearningPath("/articles/my-article")).toBe(true);
    expect(isLearningPath("/guides/react-basics/lessons/intro")).toBe(true);
    expect(isLearningPath("/account/articles/my-article")).toBe(true);
    expect(isLearningPath("/account/guides/react-basics/lessons/intro")).toBe(true);
    expect(isLearningPath("/dashboard/articles/123")).toBe(false);
    expect(isLearningPath("/")).toBe(false);
  });

  it("learning path patterns match spec routes", () => {
    for (const path of [
      "/articles/test-slug",
      "/guides/guide-slug/lessons/lesson-slug",
    ]) {
      expect(PWA_LEARNING_PATH_PATTERNS.some((re) => re.test(path))).toBe(true);
    }
  });

  it("caps offline items at quota limit", () => {
    expect(PWA_MAX_OFFLINE_ITEMS).toBeGreaterThan(0);
    expect(PWA_MAX_OFFLINE_ITEMS).toBeLessThanOrEqual(50);
  });

  it("manifest is defined via app/manifest.ts convention", async () => {
    const manifest = (await import("@/app/manifest")).default;
    const m = manifest();
    expect(m.name).toBe("Mendanize");
    expect(m.start_url).toBe("/account");
    expect(m.display).toBe("standalone");
    expect(m.icons?.length).toBeGreaterThan(0);
  });
});
