# Module Map

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Last Updated** | 2026-07-14 |
| **Owner** | Mendanize Platform Architecture |


## Purpose

Map every MES specification to its owning feature module, Shared Service, and primary App Router location.


## Scope

Complete coverage of MES-001–029 and meta docs. Source of truth for folder ownership during implementation.


## Dependencies

- [MES-INDEX.md](../engineering/MES-INDEX.md)
- [DEPENDENCY-MAP.md](./Dependency-Map.md)
- [APP-ROUTER-PATHS.md](./App-Router-Paths.md)


## MES → Code Map

| Spec | Feature / owner | Shared Services | Primary routes |
|------|-----------------|-----------------|----------------|
| MES-001 | Platform (cross-cutting) | — | `app/(public)`, `app/(dashboard)`, `app/(auth)` |
| MES-002 | `services/*` | all eight | `app/api/public`, `app/api/dashboard` |
| MES-003 | `components/*`, `styles/*` | — | — |
| MES-004 | public IA | content, seo | `app/(public)/*` |
| MES-005 | `features/homepage-public` | content, media, seo, recommendations | `/` |
| MES-006 | `features/authentication` | settings | `app/(auth)/*` |
| MES-007 | `features/admin-dashboard` | content, notification, media, settings | `/dashboard` |
| MES-008 | `features/articles` | content, media, seo, search | `/dashboard/articles` |
| MES-009 | `features/categories-topics` | content, seo, search | `/dashboard/categories`, `/categories`, `/topics` |
| MES-010 | `features/learning-guides` | content, media, seo, search, recommendations | `/dashboard/guides` |
| MES-011 | `features/ai-studio` | ai, content, media, **settings** | `/ai-studio` |
| MES-012 | `features/ai-tools` | ai, content, media, seo, settings | `/dashboard/ai-tools` |
| MES-013 | `features/homepage-management` | content, media, seo, settings | `/homepage` |
| MES-014 | `features/media-library` | media, ai | `/media` |
| MES-015 | `features/seo` | seo, content | `/seo` |
| MES-016 | `features/navigation` | content, settings | `/navigation` |
| MES-017 | `features/search` | search, **recommendations**, content | `/search`, `/search-settings` |
| MES-018 | `features/recommendations` (UI) | **recommendations** (logic) | service-only + optional admin UI |
| MES-019 | `features/ask-mendanize` | ai, content, **settings**, recommendations | `/ask` + public widget |
| MES-020 | `features/platform-settings` | **settings**, ai | `/settings` |
| MES-021 | `features/billing` | settings, notification | `/pricing`, `/billing` |
| MES-022 | `features/user-learning` | content, recommendations, settings | `/learning` |
| MES-023 | `features/analytics` | content, recommendations, settings | `/analytics` |
| MES-024 | `features/notifications` | notification, settings | `/notifications`, `emails/` |
| MES-025 | public articles UX | content, seo, media, recommendations | `/articles` |
| MES-026 | public guides UX | content, seo, media, recommendations | `/guides` |
| MES-027 | public AI tools UX | content, seo, media, ai, recommendations, settings | `/ai-tools` |
| MES-028 | ops cross-cutting | — | `config/`, `middleware/`, `tests/`, `scripts/` |
| MES-029 | QA cross-cutting | — | `tests/`, `scripts/` |


## No-Duplication Summary

- AI config → MES-020 / `services/settings` only  
- Recommendations → MES-018 / `services/recommendations` only  
- Session → MES-006 / `features/authentication` only  
- API envelope → [API-STANDARDS.md](../standards/API-Standards.md) only


## Implementation Notes

When adding a new capability, update this map in the same change that introduces folders. Do not place Shared Service logic under `features/*/services` beyond orchestration.


## Related Documents

- [Dependency Map](./Dependency-Map.md)
- [MES Index](../engineering/MES-INDEX.md)
- [App Router Paths](./App-Router-Paths.md)
