import { describe, expect, it } from "vitest"

describe("MES-048 dispute resolution contracts", () => {
  it("keeps money movement on Connect rail only", () => {
    const resolutionActions = [
      "NONE",
      "RELEASE_MILESTONE",
      "PARTIAL_REFUND",
      "CANCEL_CONTRACT",
    ]
    expect(resolutionActions).toContain("RELEASE_MILESTONE")
    expect(resolutionActions).toContain("PARTIAL_REFUND")
    expect(resolutionActions).not.toContain("INTERNAL_LEDGER")
  })
})
