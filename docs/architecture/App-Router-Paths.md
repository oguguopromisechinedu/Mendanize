# App Router Path Resolution

| Field | Value |
|-------|-------|
| **Version** | 1.1.0 |
| **Status** | Approved |
| **Last Updated** | 2026-07-23 |
| **Owner** | Mendanize Platform Architecture |


## Purpose

Document how Next.js App Router route groups map to URLs on Mendanize, and the binding rules that prevent duplicate routes between public, learner account, and dashboard surfaces.


## Scope

Applies to `app/(public)`, learner `/account/*` routes, `app/(dashboard)`, `app/(auth)`, and legacy root routes pending migration.


## Dependencies

- [MES-001.md](../engineering/MES-001.md)
- [MES-004.md](../engineering/MES-004.md)
- [MES-007.md](../engineering/MES-007.md)
- [MES-021.md](../engineering/MES-021.md)
- [MES-022.md](../engineering/MES-022.md)
- [MES-030.md](../engineering/MES-030.md)
- [MODULE-MAP.md](./Module-Map.md)


## Critical Rule

Route groups `(public)`, `(dashboard)`, and `(auth)` **do not** appear in the URL. Two `page.tsx` files that resolve to the same path cannot coexist.

Per MES-030: **`/dashboard/*` is Admin-only.** Learner billing, learning, and profile live under **`/account/*`**, not `/dashboard/*`.


## Binding Path Table

| Surface | URL pattern | Folder |
|---------|-------------|--------|
| Teaching Frontend | `/`, `/articles`, `/guides`, `/ai-tools`, `/categories`, `/topics`, `/search`, `/pricing`, privacy policy | `app/(public)/…` |
| Learner Account (`PublicUser`) | `/account`, `/account/billing`, `/account/learning`, `/account/profile`, export/delete | `app/(public)/account/…` or dedicated account group — **not** under Admin dashboard |
| Admin content (name collision) | `/dashboard/articles`, `/dashboard/guides`, `/dashboard/ai-tools`, `/dashboard/categories` | `app/(dashboard)/dashboard/…` |
| Dashboard unique modules | `/dashboard`, `/ai-studio`, `/ask`, `/homepage`, `/media`, `/navigation`, `/seo`, `/search-settings`, `/settings`, `/analytics`, `/notifications` | `app/(dashboard)/…` |
| Auth | `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password` | `app/(auth)/…` |
| HTTP API | `/api/public/*`, `/api/dashboard/*` | `app/api/public`, `app/api/dashboard` |


## Implementation Notes

- Prefer nesting admin twins of public resources under `/dashboard/*`.
- Do **not** route MES-021/MES-022 learner features under `/dashboard/*` (MES-030 conflict).
- During migration, if a legacy root page still owns a URL, do not also create a route-group `page.tsx` for the same path — leave a README migration note instead.
- Middleware: Admin session for dashboard paths; `PublicUser` session for `/account/*`; public paths remain open.


## Related Documents

- [Module Map](./Module-Map.md)
- [Public Website](../engineering/MES-004.md)
- [Admin Dashboard](../engineering/MES-007.md)
- [Dual Auth](../engineering/MES-030.md)
