# MES-046 Completion Handoff — Affiliate & Referral Tracking

**Status:** Complete (MVP)  
**Date:** 2026-07-29  
**Spec:** [docs/engineering/MES-046.md](./engineering/MES-046.md)  
**Dependencies held:** MES-002 audit, MES-006/030 dual-auth, MES-021 subscription webhooks, MES-024 optional prefs (not required for MVP)

## Primary reward (documented)

**`manual_admin_payout_flag`** — conversions create a `ReferralReward` in `PENDING_PAYOUT`; Admin grants/denies in the dashboard. Finance settles **outside** the app. Does **not** use Stripe Connect (MES-039) or invent a third payment processor.

## Delivered

### Data
- Migration `20260729020000_mes046_affiliate_referral`
- `ReferralSetting` (enabled, attribution window default 30 days, reward mechanism)
- `ReferralCode` per eligible `PublicUser` (disable + Admin reason)
- `ReferralAttribution` on signup (first-touch cookie; self-referral blocked; basic IP/email abuse flags)
- `ReferralConversion` + `ReferralReward` on paid MES-021 subscription sync

### Services
- [`services/referrals/`](../services/referrals/) — codes, cookie helpers, attribution, conversion, Admin resolve
- Cookie `mendanize.ref` (+ capture timestamp) set first-touch via `proxy.ts` on `/?ref=CODE`
- Signup hooks: credentials `signUpWithCredentials` + `POST /api/auth/register`
- Paid conversion hook: `syncSubscriptionFromStripe` in MES-021 billing

### Surfaces
- `/account/referrals` — share link, counts, recent conversions
- `/dashboard/referrals` — settings, disable codes, abuse flags, grant/deny payout flags
- Learner + Admin nav entries

## Dual-auth
Learner referrals are `PublicUser` only. Disable/resolve is Admin dashboard (`requireEditor`). No Admin impersonation.

## Explicitly out of scope
Multi-level trees, cookie stuffing networks, Stripe Connect payout merge, tax-form automation.

## STOP

MES-046 complete. Rewards do not invent a third payment processor. Next when approved: **MES-047 Enterprise Organization Licensing**.
