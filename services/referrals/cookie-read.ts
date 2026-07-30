/** Read referral cookies from a Request / Next headers cookie store. */

import { cookies } from "next/headers"

import {
  REFERRAL_CODE_PATTERN,
  REFERRAL_COOKIE_CAPTURED_AT,
  REFERRAL_COOKIE_NAME,
} from "./constants"

export type ReferralCookiePayload = {
  code: string | null
  capturedAt: Date | null
}

export async function readReferralCookie(): Promise<ReferralCookiePayload> {
  try {
    const jar = await cookies()
    const raw = jar.get(REFERRAL_COOKIE_NAME)?.value?.trim().toUpperCase() ?? null
    const code =
      raw && REFERRAL_CODE_PATTERN.test(raw) ? raw : null
    const atRaw = jar.get(REFERRAL_COOKIE_CAPTURED_AT)?.value
    const capturedAt =
      atRaw && Number.isFinite(Number(atRaw))
        ? new Date(Number(atRaw))
        : null
    return { code, capturedAt }
  } catch {
    return { code: null, capturedAt: null }
  }
}

export function readReferralCookieFromHeader(
  cookieHeader: string | null,
): ReferralCookiePayload {
  if (!cookieHeader) return { code: null, capturedAt: null }
  const map = new Map<string, string>()
  for (const part of cookieHeader.split(";")) {
    const [k, ...rest] = part.trim().split("=")
    if (!k) continue
    map.set(k, rest.join("="))
  }
  const raw = map.get(REFERRAL_COOKIE_NAME)?.trim().toUpperCase() ?? null
  const code = raw && REFERRAL_CODE_PATTERN.test(raw) ? raw : null
  const atRaw = map.get(REFERRAL_COOKIE_CAPTURED_AT)
  const capturedAt =
    atRaw && Number.isFinite(Number(atRaw)) ? new Date(Number(atRaw)) : null
  return { code, capturedAt }
}
