# Deployment Guide

| Field | Value |
|-------|-------|
| **Version** | 1.2.0 |
| **Status** | Approved — v1.0 production release |
| **Last Updated** | 2026-07-16 |
| **Owner** | Mendanize Platform Architecture |

## Purpose

Describe how Mendanize is built, migrated, and deployed to production environments.

## Scope

Vercel (or equivalent) hosting, Prisma migrate deploy, environment promotion, rollback, and smoke checks post-deploy.

## Dependencies

- [ENVIRONMENT.md](./ENVIRONMENT.md)
- [FINAL-DEPLOYMENT-CHECKLIST.md](./FINAL-DEPLOYMENT-CHECKLIST.md) — **use this for v1.0 go-live**
- [LAUNCH-CHECKLIST.md](./LAUNCH-CHECKLIST.md)
- [MES-028](./engineering/MES-028.md) · [MES-028 completion](./MES-028-COMPLETION.md)
- [MES-029](./engineering/MES-029.md) · [MES-029 completion / v1.0 report](./MES-029-COMPLETION.md)
- [DATABASE.md](./standards/Database.md)

## Pipeline

1. CI: install → lint → typecheck → test → build (see `.github/workflows/ci.yml`)
2. Preview deploy for PRs
3. Apply migrations (`npx prisma migrate deploy`) against target DB
4. Promote to production
5. Run smoke checklist — [FINAL-DEPLOYMENT-CHECKLIST.md](./FINAL-DEPLOYMENT-CHECKLIST.md) / `npm run smoke`
6. Monitor errors/latency

## Implementation Notes

- `prisma generate` runs as part of build (`package.json` scripts).
- Install with `npm ci --legacy-peer-deps` (matches CI).
- Never run destructive migrate reset against production.
- Stripe, Auth, and AI keys must be environment-specific.
- **AI at v1.0:** `OPENAI_API_KEY` only; Claude/Gemini/Grok reserved/stubbed.
- Keep `NEXT_PUBLIC_*` free of secrets.
- Rollback: revert deployment + forward-fix DB when possible; keep expand/contract migrations.
- Health probe: `GET /api/health`

## Related Documents

- [Final Deployment Checklist (v1.0)](./FINAL-DEPLOYMENT-CHECKLIST.md)
- [Environment](./ENVIRONMENT.md)
- [Administrator Guide](./ADMINISTRATOR.md)
- [Contributor Guide](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)
