# MES-040 Completion Handoff — Company & Organization Accounts

**Status:** Complete (MVP)  
**Date:** 2026-07-27  
**Dependencies held:** MES-030 dual-auth boundary; MES-039 marketplaces + Stripe Connect

## Delivered

### Spec
- Rewrote [docs/engineering/MES-040.md](./engineering/MES-040.md) as a rightsized engineering spec (extends MES-039; no third session type).
- Updated MES-INDEX v1.9 and MES-DOCUMENTS-STATUS.

### Schema (`20260727180000_mes040_organizations`)
- `Organization` + `OrganizationMember` (OWNER / ADMIN / MEMBER)
- `JobPosting.organizationId` (optional)
- `MarketplaceListing.source` (`OFFICIAL` | `THIRD_PARTY` | `BUILT_ON_MENDANIZE`)

### Services / actions
- `services/organization` — create/update, members by email, verification submit + Admin review
- Creating an org ensures `ClientFlag` for the owner
- Marketplace job create accepts optional `organizationId`
- Creators choose Built on Mendanize / Third-party; Admins can set Official

### Learner UI (`/account/*`)
- `/account/company` — create/manage profile, members, verification
- Nav item “Company”
- `/account/hiring` — post as company when org exists
- `/account/tools-marketplace` — hybrid source badges
- `/account/marketplace` — source selector on new listings

### Admin
- `/dashboard/marketplace` — company verification queue + listing source control

### Dual-auth confirmations
1. Organization membership never grants `/dashboard/*` or Admin session.
2. Stripe Connect rail unchanged; MES-021 Checkout unused for marketplace purchases.
3. Job/listing Admin review gates unchanged.

## Apply migration

```bash
npx prisma migrate deploy
npx prisma generate
```

## Explicitly deferred
Enterprise license SKUs, interview scheduling, full HR role matrix, recruitment billing, full third-party tool CMS field matrix, separate Employer session.

## Smoke checklist
1. Create company at `/account/company`
2. Submit for verification → Admin verifies at `/dashboard/marketplace`
3. Post org-linked job from `/account/hiring`
4. Submit listing with source → approve → badge visible on tools marketplace
