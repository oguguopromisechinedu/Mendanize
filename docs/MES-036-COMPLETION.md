# MES-036 Completion Handoff — Community Platform (Phase 1)

| Field | Value |
|-------|-------|
| **Spec** | [MES-036](./engineering/MES-036.md) |
| **Status** | Complete (MVP) |
| **Date** | 2026-07-26 |

## Delivered

- Prisma models + migration `20260726170000_mes036_community` (categories, discussions/replies/likes, study groups, teams with Owner/Lead/Member, showcase projects + Learning Guide link, profile, moderator flag, reports)
- Module service: `services/community`
- Feature UI + server actions: `features/community`
- Public Teaching Frontend: `/community` (home, discussions, groups, teams, projects, search, guidelines, profile)
- Admin domain: `/dashboard/community` (reports, categories, featured projects, grant/revoke community moderator flag)
- Nav: Community added to seeded primary navigation (MES-016) and admin Growth & Engagement group
- Search Service extended with community entity types (discussions, groups, teams, projects)
- Notifications for replies / joins / project feedback via existing Notification Service
- Ask Mendanize AI linked from discussions (reuses `/ask`, Tier 2 for signed-in PublicUsers)
- Placeholders: events, learning progress, certificates, team Tasks/Files — no fabricated numbers

## Dual-auth boundary

- Write actions require `PublicUser` session (`getPublicSession`)
- Admin moderation requires `requireEditor()` (Admin session)
- `CommunityModeratorFlag` only enables hide/report flows under `/community` — never grants `/dashboard/*`
- `/account/community` redirects learners to `/community/profile`

## Apply migration

```bash
npx prisma migrate deploy
```

## STOP

Community Phase 1 MVP complete. Wait for approval before messaging, events, or real progress/certificate integration.
