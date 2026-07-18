# MES-004 Public Website Structure — completion handoff

| Field | Value |
|-------|-------|
| **Completed** | 2026-07-15 |
| **Next** | [MES-005 — Premium Homepage Experience](./engineering/MES-005.md) |
| **Do not start** | MES-006+ until MES-005 is done (auth can proceed in parallel only if MES-INDEX dependencies allow — prefer sequential) |

## Components

| Piece | Location |
|-------|----------|
| Public shell | `components/layout/PublicLayout.tsx` |
| Sticky header + mobile drawer | `components/layout/PublicHeader.tsx` |
| Footer (brand / categories / resources / company / legal / social / newsletter placeholder) | `components/layout/PublicFooter.tsx` |
| Page container + breadcrumb | `components/layout/PageShell.tsx` |
| Search modal UI | `components/layout/SearchModal.tsx` |
| Theme toggle UI | `components/ui/ThemeToggle.tsx` |

Route group wiring: `app/(public)/layout.tsx` → `PublicLayout`.

## Navigation (not hardcoded in UI)

Seed + accessor: `services/settings/navigation.ts` → `getNavigationConfig()`.

Primary links and footer sections load through Settings Service. Admin Persistence / Navigation Manager editing lands later (MES-016).

## Routes (placeholders)

| URL | File |
|-----|------|
| `/` | `app/(public)/page.tsx` — shell only, **no homepage sections** |
| `/learn` | `app/(public)/learn/page.tsx` |
| `/guides` | `app/(public)/guides/page.tsx` |
| `/categories` | `app/(public)/categories/page.tsx` |
| `/ai-tools` | `app/(public)/ai-tools/page.tsx` |
| `/about` | `app/(public)/about/page.tsx` |
| `/contact` | `app/(public)/contact/page.tsx` |
| `/search` | `app/(public)/search/page.tsx` |

## Layout architecture

```
PublicLayout (server)
  ├─ getNavigationConfig()
  ├─ PublicHeader (client) — sticky, desktop nav, search modal, theme, sign-in, sheet
  ├─ <main id="main-content">{children}</main>
  └─ PublicFooter (server) — seeded sections + newsletter placeholder
```

`PageShell` provides standard/wide/full container widths, hero slot, and reusable breadcrumbs for future pages.

## Future integration points

- **MES-005** — replace `/` placeholder content with premium homepage sections (keep this shell).
- **MES-016 / MES-020** — persist nav/footer from dashboard into Settings.
- **MES-017** — wire SearchModal + `/search` to Search Shared Service (spec text said MES-016; MES-INDEX owns search at MES-017).
- **MES-025 / 026 / 027** — fill articles / guides / AI tools experiences under the same layout.

## STOP

Ready for **MES-005**. Do not build homepage sections until that spec.
