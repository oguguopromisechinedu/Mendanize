# Contributor Guide

How to work on Mendanize locally and contribute safely (v1.0).

## Prerequisites

- Node.js 22+
- PostgreSQL (local or hosted)
- Copy `.env.example` → `.env` and fill values ([ENVIRONMENT.md](./ENVIRONMENT.md))

## Quick start

```bash
npm install --legacy-peer-deps
npx prisma generate
npx prisma migrate dev
npm run db:seed   # optional
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

## Architecture rules (non-negotiable)

1. **Shared Services** live under `services/*` — features orchestrate; they do not reimplement Recommendations, Search, Auth session, or AI config.
2. **API envelope:** `{ data, error, meta }` via `lib/api/response` and `handleApiError`.
3. **Standards:** `docs/core/MSEM-Appendix-A-Engineering-Standards.md` — a11y, responsive, security baseline, SEO on public surfaces.
4. **One MES at a time** — follow [MES-INDEX](./engineering/MES-INDEX.md) and [MES-DOCUMENTS-STATUS](./MES-DOCUMENTS-STATUS.md); handoffs live in `docs/MES-XXX-COMPLETION.md`.
5. **Three surfaces:** public Teaching Frontend, `PublicUser` `/account/*`, `Admin`-only `/dashboard/*` (MES-030).

## Folder map

| Path | Role |
|------|------|
| `app/(public)` | Teaching frontend (+ learner `/account/*` where routed) |
| `app/(dashboard)` | Admin dashboard only |
| `app/(auth)` | Sign-in / sign-up / password flows |
| `features/*` | Feature modules (UI + actions) |
| `services/*` | Shared Services |
| `components/*` | Cross-feature UI |
| `docs/` | Specs, standards, status, handoffs |

## Quality gates

```bash
npm test              # unit + integration
npm run typecheck
npm run lint
npm run build
npm run smoke         # requires running server
```

CI: `.github/workflows/ci.yml` (lint/typecheck reported; tests + build gate).

## Docs to read first

- [docs/README.md](./README.md)
- [docs/engineering/MES-INDEX.md](./engineering/MES-INDEX.md) — MES-001 → MES-035
- [docs/MES-DOCUMENTS-STATUS.md](./MES-DOCUMENTS-STATUS.md) — what is next
- [docs/core/MSEM.md](./core/MSEM.md) · [Cursor System Prompt](./core/Cursor-System-Prompt.md)
- [docs/architecture/Module-Map.md](./architecture/Module-Map.md)
- [docs/MES-029-COMPLETION.md](./MES-029-COMPLETION.md) — v1.0 readiness baseline (pre–MES-030+)
