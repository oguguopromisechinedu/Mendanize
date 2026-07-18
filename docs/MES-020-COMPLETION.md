# MES-020 Platform Settings — completion handoff

| Field | Value |
|-------|-------|
| **Completed** | 2026-07-15 |
| **Next** | [MES-021 — Billing & Subscriptions](./engineering/MES-021.md) |

## Architecture

| Concern | Implementation |
|---------|----------------|
| Feature | `features/platform-settings` |
| Shared Service | `services/settings` (`platform.ts` + MES-002 seams) |
| Models | `PlatformSetting`, `BrandingSetting`, `LocalizationSetting`, `AuthenticationSetting`, `AiPlatformSetting`, `SearchPlatformSetting`, `EmailSetting`, `SecuritySetting`, `FeatureFlag` (extended), `MaintenanceConfiguration` |
| Migration | `20260715260000_mes020_platform_settings` |
| Dashboard API | `GET /api/dashboard/settings` (overview) |

## Surfaces

| Route | Purpose |
|-------|---------|
| `/dashboard/settings` | Overview cards (status, version, Auth/AI/Search/Email/Maintenance) |
| `/dashboard/settings/general` | Platform identity & defaults |
| `/dashboard/settings/branding` | Brand colors/logo → design token overrides |
| `/dashboard/settings/localization` | Language/timezone placeholders |
| `/dashboard/settings/authentication` | Registration / verification surface over MES-006 |
| `/dashboard/settings/ai` | **Canonical AI config** (providers, history, rate-limit placeholder) |
| `/dashboard/settings/search` | Syncs into MES-017 search configuration |
| `/dashboard/settings/email` | Sender identity + SMTP placeholder |
| `/dashboard/settings/security` | Login limits / audit toggle placeholders |
| `/dashboard/settings/maintenance` | Maintenance mode + banner |
| `/dashboard/settings/feature-flags` | Module toggles |
| `/dashboard/settings/backup` | Placeholder only |

`/settings` redirects to `/dashboard/settings`.

## Who reads this (no duplicates)

| Module | Integration |
|--------|-------------|
| **MES-011 AI Studio** | Link to `/dashboard/settings/ai`; uses `getAiConfig` / `services/settings` |
| **MES-019 Ask Mendanize** | `AI_SETTINGS_HREF` → `/dashboard/settings/ai`; no local settings |
| **MES-002 Settings Service** | `getAiConfig` / `getDesignTokens` / `getPlatformSettings` backed by platform tables |
| **MES-017 Search** | Platform search settings call `updateSearchConfiguration` |
| **MES-003 Design** | Branding maps into design token overrides |

## Out of scope (as specified)

Real SMTP, real backups/restore, cloud integrations, env-var editing UI.

## STOP

Ready for **MES-021**. Do not start Billing until requested.
