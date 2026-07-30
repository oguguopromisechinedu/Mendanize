/**
 * MES-049 Recommendations ML Upgrade — unit tests.
 * Confirms facade-only approach: all consumers still import MES-018.
 */

import { describe, it, expect } from "vitest";

describe("MES-049 Recommendations ML", () => {
  it("exports getRecommendations from MES-018 index (facade unchanged)", async () => {
    const mod = await import("@/services/recommendations");
    expect(typeof mod.getRecommendations).toBe("function");
    expect(typeof mod.getRelated).toBe("function");
    expect(typeof mod.getRecommendedForUser).toBe("function");
  });

  it("exports ML model management from MES-018 index", async () => {
    const mod = await import("@/services/recommendations");
    expect(typeof mod.listRecommendationModels).toBe("function");
    expect(typeof mod.upsertRecommendationModel).toBe("function");
    expect(typeof mod.disableRecommendationModel).toBe("function");
    expect(typeof mod.getRecommendationQualityMetrics).toBe("function");
    expect(typeof mod.recordRecommendationClick).toBe("function");
  });

  it("ML scoring falls back gracefully when no model is configured", async () => {
    // scoreWithModel returns null on missing endpoint — rules remain authoritative
    const { scoreWithModel } = await import("@/services/recommendations/ml-scoring");
    const result = await scoreWithModel(
      {
        id: "test",
        name: "test",
        description: null,
        status: "DEFAULT",
        endpoint: null,
        rolloutPercent: 100,
        configJson: null,
      },
      {
        contextType: "trending",
        candidates: [
          { entityType: "article", entityId: "a1", title: "Test", slug: "test", href: "/test" },
        ],
      },
    );
    expect(result).toBeNull();
  });
});
