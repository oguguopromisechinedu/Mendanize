/**
 * MES-044 — JavaScript sandbox via QuickJS WASM.
 *
 * Threat mitigations:
 * - Host FS escape: guest has no host FS APIs (WASM heap only)
 * - Network/SSRF: no fetch/XMLHttpRequest/net modules injected
 * - CPU/time: interrupt handler deadline
 * - Memory: runtime.setMemoryLimit
 * - Cross-tenant: ephemeral runtime disposed after each run; no shared state
 */
import "server-only"

import {
  getQuickJS,
  shouldInterruptAfterDeadline,
  type QuickJSWASMModule,
} from "quickjs-emscripten"

export type SandboxLimits = {
  timeoutMs: number
  memoryLimitBytes: number
  maxStdoutBytes: number
  maxStderrBytes: number
}

export type SandboxResult = {
  status: "SUCCEEDED" | "FAILED" | "TIMEOUT"
  stdout: string
  stderr: string
  exitCode: number
  durationMs: number
  errorMessage?: string
}

let modulePromise: Promise<QuickJSWASMModule> | null = null

function getModule() {
  if (!modulePromise) modulePromise = getQuickJS()
  return modulePromise
}

function truncate(s: string, max: number) {
  if (s.length <= max) return s
  return `${s.slice(0, max)}\n…[truncated]`
}

/**
 * Execute a single JavaScript source string in an ephemeral QuickJS runtime.
 * Does not provide require/import/fetch/fs — guest cannot reach the host.
 */
export async function runJavascriptInSandbox(
  source: string,
  limits: SandboxLimits,
): Promise<SandboxResult> {
  const started = Date.now()
  const QuickJS = await getModule()
  const runtime = QuickJS.newRuntime()
  const stdoutParts: string[] = []
  const stderrParts: string[] = []
  let stdoutBytes = 0
  let stderrBytes = 0

  try {
    runtime.setMemoryLimit(limits.memoryLimitBytes)
    runtime.setMaxStackSize(1024 * 512)
    const deadline = Date.now() + limits.timeoutMs
    runtime.setInterruptHandler(shouldInterruptAfterDeadline(deadline))

    const vm = runtime.newContext()
    try {
      const consoleHandle = vm.newObject()
      const makeLog =
        (target: "out" | "err") =>
        (...args: unknown[]) => {
          const line =
            args
              .map((a) => {
                try {
                  return typeof a === "string" ? a : JSON.stringify(a)
                } catch {
                  return String(a)
                }
              })
              .join(" ") + "\n"
          if (target === "out") {
            if (stdoutBytes >= limits.maxStdoutBytes) return
            const slice = line.slice(0, limits.maxStdoutBytes - stdoutBytes)
            stdoutParts.push(slice)
            stdoutBytes += slice.length
          } else {
            if (stderrBytes >= limits.maxStderrBytes) return
            const slice = line.slice(0, limits.maxStderrBytes - stderrBytes)
            stderrParts.push(slice)
            stderrBytes += slice.length
          }
        }

      // Bridge console.log/warn/error into capped host buffers (no network).
      const logFn = vm.newFunction("log", (...handles) => {
        const values = handles.map((h) => vm.dump(h))
        makeLog("out")(...values)
      })
      const errFn = vm.newFunction("error", (...handles) => {
        const values = handles.map((h) => vm.dump(h))
        makeLog("err")(...values)
      })
      vm.setProp(consoleHandle, "log", logFn)
      vm.setProp(consoleHandle, "info", logFn)
      vm.setProp(consoleHandle, "warn", errFn)
      vm.setProp(consoleHandle, "error", errFn)
      vm.setProp(vm.global, "console", consoleHandle)
      logFn.dispose()
      errFn.dispose()
      consoleHandle.dispose()

      const wrapped = `(function(){\n${source}\n})();`
      const result = vm.evalCode(wrapped)
      if (result.error) {
        const errVal = vm.dump(result.error)
        result.error.dispose()
        const msg =
          typeof errVal === "object" && errVal && "message" in errVal
            ? String((errVal as { message: unknown }).message)
            : String(errVal)
        const timedOut = Date.now() >= deadline
        return {
          status: timedOut ? "TIMEOUT" : "FAILED",
          stdout: truncate(stdoutParts.join(""), limits.maxStdoutBytes),
          stderr: truncate(
            stderrParts.join("") + (timedOut ? "" : `${msg}\n`),
            limits.maxStderrBytes,
          ),
          exitCode: timedOut ? 124 : 1,
          durationMs: Date.now() - started,
          errorMessage: timedOut ? "Execution timed out" : msg,
        }
      }
      // Discard return value; learners use console.log for output.
      result.value.dispose()
      return {
        status: "SUCCEEDED",
        stdout: truncate(stdoutParts.join(""), limits.maxStdoutBytes),
        stderr: truncate(stderrParts.join(""), limits.maxStderrBytes),
        exitCode: 0,
        durationMs: Date.now() - started,
      }
    } finally {
      vm.dispose()
    }
  } catch (e) {
    const timedOut = Date.now() - started >= limits.timeoutMs
    const message = e instanceof Error ? e.message : "Sandbox failure"
    return {
      status: timedOut || /interrupted|timeout/i.test(message) ? "TIMEOUT" : "FAILED",
      stdout: truncate(stdoutParts.join(""), limits.maxStdoutBytes),
      stderr: truncate(stderrParts.join("") + `${message}\n`, limits.maxStderrBytes),
      exitCode: timedOut ? 124 : 1,
      durationMs: Date.now() - started,
      errorMessage: message,
    }
  } finally {
    runtime.dispose()
  }
}
