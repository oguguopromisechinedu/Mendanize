# Gap Analysis Report

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | Approved (audit output) |
| **Date** | 2026-07-19 |
| **Severity basis** | Impact on delivering the platform's own stated scope (production-completeness). |

> **Note on ordering:** This report classifies gaps by severity for situational awareness. **Implementation, however, proceeds in strict MES numerical order (MES-001 → MES-029), not by this severity ranking**, per the approved directive.

## Legend

- **Critical** — blocks core product / real usage / security.
- **High** — materially undermines a product pillar or production readiness.
- **Medium** — should fix before scaling.
- **Low** — polish / declared-deferred.

## Gaps

| # | Gap | Severity | Complexity | Depends on | Why |
|---|---|---|---|---|---|
| C1 | Media upload/storage not real (URL registry only, no upload route) | Critical | High | Supabase Storage/S3 + Media service | Content platform can't ingest images; blocks Articles/Guides/Tools/Homepage/AI-Studio real use |
| C2 | No real email delivery (SMTP) | Critical | Medium | Notification service + provider | Email verification/reset can't function in prod; auth is gated on it |
| C3 | No active edge middleware; redirects unenforced; CSP Report-Only | Critical/High | Medium | MES-015/028 + root `middleware.ts` | Security posture + SEO redirects + edge auth ambiguity (protection currently relies on per-action `requireX()`) |
| H1 | Search is ILIKE substring, not tsvector | High | Medium | Postgres FTS + indexes | Discover pillar; poor relevance, won't scale |
| H2 | Analytics is synthetic placeholder data | High | High | Real event pipeline | Analytics pillar reports fabricated numbers |
| H3 | Learning progress fabricated; no completion tracking; streak=0 | High | High | Lesson-completion model + events | Practice/personalization core is not real |
| H4 | Test coverage shallow; no runtime integration or e2e | High | High | Playwright + seed harness | Production readiness cannot be asserted |
| H5 | `repositories/` unimplemented (architectural inconsistency) | High | Medium | Refactor decision | Advertised boundary absent; services couple directly to Prisma |
| M1 | Destructive `deleteMany`+recreate on update (guides/tools/homepage) | Medium | Medium | Diff-based update | Discards stable child IDs; breaks revisions/foreign refs |
| M2 | Billing has no per-tier feature gating | Medium | Medium | Feature flags + entitlements | Monetization non-functional beyond checkout |
| M3 | AI Studio video generation stub | Medium | High | Video provider | Declared deferred, but a spec deliverable |
| M4 | Author profiles hardcoded placeholder (MES-025) | Medium | Medium | Author model/UX | Public article completeness |
| M5 | `/api/auth/register` doesn't send verification email | Medium | Low | C2 | Duplicate entry point diverges from server action |
| L1 | AI Tools comparison placeholder | Low | Medium | Comparison engine | Declared deferred |
| L2 | `category.toolCount` hardcoded 0; entity-nav items w/o href dropped | Low | Low | — | Minor correctness |
| L3 | No APM/Sentry wiring | Low | Low | Provider | Observability polish |

## Summary

No module is entirely **MISSING**. The profile is "real skeleton + real muscle, with several mannequin organs" — concentrated in **storage, email, search quality, analytics/progress truth, edge security, and testing.**
