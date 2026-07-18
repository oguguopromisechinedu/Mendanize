# Database Architecture

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Last Updated** | 2026-07-14 |
| **Owner** | Mendanize Platform Architecture |


## Purpose

Define persistence standards for Mendanize: PostgreSQL via Prisma, modeling guidelines, migration policy, and how features access data through repositories/Shared Services.


## Scope

Schema ownership, migrations, seeding, indexing, soft deletes, multi-tenancy assumptions (single-tenant SaaS), and connection configuration.


## Dependencies

- [MSEM-Appendix-A-Engineering-Standards.md](../core/MSEM-Appendix-A-Engineering-Standards.md)
- [MES-002-Shared-Services.md](../engineering/MES-002.md)
- [SECURITY-STANDARDS.md](./Security-Standards.md)
- [ENVIRONMENT.md](../ENVIRONMENT.md)


## Stack

- **Database:** PostgreSQL (Supabase or compatible)
- **ORM:** Prisma (`prisma/`)
- **Access path:** Route/Action → Feature orchestration → Shared Service → Repository/Prisma
- **Forbidden:** UI components importing Prisma client directly


## Core Domain Groups

| Domain | Representative models | Owning specs |
|--------|----------------------|--------------|
| Identity | User, Account, Session | MES-006 |
| Content | Article/Post, Guide, Category, Topic, Tag | MES-008–010, 012, 013 |
| Media | Asset, AssetVariant | MES-014 |
| SEO | SeoMetadata | MES-015 |
| Learning | Progress, Bookmark | MES-022 |
| Billing | Customer, Subscription, Entitlement | MES-021 |
| Notifications | Notification, Preference | MES-024 |
| Settings | PlatformSetting | MES-020 |
| Analytics | Event (or external) | MES-023 |


## Implementation Notes

- Prefer additive migrations; destructive changes require explicit expand/contract plan.
- Use UUID or cuid IDs consistently.
- Index foreign keys and frequent filter columns (`slug`, `status`, `publishedAt`).
- Soft-delete content entities when public URLs must redirect or 404 intentionally.
- Seed scripts in `prisma/seed.ts` for local/dev only — never production secrets.
- Connection pooling required in serverless (Prisma adapter / Supabase pooler).


## Related Documents

- [Environment](../ENVIRONMENT.md)
- [Security Standards](./Security-Standards.md)
- [Deployment](../DEPLOYMENT.md)
