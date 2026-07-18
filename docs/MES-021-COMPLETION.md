# MES-021 Billing & Subscriptions — completion handoff

| Field | Value |
|-------|-------|
| **Completed** | 2026-07-15 |
| **Next** | [MES-022 — User Learning Experience & Personalization](./engineering/MES-022.md) |

## Architecture

| Concern | Implementation |
|---------|----------------|
| Feature | `features/billing` |
| Shared Service | `services/billing` |
| Stripe client | `services/billing/stripe.ts` |
| Persistence | Existing `Subscription` + `PlanTier` (`FREE` / `PRO` / `TEAM`) |
| Webhooks | `POST /api/webhooks/stripe` |
| Dashboard API | `GET /api/dashboard/billing` |
| Public API | `GET /api/public/pricing` (catalog only) |

## Tier mapping

| Marketing (MES-021) | `PlanTier` | Stripe price env |
|---------------------|------------|------------------|
| Starter | `FREE` | — |
| Professional | `PRO` | `STRIPE_PRICE_PRO` |
| Enterprise | `TEAM` | `STRIPE_PRICE_TEAM` |

## Surfaces

| Route | Behavior |
|-------|----------|
| `/pricing` | Read-only three-tier catalog (no Stripe interaction) |
| `/dashboard/settings/billing` | Status, payment method, invoices, Checkout upgrade, Customer Portal |
| `/dashboard/billing` | Redirects to settings billing |

## Stripe flows

- **Checkout** — subscription mode; success/cancel return to billing page
- **Customer Portal** — payment method, plan change, cancel
- **Webhooks** — `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed` sync local `Subscription`

## Content principle

Articles and Learning Guides are not gated. Gating for Ask volume / analytics / premium tools is deferred until those products exist.

## Out of scope (as specified)

Final per-tier feature gates, enterprise custom contracts.

## STOP

Ready for **MES-022**. Do not start the next module until requested.
