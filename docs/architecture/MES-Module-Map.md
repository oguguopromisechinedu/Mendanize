# MES → Module Map

| Spec | Location |
|------|----------|
| MES-INDEX / Appendix A | `docs/engineering/MES-INDEX.md`, `docs/core/MSEM-Appendix-A-Engineering-Standards.md` |
| MES-001 Foundation | app/ two-surface split, features/, services/ |
| MES-002 Shared Services | services/* |
| MES-003 Design System | styles/, components/ui, lib/design |
| MES-004 Public Website | app/(public)/ |
| MES-005 Premium Homepage | features/homepage-public, app/(public)/page.tsx |
| MES-006 Authentication | features/authentication, app/(auth)/ |
| MES-007 Admin Dashboard | features/admin-dashboard, app/(dashboard)/dashboard |
| MES-008 Articles Admin | features/articles, app/(dashboard)/dashboard/articles |
| MES-009 Categories/Topics | features/categories-topics, app/(dashboard)/dashboard/categories |
| MES-010 Learning Guides Admin | features/learning-guides, app/(dashboard)/dashboard/guides |
| MES-011 AI Studio | features/ai-studio, app/(dashboard)/ai-studio |
| MES-012 AI Tools Mgmt | features/ai-tools, app/(dashboard)/dashboard/ai-tools |
| MES-013 Homepage CMS | features/homepage-management, app/(dashboard)/homepage |
| MES-014 Media Library | features/media-library, app/(dashboard)/media |
| MES-015 SEO Metadata | features/seo, services/seo |
| MES-016 Navigation | features/navigation |
| MES-017 Search Discovery | features/search, services/search |
| MES-018 Recommendations | services/recommendations (+ features/recommendations UI) |
| MES-019 Ask Mendanize | features/ask-mendanize, app/(dashboard)/ask |
| MES-020 Platform Settings | features/platform-settings, services/settings |
| MES-021 Billing | features/billing, app/(public)/pricing |
| MES-022 User Learning | features/user-learning, app/(dashboard)/learning |
| MES-023 Analytics | features/analytics |
| MES-024 Notifications | features/notifications, services/notification, emails/ |
| MES-025 Public Articles | app/(public)/articles |
| MES-026 Public Guides | app/(public)/guides |
| MES-027 Public AI Tools | app/(public)/ai-tools |
| MES-028 Production Readiness | config/, middleware/, scripts/, tests/ |
| MES-029 Final QA / Launch | tests/, scripts/ |

## Next.js path note

Route groups do not affect URLs. Admin **content** modules that share names with public routes are nested under `app/(dashboard)/dashboard/*` (e.g. `/dashboard/articles`) so they do not collide with `app/(public)/articles` (`/articles`). See `docs/APP-ROUTER-PATHS.md`.
