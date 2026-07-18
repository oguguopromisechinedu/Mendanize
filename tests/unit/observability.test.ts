import { describe, expect, it } from "vitest"

import { getHealthSnapshot } from "@/lib/observability"

describe("getHealthSnapshot", () => {
  it("returns ok status with uptime and timestamp", () => {
    const snap = getHealthSnapshot()
    expect(snap.status).toBe("ok")
    expect(snap.service).toBe("mendanize")
    expect(typeof snap.uptimeSec).toBe("number")
    expect(snap.timestamp).toMatch(/^\d{4}-/)
  })
})
