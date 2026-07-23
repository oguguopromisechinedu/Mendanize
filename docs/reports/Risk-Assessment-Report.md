# Risk Assessment Report

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | Approved (audit output) |
| **Date** | 2026-07-19 |

## Risk register

| Risk | Likelihood | Impact | Rating | Mitigation |
|---|---|---|---|---|
| Auth unusable in prod (no SMTP) — users can't verify/reset | High | High | **Critical** | Wire an email transport before any real users (Gap C2) |
| Media can't be uploaded — editors can't produce real content | High | High | **Critical** | Implement storage + upload route (Gap C1) |
| Edge security gap — CSP not enforced, redirects dead, no active middleware; auth leans entirely on per-handler `requireX()` (one unguarded route = exposure) | Medium | High | **High** | Add root `middleware.ts`; enforce CSP; centralize authz (Gap C3) |
| "Looks done" illusion — passing typecheck/lint + green "integration" tests (actually file-string greps) create false confidence | High | High | **High** | Treat completion docs as claims; build real integration/e2e (Gap H4) |
| Data-integrity erosion — destructive updates wipe child IDs/revisions | Medium | Medium | **Medium** | Move to diff-based updates (Gap M1) |
| Stakeholder trust in fabricated analytics/progress — dashboards show invented numbers | Medium | High | **High** | Gate behind "instrumentation off" or build real pipeline (Gaps H2/H3) |
| Architecture drift — empty `repositories/` while services hit Prisma directly | Medium | Medium | **Medium** | Decide: implement layer or formally retire it in docs (Gap H5) |
| Beta/pinned deps (NextAuth v5 beta, Next 16, Prisma 7, `--legacy-peer-deps`) | Medium | Medium | **Medium** | Pin, monitor, plan upgrades |
| Secrets in tree (`.env`, `.env.local` present) | Medium/Unknown | High | **High** (if tracked) | Confirm gitignored; rotate if leaked |
| OneDrive-backed workspace — slow FS, sync/lock hazards during builds | High | Low | **Low** | Consider a non-synced dev path |
| Search scaling — ILIKE across many tables degrades with volume | Medium | Medium | **Medium** | Move to tsvector + indexes (Gap H1) |

## Top must-fix before any production / user exposure

1. **C2** — real email delivery (auth depends on it).
2. **C1** — real media upload/storage (content depends on it).
3. **C3** — active edge middleware, enforced CSP, enforced redirects.

> These are risk priorities. Actual build order still follows strict MES numerical sequence per directive.
