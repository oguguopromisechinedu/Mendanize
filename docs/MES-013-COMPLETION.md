# MES-013 Homepage Content Management — completion handoff

| Field | Value |
|-------|-------|
| **Completed** | 2026-07-15 |
| **Next** | [MES-014 — Media Library](./engineering/MES-014.md) |

## Architecture

| Concern | Implementation |
|---------|----------------|
| Feature | `features/homepage-management` |
| Public render | `features/homepage-public` (MES-005) consumes CMS payload |
| Data | `services/content/homepage.ts` |
| Models | `Homepage`, `HomepageSection`, `HomepageHero`, `HomepageStatistic`, `HomepageFAQ`, `HomepageCTA`, `HomepageFeaturedContent`, `HomepageTestimonial` |
| Migration | `20260715190000_mes013_homepage_cms` |
| Extras | Ask / Why / Newsletter stored as JSON on `Homepage` |

## Surfaces (`/dashboard/homepage`)

- **Overview** — status, section counts, featured summary, preview + publish
- **Sections** — enable/disable, Move up/down reorder, visibility/background/animation/spacing, display limits
- **Hero** — headline, supporting text, CTAs, image, gradient, Ask placeholder
- **Featured** — manual Categories / Articles / Guides / Tools (automatic mode placeholder)
- **Statistics / Testimonials / FAQ / Newsletter / Final CTA / Ask / Why**
- **Preview** — full public `HomepageView` from draft CMS payload

`/homepage` redirects to the gated `/dashboard/homepage` twin.

## Public behavior

- **Published** CMS → drives `/` via `getHomepageContent()`
- **Draft / never published** → MES-005 seed content remains on the public site
- Featured entity IDs resolve through Content Service when records exist; otherwise title overrides / seed cards

## Integration

| Module | How |
|--------|-----|
| **Articles / Guides / Categories / Tools** | Featured pickers + runtime resolution |
| **Navigation** | Homepage admin nav entry; public CTAs point at routes |
| **Ask (MES-019)** | Placeholder / copy managed now; AI wiring later |
| **Analytics (MES-023)** | Stats are manual until auto-calc |
| **Personalization** | Section visibility rules stored for future rules |

## STOP

Ready for **MES-014**. Do not start Media Library until requested.
