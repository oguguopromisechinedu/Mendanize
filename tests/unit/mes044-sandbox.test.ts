import { describe, expect, it } from "vitest"

import { runJavascriptInSandbox } from "@/services/code-execution/sandbox"

const limits = {
  timeoutMs: 1500,
  memoryLimitBytes: 8 * 1024 * 1024,
  maxStdoutBytes: 4096,
  maxStderrBytes: 2048,
}

describe("MES-044 QuickJS sandbox", () => {
  it("runs simple javascript and captures stdout", async () => {
    const result = await runJavascriptInSandbox(
      `console.log("ok"); console.log(2 + 2);`,
      limits,
    )
    expect(result.status).toBe("SUCCEEDED")
    expect(result.stdout).toContain("ok")
    expect(result.stdout).toContain("4")
    expect(result.exitCode).toBe(0)
  })

  it("interrupts infinite loops (timeout)", async () => {
    const result = await runJavascriptInSandbox(
      `while (true) {}`,
      { ...limits, timeoutMs: 400 },
    )
    expect(["TIMEOUT", "FAILED"]).toContain(result.status)
  }, 15_000)

  it("does not expose fetch on the guest global", async () => {
    const result = await runJavascriptInSandbox(
      `console.log(typeof fetch);`,
      limits,
    )
    expect(result.status).toBe("SUCCEEDED")
    expect(result.stdout.trim()).toContain("undefined")
  })
})
