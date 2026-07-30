# MES-051 Completion Handoff — Email Management System (EMS)

**Status:** Complete (MVP)  
**Date:** 2026-07-28  
**Spec:** [docs/engineering/MES-051.md](./engineering/MES-051.md)  
**Dependencies held:** MES-002 Audit, MES-007 nav, MES-020/042 Email settings + transport, MES-024 templates, MES-030 RBAC, MES-035 consent (newsletter audience remains active subscribers)

## Delivered

### Data model
- Migration `20260728200000_mes051_email_management` — categories, senders, template versions, variables, automation rules, queue items, delivery events; EMS fields on `EmailTemplate` / `EmailSetting`

### Service
- [`services/ems/`](../services/ems/) — seed categories/senders/variables; CRUD; queue → MES-042 `sendEmail` (optional verified `from`); `emitEmailEvent`; analytics with honest nulls for open/click/bounce; settings update + audit

### Dashboard
- **Communication → Email Management** under `/dashboard/communication/email/*` (templates, categories, senders, variables, newsletter, automations, analytics, queue, settings)
- RBAC: Super Admin for senders / SMTP-brand settings / template delete; Editors draft-only; Admin for test send / queue ops / automations
- Template editor: Preview (sample vars) + version history list
- `/dashboard/newsletter` redirects into EMS newsletter
- Newsletter send enqueues via EMS queue (DB mode)

### Transport
- Single path: EMS queue / Notification dispatch → [`lib/email/send.ts`](../lib/email/send.ts) (now accepts optional `from` override for verified senders)

## Explicitly out of scope
ESP A/B suites, heatmaps, open/click without provider webhooks, non-`@mendanize.com` domains, learner email builder

## Dual-auth confirmation
EMS is Admin `/dashboard/*` only. No `PublicUser` path.

## STOP

MES-051 complete. Next when approved: **MES-043 Learner Messaging**.
