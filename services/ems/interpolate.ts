/** EMS template variable interpolation with HTML escaping (MES-051). */

const SAFE_KEYS = new Set([
  "verification_link",
  "reset_password_link",
  "verifyUrl",
  "resetUrl",
  "magic_link",
])

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function interpolate(
  tpl: string,
  payload: Record<string, unknown> | undefined,
  opts?: { html?: boolean },
): string {
  if (!payload) return tpl
  const html = opts?.html !== false
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const v = payload[key]
    if (v == null) return ""
    const raw = String(v)
    if (!html || SAFE_KEYS.has(key)) return raw
    return escapeHtml(raw)
  })
}
