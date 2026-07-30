/**
 * Edge-safe referral cookie helpers (MES-046).
 * First-touch only: do not overwrite an existing ref cookie.
 */

import type { NextRequest, NextResponse } from "next/server"

import {
  DEFAULT_ATTRIBUTION_WINDOW_DAYS,
  REFERRAL_CODE_PATTERN,
  REFERRAL_COOKIE_CAPTURED_AT,
  REFERRAL_COOKIE_NAME,
} from "./constants"

const isProd = process.env.NODE_ENV === "production"

export function normalizeReferralCodeParam(raw: string | null): string | null {
  if (!raw) return null
  const code = raw.trim().toUpperCase()
  if (!REFERRAL_CODE_PATTERN.test(code)) return null
  return code
}

export function applyReferralCookieIfNeeded(
  req: NextRequest,
  res: NextResponse,
  windowDays = DEFAULT_ATTRIBUTION_WINDOW_DAYS,
): NextResponse {
  const raw = req.nextUrl.searchParams.get("ref")
  const code = normalizeReferralCodeParam(raw)
  if (!code) return res

  const existing = req.cookies.get(REFERRAL_COOKIE_NAME)?.value
  if (existing && REFERRAL_CODE_PATTERN.test(existing.toUpperCase())) {
    return res
  }

  const maxAge = Math.max(1, windowDays) * 86_400
  const common = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: isProd,
    maxAge,
  }
  res.cookies.set(REFERRAL_COOKIE_NAME, code, common)
  res.cookies.set(REFERRAL_COOKIE_CAPTURED_AT, String(Date.now()), common)
  return res
}
