# MES-015 SEO Center — completion handoff

| Field | Value |
|-------|-------|
| **Completed** | 2026-07-15 |
| **Next** | [MES-016 — Navigation & Menu Management](./engineering/MES-016.md) |

## Architecture

| Concern | Implementation |
|---------|----------------|
| Feature | `features/seo` |
| Shared Service | `services/seo` |
| Models | `GlobalSEOSettings`, `SEOProfile`, `MetadataTemplate`, `Redirect`, `StructuredData`, `RobotsRule`, `SitemapConfiguration` |
| Migration | `20260715210000_mes015_seo_center` |
| Reusable UI | `SeoFieldsPanel` — shared by content editors |

## Surfaces

- `/dashboard/seo` — dashboard widgets (estimates / gaps / redirects / sitemap status)
- `/dashboard/seo/settings` — global SEO defaults
- `/dashboard/seo/templates` — metadata templates with `{title}`, `{category}`, `{topic}`, `{brand}`, `{year}`
- `/dashboard/seo/robots` — robots rules + preview
- `/dashboard/seo/structured-data` — schema previews
- `/dashboard/redirects` — redirect table
- `/dashboard/sitemap` — include/exclude + placeholder regenerate

## Shared across content types

`resolveMetadata()` covers article, guide, ai_tool, category, topic, and **page** (global defaults). Editors use `SeoFieldsPanel` (Articles, Guides, AI Tools) so new types adopt the same SEO surface without bespoke panels.

## Out of scope (as specified)

Real sitemap XML generation, live robots serving, redirect middleware, SEO scoring, Search Console.

## STOP

Ready for **MES-016**. Do not start Navbar Manager until requested.
