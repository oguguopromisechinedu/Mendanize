# MES-023 Analytics & Insights — completion handoff

| Field | Value |
|-------|-------|
| **Completed** | 2026-07-15 |
| **Next** | [MES-024 — Notification & Communication System](./engineering/MES-024.md) |

## Architecture

| Concern | Implementation |
|---------|----------------|
| Feature | `features/analytics` |
| Shared Service | `services/analytics` |
| Event stream | `AnalyticsEvent` + `captureAnalyticsEvent()` |
| Rollups | `ContentAnalytics`, `LearningAnalytics`, `AIAnalytics`, `SearchAnalytics`, `TrafficAnalytics` |
| Reports / config | `AnalyticsReport`, `AnalyticsConfiguration` |
| Migration | `20260715280000_mes023_analytics` |
| API | `GET /api/dashboard/analytics` |

## Surfaces (`/dashboard/analytics/*`)

Overview, Content, Learning, AI, Search, Users, Traffic, Reports (filters + export/schedule placeholders). `/analytics` redirects to the dashboard path.

## How modules use this system

| Direction | Pattern |
|-----------|---------|
| **Write** | Call `captureAnalyticsEvent({ kind, entityType, entityId, … })` — interface only; instrumentation remains off (`instrumentationEnabled: false`) |
| **Read (admin)** | Domain pages + overview blend live content/Ask/search counts with seeded rollups |
| **Read (MES-007)** | Dashboard home pulls `getDashboardAnalyticsSlice()` for visitors / page views / sessions |
| **Read (MES-005)** | Homepage public stats overlay `getPublicFacingStats()` when CMS is published |
| **Read (MES-017)** | Trending searches fall back to `getTopSearchQueriesFromAnalytics()` when `TrendingSearch` is empty |

Guide/tool views come from rollups (no `viewCount` columns on those models yet). Article views can use live `Article.viewCount` when present.

## Out of scope (as specified)

Production tracking pipeline, third-party analytics, real-time charts, ML insights, real export.

## STOP

Ready for **MES-024**. Do not start Notifications until requested.
