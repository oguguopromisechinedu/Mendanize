# MES-024 Notification & Communication — completion handoff

| Field | Value |
|-------|-------|
| **Completed** | 2026-07-15 |
| **Next** | [MES-025 — Public Article Experience](./engineering/MES-025.md) |

## Architecture

| Concern | Implementation |
|---------|----------------|
| Feature | `features/notifications` |
| Shared Service | `services/notification` (`dispatch`, preferences, templates, announcements, logs) |
| Migration | `20260715290000_mes024_notifications` |
| API | `GET /api/dashboard/notifications` |

## Models

`Notification` (extended), `NotificationPreference`, `NotificationTemplate`, `EmailTemplate`, `Announcement`, `CommunicationLog`, `DeliverySetting`. Types: Information / Success / Warning / Error / Security / System / Learning / AI / Announcement (+ legacy `BILLING`).

## Surfaces (`/dashboard/notifications/*`)

Dashboard, Center, Templates, Email templates, Announcements, History, Delivery, Preferences. `/notifications` redirects here. Topbar bell links to Center.

## Who routes through this service

| Module | Integration |
|--------|-------------|
| **Auth (MES-006)** | Sign-up → `welcome` email + in-app welcome; forgot-password → `password_reset` (queued log, SMTP placeholder) |
| **MES-022 Learning** | Preferences page links to notification preferences |
| **Billing / content / Ask (future)** | Call `dispatch({ channel, template, userId, payload })` — do not invent parallel notifiers |
| **MES-020 Maintenance** | Announcements of kind `MAINTENANCE` |

## Out of scope (as specified)

Real SMTP, push/SMS, real-time websockets, third-party messaging.

## STOP

Ready for **MES-025**. Do not start Public Article Experience until requested.
