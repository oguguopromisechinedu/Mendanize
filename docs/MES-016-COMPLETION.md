# MES-016 Navigation & Menu Management — completion handoff

| Field | Value |
|-------|-------|
| **Completed** | 2026-07-15 |
| **Next** | [MES-017 — Search & Discovery](./engineering/MES-017.md) |

## Architecture

| Concern | Implementation |
|---------|----------------|
| Feature | `features/navigation` |
| Shared Service | `services/navigation` (+ `getNavigationConfig` in `services/settings/navigation`) |
| Models | `NavigationSiteSettings`, `NavigationMenu`, `MenuItem`, `MenuLocation`, `SocialLink`, `LegalLink` |
| Migration | `20260715220000_mes016_navigation` |
| Reusable UI | `MenuBuilder` — shared by Main / Mobile / Footer / Quick links / Utility |

## Surfaces

- `/dashboard/navigation` — overview (menus, locations, counts)
- `/dashboard/navigation/main` — main menu builder
- `/dashboard/navigation/mobile` — mobile menu builder (independent)
- `/dashboard/navigation/footer` — footer columns (parent = column, children = links)
- `/dashboard/navigation/quick-links` · `/utility` — lightweight menu builders
- `/dashboard/navigation/legal` · `/social` — ordered link lists
- `/dashboard/navigation/locations` — assign menus to MAIN / MOBILE / FOOTER / UTILITY / QUICK_LINKS
- `/dashboard/navigation/settings` — brand, sign-in, copyright, newsletter placeholder

## Public layout

`getNavigationConfig()` prefers persisted CMS data (seeded from MES-004 defaults on first read). `PublicHeader` / `PublicFooter` consume that config — nesting, badges, open-in-new-tab, and separate mobile trees are supported.

## Out of scope (as specified)

Live drag-and-drop library (keyboard Move up/down provided), entity pickers for Article/Category/etc. beyond id/href fields, wiring Quick Links / Utility into the public chrome beyond the location system.

## STOP

Ready for **MES-017**. Do not start Search & Discovery until requested.
