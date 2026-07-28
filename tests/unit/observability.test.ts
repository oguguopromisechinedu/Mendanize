import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/db/prisma", () => ({
  isDatabaseConfigured: () => false,
  getPrisma: () => {
    throw new Error("getPrisma should not be called when DB is not configured")
  },
}))

describe("getHealthSnapshot", () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it("returns ok status with uptime and timestamp", async () => {
    const { getHealthSnapshot } = await import("@/lib/observability")
    const snap = await getHealthSnapshot()
    expect(["ok", "degraded"]).toContain(snap.status)
    expect(snap.service).toBe("mendanize")
    expect(typeof snap.uptimeSec).toBe("number")
    expect(snap.timestamp).toMatch(/^\d{4}-/)
    expect(typeof snap.jobQueueDepth).toBe("number")
    expect(snap.database).toBe("skipped")
  })
})
