# Enterprise Implementation Roadmap

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | Approved (audit output) |
| **Date** | 2026-07-19 |

## Governing execution rule

**Implementation proceeds in strict MES numerical order — MES-001 → MES-029 — one specification at a time, each followed by a verification + approval gate.** Gap severity (see Gap Analysis) informs *what to do within each MES*, but does **not** reorder the sequence.

Each MES is a "completion pass": because the modules already exist as partial implementations, the work per MES is to bring that module into genuine conformance with its spec + Appendix A, then verify (`typecheck`, `lint`, `build`, and where applicable tests) and stop for approval.

## Dependency spine (must be respected)

`MSEM → Appendix A → MES-001 → 002 → 003 → {004,005,006} → 007 → content(008–016) → platform(017–021) → UX(022–024) → public(025–027) → launch(028–029)`

- AI-config consumers (011, 012, 019, 027) defer to **MES-020**.
- Related-content consumers (017, 022, 023, 025–027) defer to **MES-018**.
- All dashboard modules defer to **MES-006 + MES-007**.

## Sequence with per-MES focus (derived from the audit)

| MES | Focus this pass | Related gaps |
|---|---|---|
| 001 | Foundation & vision — governance/docs only; verify two-surface + module foundation conformance. **No code.** | — |
| 002 | Confirm Shared Services single-owner contracts + `{data,error,meta}`; decide `repositories/` boundary. | H5 |
| 003 | Design tokens seeded + runtime-driven from settings. | — |
| 004 | Public shell fully navigation-service driven. | — |
| 005 | Homepage sections DB-backed (reduce seed fallback reliance). | — |
| 006 | Real email transport for verification/reset; reconcile `/api/auth/register`. | C2, M5 |
| 007 | Dashboard shell resilience + role enforcement. | — |
| 008–010 | CMS: diff-based updates (stop destructive recreate). | M1 |
| 011 | AI Studio video provider (or formally defer w/ sign-off). | M3 |
| 012 | AI Tools CRUD hardening. | M1, L2 |
| 013 | Homepage CMS. | — |
| 014 | **Real media storage + upload route + Media Picker wiring.** | C1 |
| 015 | Wire robots/sitemap to DB config; enforce redirects via middleware. | C3 |
| 016 | Navigation entity→slug URL resolution. | L2 |
| 017 | Postgres `tsvector` full-text + relevance ranking. | H1 |
| 018 | Recommendations (already solid) — verify sole-source. | — |
| 019 | Ask AI — verify handoff + provider fallback. | — |
| 020 | Platform settings — enforce stored security fields. | — |
| 021 | Per-tier feature gating/entitlements. | M2 |
| 022 | Real lesson-completion/progress + streaks. | H3 |
| 023 | Real `AnalyticsEvent` capture; replace synthetic rollups (or gate). | H2 |
| 024 | Real SMTP + email template system. | C2 |
| 025 | Author profiles (model + public block). | M4 |
| 026 | Public guides — verify completeness. | — |
| 027 | Tool comparison engine. | L1 |
| 028 | Enforce CSP; add active root `middleware.ts`; APM/error reporting. | C3, L3 |
| 029 | Real integration + Playwright e2e; a11y + CWV passes; regenerate an honest readiness report. | H4 |

## Per-MES gate (applies to every spec)

1. Implement only the target MES; resolve only inconsistencies that MES requires.
2. `npm run typecheck` → 0 errors.
3. `npm run lint` → 0 errors.
4. `npm run build` → success.
5. Summarize files created/modified.
6. Explain how the implementation satisfies the MES.
7. Stop and wait for approval before the next MES.
