# MES-027 Public AI Tools Directory — completion handoff

| Field | Value |
|-------|-------|
| **Completed** | 2026-07-15 |
| **Next** | [MES-028 — Performance, Security & Production Readiness](./engineering/MES-028.md) |

## Architecture

| Concern | Implementation |
|---------|----------------|
| Feature UI | `features/ai-tools/components/public/*` |
| Shared Service | `services/content` (`getPublishedToolBySlug`, `listPublishedTools`, filters on `listToolsAdmin`) |
| SEO | `resolveMetadata({ entityType: "ai_tool" })` + SoftwareApplication + BreadcrumbList |
| Recommendations | MES-018 only (`contextType: "tool"`) |
| Ask | `AskContextualWidget` Tier 1 (`AI_TOOL`) |
| Layout | `PageShell` with `hideHeader` |

## Surfaces

| Route | Role |
|-------|------|
| `/ai-tools` | Directory — grid/list, search, filters, sort, pagination, featured, comparison placeholder |
| `/ai-tools/[slug]` | Tool details, learning panel, Ask, related resources, comparison placeholder |

## Directory filters

Category, Topic, Pricing, Platform, Difficulty, Featured, Recently Added / Alphabetical / Featured-first sort. Client-side filter UX over published `ToolRecord`s; server also accepts `difficulty` / `platform` on `ToolListParams`.

## Integrations

| Module | How |
|--------|-----|
| **Articles / Guides** | Related rail via Recommendations Service |
| **Categories / Topics** | Filter dropdowns from Content Service summaries |
| **Search** | Tool discovery remains in public search surfaces |
| **SEO (MES-015)** | Canonical, OG/Twitter, SoftwareApplication JSON-LD |
| **Analytics / Learning** | Authenticated views call `trackContentView` (`ai_tool`) |
| **Ask (MES-019)** | Explain / Compare / Recommend suggestions |
| **CMS (MES-012)** | Same Content Service; public serves `PUBLISHED` only |

## Out of scope (as specified)

User reviews, ratings, bookmarks, real comparison engine, affiliate tracking.

## STOP

Ready for **MES-028**. Do not start Performance, Security & Production Readiness until requested.
