# MES-042 Completion Handoff — Transactional Email Delivery

**Status:** Complete (MVP)  
**Date:** 2026-07-28  
**Spec:** [docs/engineering/MES-042.md](./engineering/MES-042.md)  
**Dependencies held:** MES-002 Notification dispatch, MES-006/030 auth, MES-020 Email settings, MES-024 templates/prefs, MES-032 application logs

## Delivered

### Transport (single adapter)
- [`lib/email/send.ts`](../lib/email/send.ts) — Resend → SMTP from Email settings; structured failure logs via MES-032
- [`lib/email/mes042.ts`](../lib/email/mes042.ts) — production readiness checks, transactional vs marketing template sets, `logEmailEvent`

### Notification Service
- Email channel **sends** (not forever-queued); `CommunicationLog` → `sent` / `failed` / `skipped`
- Marketing templates (`newsletter`, etc.) respect preference gates (MES-024 / MES-035)
- Seeds missing system templates including `admin_password_reset` and `generic_notification`
- Production refuses silent “queued” success when DB/mail is unavailable

### Auth integration
- **Server-action register** and **`POST /api/auth/register`** both send `email_verification` when verification is enabled
- Production: missing provider or send failure **fails loudly** (user-visible error / 503) instead of silent success
- Public password reset → `password_reset` template via `dispatch`
- Admin password reset → `admin_password_reset` template via `dispatch` (no ad-hoc HTML; Admin domain separate from PublicUser)

### Ops note
Configure either `RESEND_API_KEY` or SMTP fields under Dashboard Email settings. Without a provider, local/dev may log verification URLs to the console; production will error.

## Explicitly out of scope (MES-051)
Full EMS dashboard (sender registry, campaigns UI, automations builder, open/click analytics suite). Transport stays this adapter.

## Dual-auth confirmation
Public verification/reset templates never target Admin sessions; admin reset uses `admin_password_reset` and `adminId` on dispatch.

## STOP

MES-042 complete. Next was **MES-051** (now Complete — see [MES-051-COMPLETION.md](./MES-051-COMPLETION.md)).
