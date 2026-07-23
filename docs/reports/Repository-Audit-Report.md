# Repository Audit Report

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | Approved (audit output) |
| **Date** | 2026-07-19 |
| **Method** | Read-only, evidence-based. Verdicts drawn from actual source, not completion docs. |

## Verified quality gates (run during audit)

- `tsc --noEmit` → **exit 0**
- `eslint` → **exit 0** (clean)
- `vitest run` → **26/26 pass** (5 files)

**Caveat:** the `tests/integration/cross-module-seams.test.ts` suite (20 tests) is composed of **static file-string assertions** (`readFileSync` + grep for imports/paths), not runtime integration. There is **no e2e** (`tests/e2e/` is README-only).

## Verdict legend

- **IMPLEMENTED** — substantive, DB-wired, real logic.
- **PARTIAL** — real logic but placeholder data/storage or missing wiring.
- **STUB/PLACEHOLDER** — barely present / explicit placeholder.
- **DOCS-ONLY** — governance/spec, no code by design.

## Per-MES verdicts

| MES | Module | Verdict | Key evidence & deviation |
|---|---|---|---|
| 001 | Foundation/vision | DOCS-ONLY | Governance docs present (by design). No code. |
| 002 | Shared Services & API | IMPLEMENTED | `lib/api/response.ts` envelope; 45 route files; per-route `requireEditor()`. |
| 003 | Design system | IMPLEMENTED | `services/settings/design-tokens.ts` + `DesignTokensStyle.tsx` runtime injection with MES-020 override path. |
| 004 | Public shell | IMPLEMENTED | `PublicLayout` driven by `getNavigationConfig()`; seed fallback only. |
| 005 | Homepage | PARTIAL | Real CMS-backed sections; public render uses seed data unless `PUBLISHED`; featured entities fall back to seed copy. |
| 006 | Auth | IMPLEMENTED (gaps) | Real NextAuth v5, bcrypt, verification/reset flows, role callbacks. Deviation: REST `/api/auth/register` does not send verification email (only the server action does); prod verification depends on missing SMTP. |
| 007 | Admin dashboard | IMPLEMENTED | `computeDashboardHome()` aggregates 8+ live sources with resilient per-source fallback. |
| 008 | Articles CMS | IMPLEMENTED | Full Prisma CRUD, workflow states, tag reconciliation, real TipTap editor. |
| 009 | Categories/Topics | IMPLEMENTED | Full CRUD, orphan protection. Minor: `toolCount` hardcoded 0. |
| 010 | Learning Guides | IMPLEMENTED | Guide→Section→Lesson CRUD + structure builder. Deviation: `updateGuide` destructive `deleteMany`+recreate (loses stable child IDs). |
| 011 | AI Studio | IMPLEMENTED; video STUB | Real OpenAI text/DALL·E + Anthropic w/ fallback, `AIGeneration` wired. `prepareStudioVideo` = explicit stub (`VIDEO_TBD`). |
| 012 | AI Tools mgmt | IMPLEMENTED | Full CRUD + M2M relations; same destructive-update pattern. |
| 013 | Homepage CMS | IMPLEMENTED | Transactional section/hero/stats/faq/cta persistence. |
| 014 | Media Library | PARTIAL (critical) | DB DAM + reused Media Picker are real, but no real storage/upload: `storageProvider:"placeholder"`, file bytes never persisted, picsum URLs, no upload route. URL registry only. |
| 015 | SEO Center | PARTIAL | `resolveMetadata` + JSON-LD real on public pages, but `app/robots.ts` & `app/sitemap.ts` are static (ignore DB config); redirects stored but never enforced (no middleware); sitemap regen = timestamp placeholder. |
| 016 | Navigation | IMPLEMENTED | DB menu builder drives public layout. Minor: entity-type items without `href` dropped. |
| 017 | Search | PARTIAL | Real unified search + filters + history/trending, but ILIKE `contains`, not Postgres `tsvector`; no true relevance ranking; no memory fallback. |
| 018 | Recommendations | IMPLEMENTED | Real rules-based scoring (topic/category/recency), single canonical interface; trending is featured/recency proxy. |
| 019 | Ask Mendanize AI | IMPLEMENTED | Tier1+Tier2 DB-wired, real Anthropic/OpenAI/DALL·E w/ mock fallback, real Tier1→Tier2 handoff (TTL). |
| 020 | Platform Settings | IMPLEMENTED | Full persistence, feature flags, canonical AI config; security/SMTP fields stored-but-not-enforced. |
| 021 | Billing | IMPLEMENTED; no tier gating | Real Stripe checkout/portal/webhook + subscription sync; nothing enforces per-plan limits. |
| 022 | User Learning | IMPLEMENTED; progress synthetic | Saved/interests/history/prefs/goals DB-wired, calls recs `user`. `continue-learning` fabricates progress; `streakDays:0` placeholder. |
| 023 | Analytics | PARTIAL | Seeded synthetic data blended with some live counts; `instrumentationEnabled:false`; synthetic `hashSeed()` sparklines. UI labels "live" vs "placeholder". |
| 024 | Notifications | IMPLEMENTED; no SMTP | Real in-app CRUD/prefs/templates/announcements; email logged-only (`CommunicationLog status:"queued"`); `emails/` = README only. |
| 025 | Public Articles | IMPLEMENTED | Real reading view, IntersectionObserver TOC, progress bar, recs, Ask widget, full SEO. Author bio = hardcoded placeholder. |
| 026 | Public Guides | IMPLEMENTED | Real overview/lesson nav, prev/next, Course/HowTo JSON-LD. |
| 027 | Public AI Tools | PARTIAL | Real directory/filters/detail/SEO; comparison = explicit placeholder; "demo video placeholder". |
| 028 | Perf/Security/Prod | PARTIAL | Real logger/observability/health/rate-limit (wired into routes), real security headers. But CSP Report-Only; no active root `middleware.ts` (`middleware/index.ts` is helpers-only); no APM. |
| 029 | Final QA/Testing | PARTIAL | 4 shallow unit files + real smoke script. "Integration" = static file-string assertions; no e2e. |

## Cross-cutting layers (factual)

- `repositories/index.ts` — throws `"not implemented"` (scaffold only).
- `actions/`, `stores/`, `contexts/`, `providers/`, `hooks/` (root) — empty barrels (`export {}`).
- `emails/` — README-only.
- **Real logic lives in `features/*` + `services/*`; services call Prisma directly. The advertised `repositories/` data-access boundary is not implemented** — an architectural inconsistency vs README/Module-Map.
