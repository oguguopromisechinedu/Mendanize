# Restore Runbook (MES-034)

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Last Updated** | 2026-07-23 |
| **Owner** | Platform / Super Administrator |

## Purpose

Document how to restore Mendanize data after accidental deletion or a bad migration. Mendanize uses **Supabase Postgres + Storage** — we rely on Supabase’s built-in backups rather than a custom backup service.

## Coverage

| Data | Location | Backup |
|------|----------|--------|
| Database (content, users, settings, dual-auth tables) | Supabase Postgres | Plan automated daily backups / PITR (confirm tier) |
| Media assets | Supabase Storage buckets | Storage redundancy + bucket restore path |
| Platform / design settings | DB-backed | Covered by DB backup |

## Before risky changes

1. Announce a maintenance window if needed.
2. Take a **manual snapshot** (Supabase Dashboard → Database → Backups / or `pg_dump` of production).
3. Record the migration name and operator in the Activity Log (or ops channel).
4. Prefer dry-run on a staging clone first.

## Restore procedure (database)

1. **Authority:** only a Super Administrator (or designated ops owner) may trigger a restore. Log the decision.
2. Open Supabase project → **Database → Backups** (or Point-in-Time Recovery if on a tier that includes it).
3. Select the restore point **before** the incident.
4. Restore to a **new** database instance when possible; validate, then cut over — avoid blind overwrite of a live bad state without a second snapshot.
5. After restore:
   - Run `npx prisma migrate status` (or deploy’s migrate step) to confirm schema matches the app version.
   - Spot-check: Admin login, a published Article, a `PublicUser` account, Media asset URL, Homepage CMS.
6. Record completion in Audit / ops notes: who, when, which backup id.

## Restore procedure (media)

1. If a Storage bucket was misconfigured or wiped, restore from Supabase Storage backup / prior version if available.
2. Reconcile `MediaAsset` rows with object keys in the bucket.
3. Re-test public article featured images and Media Library list.

## Verification checklist

- [ ] `/api/health` returns `database: ok`
- [ ] Admin dashboard loads; dual-auth still isolates Public vs Admin
- [ ] Sample Article / Guide / AI Tool pages render
- [ ] Learner `/account` and Admin `/dashboard` still use correct sessions
- [ ] No orphan FKs after schema-level restores (Prisma generate + smoke)

## What we do not build (yet)

Custom multi-region replication, Recovery Center UI, automated recovery-testing suite, contractual RTO/RPO — revisit when enterprise DR contracts require them.

## Related

- [MES-034](../engineering/MES-034.md)
- [ENVIRONMENT.md](../ENVIRONMENT.md)
- [DEPLOYMENT.md](../DEPLOYMENT.md)
