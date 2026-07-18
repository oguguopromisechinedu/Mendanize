# MES-006 Authentication — completion handoff

| Field | Value |
|-------|-------|
| **Completed** | 2026-07-15 |
| **Next** | [MES-007 — Admin Dashboard Foundation](./engineering/MES-007.md) |

## Architecture (canonical session)

| Concern | Implementation |
|---------|----------------|
| Provider | **Auth.js / NextAuth v5** (`auth.ts`) — credentials + Google/GitHub |
| Database | Prisma `User` + `Profile` + Auth.js `Account`/`Session`/`VerificationToken` on Supabase Postgres |
| Feature owner | `features/authentication` |
| Route gate | `proxy.ts` using `lib/auth/config` + `isAdminRole` |
| Pages | `app/(auth)/sign-in\|sign-up\|forgot-password\|reset-password\|verify-email` |

Draft MES-006 text said “Supabase Authentication.” **Living contract is Auth.js** (also stated in Security Standards / README). Supabase remains the DB host. Prefer updating MES-006 wording later to match Index ownership without a second session stack.

## Roles (expandable)

`LEARNER` (default), `EDITOR`, `ADMIN`, `SUPER_ADMIN`, plus legacy `USER` (treated as learner).  
Role-specific dashboards are **not** built yet (per STOP / WHAT NOT TO BUILD).

## Forms & validation

Zod schemas for sign-in, sign-up (with password confirm), forgot, reset.  
UI uses MES-003 primitives via `AuthShell`.

## Password reset

Tokens stored as `VerificationToken` with `identifier = reset:{email}`.  
Email delivery deferred to Notification Service (MES-024). Dev logs token.

## Legacy cleanup

Deleted `app/sign-in` and `app/sign-up`. Routes now live only under `app/(auth)`.

## How later MES integrate

| Spec | Integration |
|------|-------------|
| **MES-007** Admin Dashboard | Call `requireAdmin()` / `getSession()`; keep `/dashboard` in `adminPrefixes` |
| **MES-021** Billing (Index) / draft MES-020 | Gate premium by session user id + subscription row; do not invent sessions |
| **MES-022** Personalization (Index) | Read `session.user.id` for learner prefs/bookmarks |

## STOP

Ready for **MES-007**.
