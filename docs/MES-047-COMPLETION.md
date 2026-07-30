# MES-047 Completion Handoff — Enterprise Organization Licensing

**Status:** Complete (MVP)  
**Date:** 2026-07-29  
**Spec:** [docs/engineering/MES-047.md](./engineering/MES-047.md)  
**Dependencies held:** MES-006/030 dual-auth, MES-021 Checkout + webhooks (**reused**), MES-040 Organizations

## Stripe customer association (documented)

- **Billing identity:** Organization **Owner** `PublicUser`
- **Stripe Customer:** same MES-021 customer as personal `Subscription.stripeCustomerId` for that owner (created via `ensureSubscription` / customer create if missing)
- **Org seat subscription:** `OrganizationSubscription` row with `stripeSubscriptionId` + metadata `kind=organization`
- **Not** a third session type; **not** Stripe Connect (MES-039)

## Delivered

### Data
- Migration `20260729030000_mes047_org_licensing`
- `OrganizationPlan` catalog (seats, Ask volume, marketplace job limit, Stripe price, verification gate)
- `OrganizationSubscription` (status, seats override, period end)

### Services
- [`services/organization-licensing/`](../services/organization-licensing/) — plan CRUD, Checkout/portal, webhook sync, seat assert, entitlements
- MES-021 webhook routes `metadata.kind === "organization"` → org sync; personal otherwise
- `addOrganizationMember` enforces seats (free bootstrap max 2; paid plan uses catalog/override)
- Org-linked `createJobPosting` respects `marketplaceJobLimit`

### Surfaces
- `/account/company/billing` — Owner/Admin subscribe + Stripe portal
- `/dashboard/organization-plans` — Admin plan catalog + seat override (audit-logged)
- Company page link to billing

## Dual-auth
Org billing stays under `/account/*`. No “login as org.” Admin manages catalog only via `/dashboard`.

## Explicitly out of scope
HRIS, SSO/SAML, government procurement, Employer session, interview suites, Stripe Connect for seats.

## STOP

MES-047 complete. **Single Stripe Checkout rail with MES-021.** Next when approved: **MES-048 Marketplace Dispute Resolution**.
