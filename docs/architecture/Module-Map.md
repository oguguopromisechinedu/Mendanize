# Module Map

| Field | Value |
|-------|-------|
| **Version** | 1.1.0 |
| **Status** | Approved |
| **Last Updated** | 2026-07-23 |
| **Owner** | Mendanize Platform Architecture |


## Purpose

Map every MES specification to its owning feature module, Shared Service, and primary App Router location.


## Scope

Complete coverage of **MES-001–035** and meta docs. Source of truth for folder ownership during implementation.


## Dependencies

- [MES-INDEX.md](../engineering/MES-INDEX.md)
- [DEPENDENCY-MAP.md](./Dependency-Map.md)
- [APP-ROUTER-PATHS.md](./App-Router-Paths.md)
- [MES-DOCUMENTS-STATUS.md](../MES-DOCUMENTS-STATUS.md)


## MES → Code Map

| Spec | Feature / owner | Shared Services | Primary routes |
|------|-----------------|-----------------|----------------|
| MES-001 | Platform (cross-cutting) | — | `app/(public)`, `app/(account)`, `app/(dashboard)`, `app/(auth)` |
| MES-002 | `services/*` | all shared services | `app/api/public`, `app/api/dashboard` |
| MES-003 | `components/*`, `styles/*` | — | — |
| MES-004 | public IA | content, seo | `app/(public)/*` |
| MES-005 | `features/homepage-public` | content, media, seo, recommendations | `/` |
| MES-006 | `features/authentication` | settings | `app/(auth)/*` |
| MES-007 | `features/admin-dashboard` | content, notification, media, settings, logging, audit | `/dashboard` |
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
| MES-021 | `features/billing` | settings, notification | `/pricing`, `/account/billing` |
| MES-022 | `features/user-learning` | content, recommendations, settings | `/account/*` (learning, saved, profile) |
| MES-023 | `features/analytics` | content, recommendations, settings | `/analytics` |
| MES-024 | `features/notifications` | notification, settings | `/notifications`, `emails/` |
| MES-025 | public articles UX | content, seo, media, recommendations | `/articles` |
| MES-026 | public guides UX | content, seo, media, recommendations | `/guides` |
| MES-027 | public AI tools UX | content, seo, media, ai, recommendations, settings | `/ai-tools` |
| MES-028 | ops cross-cutting | logging, audit | `config/`, `middleware/`, `tests/`, `scripts/` |
| MES-029 | QA cross-cutting | — | `tests/`, `scripts/` |
| MES-030 | `features/authentication` (dual-domain retrofit) | settings, audit | `PublicUser`/`Admin` sessions; `/account/*` vs `/dashboard/*` |
| MES-031 | `features/ai-knowledge` (or AI Knowledge Center under AI Studio) | ai, content, media, seo, notification, settings | Admin: AI Draft queue / review; **no** public draft surface |
| MES-032 | Logging / observability | logging, audit | Admin status bar + error log view |
| MES-033 | Caching layer (content + knowledge reuse) | content, search, recommendations | Invalidation on publish; no separate cache product |
| MES-034 | Backup & recovery (process) | — | Ops runbook + Supabase backups (docs) |
| MES-035 | Privacy & compliance | audit, settings | Consent banner; `/account` export/delete; privacy policy page |
| MES-036 | `features/community` | search, notification, media, audit, ai | `/community/*`, `/dashboard/community` |
| MES-037 | Founder valuation / BI | analytics reads, ai, audit | Super Admin `/dashboard/bi` |
| MES-038 | Learner ecosystem (Partial) | account hubs | Align messaging/sandbox with MES-043/044 |
| MES-039 | Growth & marketplaces | billing separate; Connect rail | `/account/hiring`, `/account/marketplace`, `/dashboard/marketplace` |
| MES-052 | Marketplace UX + finance | extends 039; licenses + commissions | `/account/tools-marketplace`, `/account/work`, `/account/work/contracts/[id]`, `/dashboard/marketplace/finance` |
| MES-053 | Work lifecycle / maintenance | extends 039/052; Phase A continuations + tasks | Contract workspace Maintenance panel; Phase B retainers deferred |
| MES-040 | Organizations | extends MES-039 | `/account/company` |
| MES-041 | `features/static-pages` | admin pages service | `/{slug}` company pages from CMS |
| MES-042 | Email transport | notification | SMTP/API adapter; auth mail |
| MES-043 | Learner messaging | notification, media | `/account/messages` (Specified) |
| MES-044 | Coding workspace execution | logging, audit | Sandbox engine (Specified) |
| MES-045 | Community events | notification, search, media | `/community/events` (Specified) |
| MES-046 | Affiliates / referrals | audit, billing | Attribution (Specified) |
| MES-047 | Org seat licensing | MES-021 Checkout | Extends MES-040 (Specified) |
| MES-048 | Marketplace disputes | Connect, audit | Admin dispute queue (Specified) |
| MES-049 | Recommendations ML | **recommendations** only | Behind MES-018 facade (Specified) |
| MES-050 | PWA / offline | — | Manifest + SW (Specified) |
| MES-051 | Email Management System | notification, MES-042 | `/dashboard/communication/email/*` (Specified) |


## No-Duplication Summary

- AI config → MES-020 / `services/settings` only  
- Recommendations → MES-018 / `services/recommendations` only (MES-049 upgrades in place)  
- Session → MES-006 / MES-030 / `features/authentication` only  
- API envelope → [API-STANDARDS.md](../standards/API-Standards.md) only  
- AI Knowledge generation → MES-031 (reuses MES-011; does not fork Ask or Studio)  
- Email send → MES-042 transport; EMS UI → MES-051 (do not fork nodemailer in features)  
- Marketplace payouts → Stripe Connect (MES-039), not MES-021 Checkout


## Implementation Notes

When adding a new capability, update this map in the same change that introduces folders. Do not place Shared Service logic under `features/*/services` beyond orchestration. MES-031 must never grant `PublicUser` visibility into Admin draft queues.


## Related Documents

- [Dependency Map](./Dependency-Map.md)
- [MES Index](../engineering/MES-INDEX.md)
- [App Router Paths](./App-Router-Paths.md)
- [MES Documents Status](../MES-DOCUMENTS-STATUS.md)
