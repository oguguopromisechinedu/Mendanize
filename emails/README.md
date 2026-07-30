# Transactional email templates (MES-024 / MES-042)

Canonical keys and content live in `EmailTemplate` via `services/notification`.

Keys used by Auth (MES-006 / MES-030): `welcome`, `password_reset`, `email_verification`.

## Delivery (MES-042)

Outbound mail uses the shared adapter [`lib/email/send.ts`](../lib/email/send.ts):

1. `RESEND_API_KEY` if set, else
2. SMTP from Platform Email settings (`getEmailSettings`)

`services/notification` `dispatch({ channel: "email", ... })` sends through that adapter and updates `CommunicationLog` to `sent` / `failed` (not forever-`queued`).

Admin UI for templates/senders/campaigns is **MES-051** (Email Management System). Until EMS lands, use existing notification email-template pages and Email settings under the dashboard.
