/**
 * Post-deploy / local smoke checks (MES-029).
 * Usage: NEXT_PUBLIC_APP_URL=http://localhost:3000 npm run smoke
 */
const base =
  process.env.SMOKE_BASE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000"

async function check(path: string, expectOk = true) {
  const url = `${base.replace(/\/$/, "")}${path}`
  const res = await fetch(url, { redirect: "manual" })
  const ok = expectOk ? res.status >= 200 && res.status < 400 : true
  console.log(`${ok ? "✓" : "✗"} ${res.status} ${url}`)
  if (!ok) {
    throw new Error(`Smoke failed: ${url} → ${res.status}`)
  }
  return res
}

async function main() {
  console.log(`Smoke against ${base}`)
  await check("/api/health")
  const health = await (await fetch(`${base.replace(/\/$/, "")}/api/health`)).json()
  if (!health?.data?.status) {
    throw new Error("Health payload missing data.status")
  }
  console.log(`✓ health status=${health.data.status}`)

  await check("/")
  await check("/articles")
  await check("/guides")
  await check("/ai-tools")
  await check("/search")
  console.log("Smoke OK")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
