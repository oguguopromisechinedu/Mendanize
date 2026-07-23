import { describe, expect, it } from "vitest"

import { getHealthSnapshot } from "@/lib/observability"

describe("getHealthSnapshot", () => {
  it("returns ok status with uptime and timestamp", async () => {
    const snap = await getHealthSnapshot()
    expect(["ok", "degraded"]).toContain(snap.status)
    expect(snap.service).toBe("mendanize")
    expect(typeof snap.uptimeSec).toBe("number")
    expect(snap.timestamp).toMatch(/^\d{4}-/)
    expect(typeof snap.jobQueueDepth).toBe("number")
  })
})
