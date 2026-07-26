/**
 * Stripe Connect client — MES-039.
 * Deliberately separate from MES-021 subscription Checkout (`services/billing/stripe.ts`).
 */

import "server-only"

import Stripe from "stripe"

let connectClient: Stripe | null = null

/** Connect uses the same secret key family but never shares Checkout session helpers. */
export function isStripeConnectConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim())
}

export function getStripeConnect(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim()
  if (!key) {
    throw new Error(
      "Stripe Connect is not configured. Set STRIPE_SECRET_KEY for marketplace rails.",
    )
  }
  if (!connectClient) {
    connectClient = new Stripe(key, {
      apiVersion: "2026-06-24.dahlia",
      typescript: true,
    })
  }
  return connectClient
}

export function getMarketplaceAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "") ||
    "http://localhost:3000"
  )
}

/** Platform fee bps for marketplace / work contracts (configurable). */
export function getMarketplaceFeeBps(): number {
  const raw = process.env.STRIPE_CONNECT_PLATFORM_FEE_BPS?.trim()
  const n = raw ? Number(raw) : 1000
  return Number.isFinite(n) && n >= 0 && n <= 5000 ? n : 1000
}

export function feeCents(amountCents: number): number {
  return Math.round((amountCents * getMarketplaceFeeBps()) / 10000)
}
