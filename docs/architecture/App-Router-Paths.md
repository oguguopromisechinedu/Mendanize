# App Router Path Resolution

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Last Updated** | 2026-07-14 |
| **Owner** | Mendanize Platform Architecture |


## Purpose

Document how Next.js App Router route groups map to URLs on Mendanize, and the binding rules that prevent duplicate routes between public and dashboard surfaces.


## Scope

Applies to `app/(public)`, `app/(dashboard)`, `app/(auth)`, and legacy root routes pending migration.


## Dependencies

- [MES-001-Foundation-Platform.md](../engineering/MES-001.md)
- [MES-004-Public-Website.md](../engineering/MES-004.md)
- [MES-007-Admin-Dashboard.md](../engineering/MES-007.md)
- [MODULE-MAP.md](./Module-Map.md)


## Critical Rule

Route groups `(public)`, `(dashboard)`, and `(auth)` **do not** appear in the URL. Two `page.tsx` files that resolve to the same path cannot coexist.


## Binding Path Table

| Surface | URL pattern | Folder |
|---------|-------------|--------|
| Teaching Frontend | `/`, `/articles`, `/guides`, `/ai-tools`, `/categories`, `/topics`, `/search`, `/pricing` | `app/(public)/…` |
| Admin content (name collision) | `/dashboard/articles`, `/dashboard/guides`, `/dashboard/ai-tools`, `/dashboard/categories` | `app/(dashboard)/dashboard/…` |
| Dashboard unique modules | `/dashboard`, `/ai-studio`, `/ask`, `/learning`, `/billing`, `/homepage`, `/media`, `/navigation`, `/seo`, `/search-settings`, `/settings`, `/analytics`, `/notifications` | `app/(dashboard)/…` |
| Auth | `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password` | `app/(auth)/…` (migrate legacy `app/sign-in` etc.) |
| HTTP API | `/api/public/*`, `/api/dashboard/*` | `app/api/public`, `app/api/dashboard` |


## Implementation Notes

- Prefer nesting admin twins of public resources under `/dashboard/*`.
- During migration, if a legacy root page still owns a URL, do not also create a route-group `page.tsx` for the same path — leave a README migration note instead.
- Middleware auth gates dashboard paths; public paths remain open.


## Related Documents

- [Module Map](./Module-Map.md)
- [Public Website](../engineering/MES-004.md)
- [Admin Dashboard](../engineering/MES-007.md)
