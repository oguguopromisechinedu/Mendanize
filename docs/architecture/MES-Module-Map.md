# MES → Module Map

Quick lookup: which folder owns which MES. Full detail: [Module-Map.md](./Module-Map.md). Status: [MES-DOCUMENTS-STATUS.md](../MES-DOCUMENTS-STATUS.md).

| Spec | Location |
|------|----------|
| MES-INDEX / Appendix A | `docs/engineering/MES-INDEX.md`, `docs/core/MSEM-Appendix-A-Engineering-Standards.md` |
| MES-001 Foundation | Three surfaces: `app/(public)`, `/account/*`, `app/(dashboard)`, `features/`, `services/` |
| MES-002 Shared Services | `services/*` |
| MES-003 Design System | `styles/`, `components/ui`, `lib/design` |
| MES-004 Public Website | `app/(public)/` |
| MES-005 Premium Homepage | `features/homepage-public`, `app/(public)/page.tsx` |
| MES-006 Authentication | `features/authentication`, `app/(auth)/` |
| MES-007 Admin Dashboard | `features/admin-dashboard`, `app/(dashboard)/dashboard` |
| MES-008 Articles Admin | `features/articles`, `app/(dashboard)/dashboard/articles` |
| MES-009 Categories/Topics | `features/categories-topics`, `app/(dashboard)/dashboard/categories` |
| MES-010 Learning Guides Admin | `features/learning-guides`, `app/(dashboard)/dashboard/guides` |
| MES-011 AI Studio | `features/ai-studio`, `app/(dashboard)/ai-studio` |
| MES-012 AI Tools Mgmt | `features/ai-tools`, `app/(dashboard)/dashboard/ai-tools` |
| MES-013 Homepage CMS | `features/homepage-management`, `app/(dashboard)/homepage` |
| MES-014 Media Library | `features/media-library`, `app/(dashboard)/media` |
| MES-015 SEO Metadata | `features/seo`, `services/seo` |
| MES-016 Navigation | `features/navigation` |
| MES-017 Search Discovery | `features/search`, `services/search` |
| MES-018 Recommendations | `services/recommendations` (+ `features/recommendations` UI) |
| MES-019 Ask Mendanize | `features/ask-mendanize`, `app/(dashboard)/ask` |
| MES-020 Platform Settings | `features/platform-settings`, `services/settings` |
| MES-021 Billing | `features/billing`, `/pricing`, `/account/billing` |
| MES-022 User Learning | `features/user-learning`, `/account/*` |
| MES-023 Analytics | `features/analytics` |
| MES-024 Notifications | `features/notifications`, `services/notification`, `emails/` |
| MES-025 Public Articles | `app/(public)/articles` |
| MES-026 Public Guides | `app/(public)/guides` |
| MES-027 Public AI Tools | `app/(public)/ai-tools` |
| MES-028 Production Readiness | `config/`, `middleware/`, `scripts/`, `tests/` |
| MES-029 Final QA / Launch | `tests/`, `scripts/` |
| MES-030 Dual Auth retrofit | `features/authentication`, Prisma `PublicUser`/`Admin` sessions |
| MES-031 AI Knowledge Pipeline | Admin AI Knowledge Center (reuses MES-011); service enqueue from Ask |
| MES-032 Observability | Logging / Audit services + Admin status / log views |
| MES-033 Caching | Next.js / Content Service cache + publish invalidation |
| MES-034 Backup & Recovery | Ops docs + Supabase backup/restore runbook |
| MES-035 Privacy Basics | Consent, export/delete under `/account`, privacy policy page |

## Next.js path note

Route groups do not affect URLs. Admin **content** modules that share names with public routes are nested under `app/(dashboard)/dashboard/*` (e.g. `/dashboard/articles`) so they do not collide with `app/(public)/articles` (`/articles`). Learner account features live under `/account/*`, never Admin-only `/dashboard/*`. See [App-Router-Paths.md](./App-Router-Paths.md).
