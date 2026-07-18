# Administrator Guide

Operational guide for Mendanize editors and platform admins (v1.0).

## Access

- Admin shell: `/dashboard` (MES-007)
- Auth: Auth.js (MES-006) — invite or seed an admin user; assign roles via Platform Settings / users

## Content workflows

| Area | Path | Notes |
|------|------|-------|
| Articles | `/dashboard/articles` | Draft → review → publish; public at `/articles/[slug]` |
| Guides | `/dashboard/guides` | Sections + lessons; public overview + lesson routes |
| AI Tools | `/dashboard/ai-tools` | Curate tools; public directory `/ai-tools` |
| Categories / Topics | `/dashboard/categories` | Taxonomies shared across content |
| Homepage | `/dashboard/homepage` | CMS blocks for the teaching homepage |
| Media | `/dashboard/media` | Library for images/assets |
| SEO | `/dashboard/seo` | Templates, overrides, audits |
| Navigation | `/dashboard/navigation` | Drives public header/footer |
| Search settings | `/dashboard/search-settings` | Search ranking / discovery config |

## AI & Assist

- **Canonical AI config:** `/dashboard/settings/ai` — providers, defaults, rate-limit placeholders. Do not add parallel AI settings screens.
- AI Studio: `/dashboard/ai-studio` — authoring assist (uses shared AI config)
- Ask Mendanize: public Tier 1 widgets + dashboard Tier 2 conversations

## Platform

| Area | Path |
|------|------|
| Branding / design | `/dashboard/settings` (design) |
| Billing | `/dashboard/settings/billing` |
| Analytics | `/dashboard/analytics` |
| Notifications | `/dashboard/notifications` |
| Maintenance / announcements | Platform Settings |

## Incident basics

1. Check `GET /api/health`
2. Review hosting logs / structured logger output
3. Toggle maintenance announcement if needed
4. Follow [LAUNCH-CHECKLIST.md](./LAUNCH-CHECKLIST.md) rollback section
