import { describe, expect, it } from "vitest"

import { rateLimit } from "@/lib/rate-limit"

describe("rateLimit (memory path)", () => {
  it("allows requests under the limit", async () => {
    const key = `test-allow-${Date.now()}-${Math.random()}`
    const first = await rateLimit(key, 3)
    expect(first.success).toBe(true)
    expect(first.remaining).toBe(2)
  })

  it("blocks when the limit is exceeded", async () => {
    const key = `test-block-${Date.now()}-${Math.random()}`
    await rateLimit(key, 2)
    await rateLimit(key, 2)
    const third = await rateLimit(key, 2)
    expect(third.success).toBe(false)
    expect(third.remaining).toBe(0)
  })
})
