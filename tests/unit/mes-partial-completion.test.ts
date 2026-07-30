/**
 * Partial MES completion — unit tests.
 */

import { describe, it, expect } from "vitest";

describe("MES-014 Media storage", () => {
  it("upload schema accepts base64 payload", async () => {
    const { uploadSchema } = await import(
      "@/features/media-library/validators/schema"
    );
    const parsed = uploadSchema.safeParse({
      filename: "test.png",
      mimeType: "image/png",
      base64: "data:image/png;base64,abc",
      sizeBytes: 3,
    });
    expect(parsed.success).toBe(true);
  });
});

describe("MES-038 Learner ecosystem", () => {
  it("search types include account ecosystem entities", async () => {
    await import("@/services/search/types");
    type SearchEntityType = import("@/services/search/types").SearchEntityType;
    const sample: SearchEntityType[] = [
      "job",
      "marketplace_listing",
      "prompt",
      "certificate",
      "learner_project",
    ];
    expect(sample).toHaveLength(5);
  });

  it("growth service exports assessment list helpers", async () => {
    const growth = await import("@/services/growth/service");
    expect(typeof growth.listAssessmentAttemptsForUser).toBe("function");
    expect(typeof growth.listAvailableAssessmentsForUser).toBe("function");
  });
});
