# MES-030 Completion Handoff — Dual Authentication

| Field | Value |
|-------|-------|
| **Spec** | [MES-030](./engineering/MES-030.md) |
| **Status** | Complete |
| **Date** | 2026-07-23 |

## Summary

Public and Admin authentication are fully separated: `PublicUser` / `Admin` models, `PublicSession` / `AdminSession`, independent Auth.js engines (`lib/auth/public.ts`, `lib/auth/admin.ts`), and edge gates in `proxy.ts`. Learner surfaces live under `/account/*`; `/dashboard/*` is Admin-only.

## Migration

- Schema migration: `prisma/migrations/20260719220000_mes030_dual_auth/`
- Data scripts: `scripts/migrate-dual-auth.ts`, `scripts/rewire-dual-auth-fks.ts` (idempotent; run per environment, then verify before dropping legacy tables)
- Split rule: Learner → `PublicUser`; staff roles → `Admin`
- FKs repointed: Subscription, Conversation, personalization models use `publicUserId`

## Isolation confirmation

- Public registration cannot create Admin accounts
- Dashboard login has no self-registration / social / magic-link
- RBAC via `AdminRole` / `Permission` / `requirePermission`
- Admin actions logged (`AuthorizationLog` + `AuditLog`)

## Cleanup in this pass

- Removed dead `app/(dashboard)/learning/*` sub-routes (learners use `/account`)

## STOP

Dual-auth domains are isolated. Billing, Personalization, and Ask use `PublicUser`. Await approval only if further auth enhancements (MFA/SSO) are requested — those are out of scope.
