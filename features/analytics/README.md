# analytics

**Implements:** MES-023

**Shared Services:** `services/analytics` (plus live counts from content / Ask / search)

Admin insights at `/dashboard/analytics`. Modules write via `captureAnalyticsEvent` later; this phase ships the schema + placeholder rollups.
